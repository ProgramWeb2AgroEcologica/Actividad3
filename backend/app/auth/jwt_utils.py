import functools
from datetime import datetime, timedelta, timezone
import jwt
from flask import current_app, g, jsonify, request

def generar_tokens(user_id: str, email: str, rol: str = "authenticated", nombre: str = ""):
    """
    Genera el par de tokens:
    1. Access Token: Corta duración (~15 min), firmado con claims de identidad y rol.
    2. Refresh Token: Larga duración (7 días), exclusivo para renovar sin pedir credenciales.
    """
    ahora = datetime.now(timezone.utc)
    jwt_secret = current_app.config["SUPABASE_JWT_SECRET"]
    algoritmo = current_app.config["JWT_ALGORITHM"]
    audience = current_app.config["JWT_AUDIENCE"]
    issuer = current_app.config["JWT_ISSUER"]

    # 1. Payload de Access Token
    exp_access = ahora + timedelta(minutes=current_app.config["ACCESS_TOKEN_EXPIRE_MINUTES"])
    access_payload = {
        "sub": str(user_id),
        "email": email,
        "role": rol,
        "nombre": nombre,
        "token_use": "access",
        "aud": audience,
        "iss": issuer,
        "iat": int(ahora.timestamp()),
        "exp": int(exp_access.timestamp())
    }
    access_token = jwt.encode(access_payload, jwt_secret, algorithm=algoritmo)

    # 2. Payload de Refresh Token
    exp_refresh = ahora + timedelta(days=current_app.config["REFRESH_TOKEN_EXPIRE_DAYS"])
    refresh_payload = {
        "sub": str(user_id),
        "email": email,
        "role": rol,
        "token_use": "refresh",
        "aud": audience,
        "iss": issuer,
        "iat": int(ahora.timestamp()),
        "exp": int(exp_refresh.timestamp())
    }
    refresh_token = jwt.encode(refresh_payload, jwt_secret, algorithm=algoritmo)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "expires_in": current_app.config["ACCESS_TOKEN_EXPIRE_MINUTES"] * 60,
        "user": {
            "id": str(user_id),
            "email": email,
            "rol": rol,
            "nombre": nombre
        }
    }


def verificar_token(token: str, token_use_esperado: str = "access"):
    """
    Ejecuta las 5 comprobaciones de seguridad exigidas por la cátedra:
    1. Formato de token: Estructura de 3 partes Base64 (header.payload.signature).
    2. Firma criptográfica: Comprobada contra la clave secreta / pública.
    3. Expiración temporal: Margen de vigencia considerando leeway (tolerancia de 10s).
    4. Audiencia y Emisor: aud = 'authenticated', iss = 'supabase' / 'upds'.
    5. Propósito del token: Uso correcto (access vs. refresh).
    """
    if not token or not isinstance(token, str):
        return None, ("El token está mal formado", 401)

    partes = token.strip().split(".")
    if len(partes) != 3:
        return None, ("El token está mal formado", 401)

    jwt_secret = current_app.config["SUPABASE_JWT_SECRET"]
    algoritmo = current_app.config["JWT_ALGORITHM"]
    audience = current_app.config["JWT_AUDIENCE"]
    issuer = current_app.config["JWT_ISSUER"]
    leeway = current_app.config.get("JWT_LEEWAY_SECONDS", 10)

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=[algoritmo],
            audience=audience,
            issuer=issuer,
            leeway=leeway,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": True,
                "verify_iss": True
            }
        )

        # Validar tipo de uso del token
        token_use = payload.get("token_use")
        if token_use != token_use_esperado:
            return None, (f"Tipo de token incorrecto. Se esperaba '{token_use_esperado}' pero se recibió '{token_use}'", 401)

        return payload, None

    except jwt.ExpiredSignatureError:
        return None, ("El token ha expirado", 401)
    except jwt.InvalidSignatureError:
        # Requerimiento exacto del docente en clase (línea 373 de la transcripción):
        return None, ("La firma del token no es válida", 401)
    except (jwt.InvalidAudienceError, jwt.InvalidIssuerError) as e:
        return None, (f"Reclamo de emisor o audiencia inválido: {str(e)}", 401)
    except jwt.DecodeError:
        return None, ("El token está mal formado", 401)
    except Exception as e:
        return None, (f"Error de validación del token: {str(e)}", 401)


def token_required(f):
    """
    Decorador @token_required:
    Examina el encabezado HTTP 'Authorization: Bearer <token>', valida la integridad
    del JWT y almacena el usuario autenticado en el contexto global de Flask 'g.current_user'.
    """
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return jsonify({
                "error": "No autorizado",
                "mensaje": "Token de autorización requerido en el encabezado Authorization"
            }), 401

        partes = auth_header.split(" ")
        if len(partes) != 2 or partes[0].lower() != "bearer":
            return jsonify({
                "error": "No autorizado",
                "mensaje": "Formato de autorización inválido. Debe ser: Bearer <token>"
            }), 401

        token = partes[1]
        payload, error = verificar_token(token, token_use_esperado="access")
        if error:
            mensaje_error, status_code = error
            return jsonify({
                "error": "No autorizado",
                "mensaje": mensaje_error
            }), status_code

        # Inyectar usuario en el contexto de Flask g
        g.current_user = {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "rol": payload.get("role", "authenticated"),
            "nombre": payload.get("nombre", ""),
            "exp": payload.get("exp"),
            "raw_token": token
        }

        return f(*args, **kwargs)

    return wrapper
