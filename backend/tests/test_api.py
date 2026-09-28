from datetime import datetime, timedelta, timezone
import jwt
from app.auth.jwt_utils import generar_tokens

# ==============================================================================
# SECCIÓN 1: SALUD Y DIAGNÓSTICO
# ==============================================================================

def test_01_salud_health_check(client):
    """Prueba 01: El endpoint /api/salud debe retornar 200 y status 'healthy'."""
    res = client.get("/api/salud")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert "version" in data


# ==============================================================================
# SECCIÓN 2: AUTENTICACIÓN, DEDUPLICACIÓN Y JWT
# ==============================================================================

def test_02_registro_usuario_exitoso(client):
    """Prueba 02: Registro de nuevo usuario retorna 201 y emite tokens JWT."""
    res = client.post("/api/auth/registro", json={
        "email": "estudiante_nuevo@upds.edu.bo",
        "password": "PasswordSegura123!",
        "nombre": "Estudiante UPDS"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "Bearer"


def test_03_registro_usuario_duplicado_409_deduplicacion(client):
    """Prueba 03: Registro de correo duplicado devuelve 409 Conflict (Deduplicación)."""
    payload = {
        "email": "zamorano@upds.edu.bo",
        "password": "Password123!",
        "nombre": "Zamorano"
    }
    res1 = client.post("/api/auth/registro", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/registro", json=payload)
    assert res2.status_code == 409
    data = res2.get_json()
    assert data["error"] == "Conflict"


def test_04_login_credenciales_correctas(client):
    """Prueba 04: Login con credenciales válidas retorna 200 y access/refresh tokens."""
    client.post("/api/auth/registro", json={
        "email": "docente@upds.edu.bo",
        "password": "PasswordValida123!",
        "nombre": "Ing. Requena"
    })

    res = client.post("/api/auth/login", json={
        "email": "docente@upds.edu.bo",
        "password": "PasswordValida123!"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_05_login_password_incorrecto_401(client):
    """Prueba 05: Login con contraseña incorrecta devuelve 401 Unauthorized."""
    client.post("/api/auth/registro", json={
        "email": "usuario_test@upds.edu.bo",
        "password": "CorrectPassword123!"
    })

    res = client.post("/api/auth/login", json={
        "email": "usuario_test@upds.edu.bo",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data["error"] == "Unauthorized"


def test_06_endpoint_protegido_sin_token_401(client):
    """Prueba 06: Acceso a /api/auth/perfil sin cabecera Authorization devuelve 401."""
    res = client.get("/api/auth/perfil")
    assert res.status_code == 401
    data = res.get_json()
    assert "Token de autorización requerido" in data["mensaje"]


def test_07_token_alterado_firma_invalida_401(client, ana_auth):
    """
    Prueba 07 (Requerimiento explícito docente en clase):
    Modificar o alterar un caracter de la firma del token provoca fallo criptográfico
    y responde 401 con el mensaje exacto 'La firma del token no es válida'.
    """
    token_original = ana_auth["tokens"]["access_token"]
    partes = token_original.split(".")
    sig = partes[2]
    char_a_cambiar = sig[5]
    char_nuevo = "A" if char_a_cambiar != "A" else "B"
    sig_alterada = sig[:5] + char_nuevo + sig[6:]
    token_alterado = f"{partes[0]}.{partes[1]}.{sig_alterada}"

    res = client.get("/api/auth/perfil", headers={"Authorization": f"Bearer {token_alterado}"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["mensaje"] == "La firma del token no es válida"


def test_08_token_expirado_401(client, app):
    """Prueba 08: Acceso con token con fecha 'exp' vencida devuelve 401 'El token ha expirado'."""
    jwt_secret = app.config["SUPABASE_JWT_SECRET"]
    ahora = datetime.now(timezone.utc)
    token_vencido = jwt.encode({
        "sub": "usuario-vencido",
        "email": "vencido@upds.edu.bo",
        "role": "authenticated",
        "token_use": "access",
        "aud": app.config["JWT_AUDIENCE"],
        "iss": app.config["JWT_ISSUER"],
        "iat": int((ahora - timedelta(hours=2)).timestamp()),
        "exp": int((ahora - timedelta(hours=1)).timestamp())
    }, jwt_secret, algorithm="HS256")

    res = client.get("/api/auth/perfil", headers={"Authorization": f"Bearer {token_vencido}"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["mensaje"] == "El token ha expirado"


def test_09_refresh_token_renovacion_exitosa(client, ana_auth):
    """Prueba 09: Renovar token con refresh_token emite un nuevo access_token sin contraseña."""
    refresh_token = ana_auth["tokens"]["refresh_token"]
    res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    data = res.get_json()
    assert "access_token" in data
    assert data["access_token"] != ana_auth["tokens"]["access_token"]


# ==============================================================================
# SECCIÓN 3: LABORATORIO RLS — AISLAMIENTO ANA VS BETO
# ==============================================================================

def test_10_crear_tarea_propia_201(client, ana_auth):
    """Prueba 10: Ana crea una nueva tarea propia; la API responde 201 y asocia su user_id."""
    res = client.post("/api/tareas", json={
        "titulo": "Preparar informe Actividad 3",
        "descripcion": "Incluir matriz de trazabilidad y checklist OWASP",
        "completada": False
    }, headers=ana_auth["headers"])

    assert res.status_code == 201
    data = res.get_json()
    assert data["titulo"] == "Preparar informe Actividad 3"
    assert data["user_id"] == ana_auth["user_id"]
    assert data["completada"] is False


def test_11_listar_tareas_usuario_solo_propias(client, ana_auth, beto_auth):
    """Prueba 11: GET /api/tareas filtra por RLS; Ana solo ve sus propias tareas."""
    client.post("/api/tareas", json={"titulo": "Tarea 1 de Ana"}, headers=ana_auth["headers"])
    client.post("/api/tareas", json={"titulo": "Tarea 2 de Ana"}, headers=ana_auth["headers"])
    client.post("/api/tareas", json={"titulo": "Tarea única de Beto"}, headers=beto_auth["headers"])

    # Ana lista tareas
    res_ana = client.get("/api/tareas", headers=ana_auth["headers"])
    assert res_ana.status_code == 200
    tareas_ana = res_ana.get_json()
    assert len(tareas_ana) == 2
    for t in tareas_ana:
        assert t["user_id"] == ana_auth["user_id"]

    # Beto lista tareas
    res_beto = client.get("/api/tareas", headers=beto_auth["headers"])
    assert res_beto.status_code == 200
    tareas_beto = res_beto.get_json()
    assert len(tareas_beto) == 1
    assert tareas_beto[0]["user_id"] == beto_auth["user_id"]


def test_12_aislamiento_rls_beto_no_ve_tarea_de_ana_404(client, ana_auth, beto_auth):
    """
    Prueba 12 (Pregunta clave de cátedra):
    Beto intenta leer la tarea de Ana mediante GET /api/tareas/<id_Ana>.
    Debe responder 404 (Not Found) y NO 403 (Forbidden).
    Razón de seguridad: El Row Level Security hace invisible el registro ajeno;
    responder 404 previene ataques de enumeración de recursos privados.
    """
    crear_res = client.post("/api/tareas", json={
        "titulo": "Tarea confidencial de Ana"
    }, headers=ana_auth["headers"])
    id_tarea_ana = crear_res.get_json()["id"]

    # Beto intenta acceder a la tarea de Ana
    res_beto = client.get(f"/api/tareas/{id_tarea_ana}", headers=beto_auth["headers"])
    assert res_beto.status_code == 404
    data = res_beto.get_json()
    assert data["error"] == "Not Found"


def test_13_aislamiento_rls_beto_no_puede_actualizar_tarea_de_ana_404(client, ana_auth, beto_auth):
    """Prueba 13: Beto intenta modificar con PATCH una tarea ajena y recibe 404."""
    crear_res = client.post("/api/tareas", json={
        "titulo": "Tarea intacta de Ana",
        "completada": False
    }, headers=ana_auth["headers"])
    id_tarea_ana = crear_res.get_json()["id"]

    res_beto = client.patch(
        f"/api/tareas/{id_tarea_ana}",
        json={"completada": True},
        headers=beto_auth["headers"]
    )
    assert res_beto.status_code == 404


def test_14_aislamiento_rls_beto_no_puede_eliminar_tarea_de_ana_404(client, ana_auth, beto_auth):
    """Prueba 14: Beto intenta borrar con DELETE una tarea ajena y recibe 404."""
    crear_res = client.post("/api/tareas", json={
        "titulo": "Tarea protegida de Ana"
    }, headers=ana_auth["headers"])
    id_tarea_ana = crear_res.get_json()["id"]

    res_beto = client.delete(f"/api/tareas/{id_tarea_ana}", headers=beto_auth["headers"])
    assert res_beto.status_code == 404


def test_15_ana_actualiza_parcialmente_su_tarea_patch_200(client, ana_auth):
    """
    Prueba 15 (Justificación de PATCH vs PUT):
    Ana actualiza únicamente el estado 'completada: True' mediante PATCH.
    El título y la descripción se preservan intactos sin necesidad de reenviarlos.
    """
    crear_res = client.post("/api/tareas", json={
        "titulo": "Estudiar para el examen final",
        "descripcion": "Revisar Blueprints, JWT y RLS",
        "completada": False
    }, headers=ana_auth["headers"])
    id_tarea = crear_res.get_json()["id"]

    patch_res = client.patch(
        f"/api/tareas/{id_tarea}",
        json={"completada": True},
        headers=ana_auth["headers"]
    )
    assert patch_res.status_code == 200
    data = patch_res.get_json()
    assert data["completada"] is True
    assert data["titulo"] == "Estudiar para el examen final"
    assert data["descripcion"] == "Revisar Blueprints, JWT y RLS"


def test_16_ana_elimina_su_tarea_exitosa_200(client, ana_auth):
    """Prueba 16: Ana elimina una tarea propia exitosamente."""
    crear_res = client.post("/api/tareas", json={
        "titulo": "Tarea temporal"
    }, headers=ana_auth["headers"])
    id_tarea = crear_res.get_json()["id"]

    del_res = client.delete(f"/api/tareas/{id_tarea}", headers=ana_auth["headers"])
    assert del_res.status_code == 200
    data = del_res.get_json()
    assert data["id"] == id_tarea

    get_res = client.get(f"/api/tareas/{id_tarea}", headers=ana_auth["headers"])
    assert get_res.status_code == 404


# ==============================================================================
# SECCIÓN 4: DOCUMENTACIÓN SWAGGER / OPENAPI 3.0.3
# ==============================================================================

def test_17_documentacion_swagger_ui_disponible(client):
    """Prueba 17: Swagger UI debe estar publicado y accesible en la ruta /docs."""
    res = client.get("/docs")
    assert res.status_code == 200
    assert b"swagger-ui" in res.data or b"html" in res.data


def test_18_especificacion_openapi_json_valida(client):
    """Prueba 18: La especificación OpenAPI 3.0.3 debe publicarse en /openapi.json."""
    res = client.get("/openapi.json")
    assert res.status_code == 200
    spec = res.get_json()
    assert spec["openapi"].startswith("3.")
    assert "paths" in spec
    assert "/api/salud" in spec["paths"]
    assert "/api/auth/login" in spec["paths"]
    assert "/api/tareas" in spec["paths"]
    assert "BearerAuth" in spec["components"]["securitySchemes"]


# ==============================================================================
# SECCIÓN 5: PROYECTO SOCIOFORMATIVO — FERIA AGROECOLÓGICA (CU-01 A CU-04)
# ==============================================================================

def test_19_ecoforia_cu01_catalogo_publico_productos(client):
    """Prueba 19 (CU-01): Consumidor explora el catálogo semanal de cosechas."""
    res = client.get("/api/productos")
    assert res.status_code == 200
    productos = res.get_json()
    assert len(productos) >= 10
    assert any(p["comunidad"] == "Samaipata" for p in productos)


def test_20_ecoforia_cu02_reserva_pedido_directo(client):
    """Prueba 20 (CU-02): Consumidor registra pedido directo con código unívoco ECO-XXXX."""
    res = client.post("/api/pedidos", json={
        "cliente": "Eduar Heredia",
        "celular": "71023456",
        "puntoRetiro": "Feria Barrio Lindo",
        "fechaRetiro": "2026-10-03",
        "totalBs": 10.0,
        "items": [
            {
                "productoId": 1,
                "nombre": "Lechuga Crespa Hidropónica",
                "cantidad": 2,
                "precioUnitario": 5.0,
                "subtotal": 10.0
            }
        ]
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["codigo"].startswith("ECO-")
    assert data["estado"] == "Registrado"


def test_21_ecoforia_cu03_productor_actualiza_cosecha_patch(client, ana_auth):
    """Prueba 21 (CU-03): Productor autenticado actualiza el stock de su cosecha mediante PATCH."""
    res = client.patch(
        "/api/productos/1",
        json={"stock": 50, "precio": 5.5},
        headers=ana_auth["headers"]
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["stock"] == 50
    assert data["precio"] == 5.5


def test_22_ecoforia_cu04_cambio_estado_despacho_ferial(client, ana_auth):
    """Prueba 22 (CU-04): Productor actualiza estado logístico en el tablero de despacho."""
    res = client.patch(
        "/api/pedidos/1/estado",
        json={"estado": "Listo en Feria"},
        headers=ana_auth["headers"]
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["estado"] == "Listo en Feria"
