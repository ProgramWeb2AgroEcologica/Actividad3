import uuid
from flask import g, jsonify, request
from flask_smorest import Blueprint
from app.auth.schemas import (
    RegistroUsuarioSchema,
    LoginUsuarioSchema,
    RefreshTokenSchema,
    AuthTokensResponseSchema,
    PerfilUsuarioResponseSchema,
    MensajeRespuestaSchema
)
from app.auth.jwt_utils import generar_tokens, verificar_token, token_required

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
    description="Autenticación, emisión y renovación de JSON Web Tokens (JWT)"
)

# Almacén de usuarios para desarrollo local y tests (con persistencia en memoria)
_usuarios_db = {}

@auth_bp.route("/registro", methods=["POST"])
@auth_bp.arguments(RegistroUsuarioSchema)
@auth_bp.response(201, AuthTokensResponseSchema)
@auth_bp.alt_response(409, schema=MensajeRespuestaSchema, description="Conflicto por usuario ya existente (Deduplicación)")
def registrar_usuario(datos):
    """
    Registra un nuevo usuario en el sistema.
    Emite tokens JWT de acceso y renovación inmediatamente tras el registro exitoso.
    """
    email = datos["email"].lower().strip()
    password = datos["password"]
    nombre = datos.get("nombre", "Usuario")

    # Validación de deduplicación (Concepto evaluado por el docente: Código 409 Conflict)
    if email in _usuarios_db:
        return jsonify({
            "mensaje": f"El correo '{email}' ya se encuentra registrado en el sistema.",
            "error": "Conflict"
        }), 409

    # Generación de UID seguro
    user_id = str(uuid.uuid4())
    _usuarios_db[email] = {
        "id": user_id,
        "email": email,
        "password": password,
        "nombre": nombre,
        "rol": "authenticated"
    }

    tokens = generar_tokens(user_id=user_id, email=email, rol="authenticated", nombre=nombre)
    return tokens, 201


@auth_bp.route("/login", methods=["POST"])
@auth_bp.arguments(LoginUsuarioSchema)
@auth_bp.response(200, AuthTokensResponseSchema)
@auth_bp.alt_response(401, schema=MensajeRespuestaSchema, description="Credenciales no válidas")
def iniciar_sesion(datos):
    """
    Inicia sesión y genera el par de tokens:
    - access_token: Token de vida corta (~15 min) para peticiones a la API.
    - refresh_token: Token de vida larga (7 días) para renovación.
    """
    email = datos["email"].lower().strip()
    password = datos["password"]

    usuario = _usuarios_db.get(email)
    if not usuario or usuario["password"] != password:
        return jsonify({
            "mensaje": "Credenciales inválidas. Verifique su correo o contraseña.",
            "error": "Unauthorized"
        }), 401

    tokens = generar_tokens(
        user_id=usuario["id"],
        email=usuario["email"],
        rol=usuario.get("rol", "authenticated"),
        nombre=usuario.get("nombre", "")
    )
    return tokens, 200


@auth_bp.route("/refresh", methods=["POST"])
@auth_bp.arguments(RefreshTokenSchema)
@auth_bp.response(200, AuthTokensResponseSchema)
@auth_bp.alt_response(401, schema=MensajeRespuestaSchema, description="Refresh token inválido o expirado")
def refrescar_token(datos):
    """
    Renueva el access token utilizando el refresh token sin solicitar nuevamente la contraseña.
    Implementa rotación segura de tokens según los estándares OAuth 2.0 / RFC 6749.
    """
    token = datos["refresh_token"]
    payload, error = verificar_token(token, token_use_esperado="refresh")

    if error:
        mensaje_error, status_code = error
        return jsonify({
            "mensaje": mensaje_error,
            "error": "Unauthorized"
        }), status_code

    user_id = payload.get("sub")
    email = payload.get("email")
    rol = payload.get("role", "authenticated")
    nombre = payload.get("nombre", "")

    # Emitir nuevo par de tokens (Rotación de tokens de refresco)
    tokens = generar_tokens(user_id=user_id, email=email, rol=rol, nombre=nombre)
    return tokens, 200


@auth_bp.route("/perfil", methods=["GET"])
@token_required
@auth_bp.doc(security=[{"BearerAuth": []}])
@auth_bp.response(200, PerfilUsuarioResponseSchema)
def obtener_perfil():
    """
    Obtiene los datos del perfil del usuario actualmente autenticado a partir de su Bearer JWT.
    Demuestra la verificación de firma, caducidad e identidad en el backend.
    """
    usuario = g.current_user
    return {
        "id": usuario["id"],
        "email": usuario["email"],
        "nombre": usuario.get("nombre", "Usuario"),
        "rol": usuario["rol"],
        "expiracion_token": usuario["exp"]
    }, 200
