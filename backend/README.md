# Actividad 03 — Backend Seguro, API Documentada, JWT y Row Level Security (RLS)

**Universidad Privada Domingo Savio (UPDS)**  
**Asignatura:** Programación Web II — Turno Medio Día  
**Docente:** Ing. Jimmy Requena (Bolivianotech)  
**Estudiantes:** Eduar Heredia, Limbert David Quispe Osco  
**Copiloto AI:** Antigravity AI (AI-DLC)  
**Santa Cruz de la Sierra — Bolivia (2026)**

---

## 1. Visión General de la Solución

Este repositorio contiene la implementación del Backend del MVP para la **Actividad 03 (Bloque III)** de Programación Web II. El sistema ha sido construido bajo una arquitectura limpia y desacoplada mediante el patrón **Application Factory**, dividiendo las responsabilidades en **Blueprints** modulares y documentando automáticamente cada endpoint con **Flask-Smorest** y especificación **OpenAPI 3.0.3 / Swagger UI**.

### Componentes Clave:
1. **Patrón Application Factory (`create_app`)**: Inicialización modular con inyección de configuraciones (Desarrollo, Pruebas y Producción).
2. **Módulo de Salud (`/api/salud`)**: Diagnóstico de disponibilidad (Health Check).
3. **Módulo de Autenticación (`/api/auth`)**:
   - Registro de usuarios con validación de deduplicación (Código `409 Conflict`).
   - Inicio de sesión con emisión de doble token: **Access Token** (~15 min) y **Refresh Token** (7 días).
   - Renovación segura mediante rotación de tokens en `POST /api/auth/refresh`.
   - Consulta de perfil verificado en `GET /api/auth/perfil`.
4. **Módulo de Tareas con RLS (`/api/tareas`)**:
   - CRUD completo protegido con `@token_required`.
   - Implementación de **Row Level Security (RLS)** en PostgreSQL/Supabase: cada usuario (*Ana vs. Beto*) solo tiene visibilidad sobre sus propios registros.
   - Seguridad por diseño: si un usuario intenta consultar, editar o borrar una tarea ajena, la API responde `404 Not Found` en lugar de `403 Forbidden` para prevenir ataques de enumeración de identificadores.
   - Actualización parcial mediante el verbo `PATCH` en lugar de `PUT`.
5. **Módulo de EcoFeria Santa Cruz (`/api/productos` y `/api/pedidos`)**: Conexión lista para el frontend agroecológico desarrollado en la Actividad 02.
6. **Batería de Pruebas Automatizadas con Pytest**: **22 pruebas pasando al 100%**.

---

## 2. Estructura del Proyecto

```text
backend/
├── app/
│   ├── __init__.py           # Application Factory: create_app()
│   ├── config.py             # Configuraciones (Dev, Prod, Testing, JWT, CORS)
│   ├── extensions.py         # Extensiones (Api, CORS)
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── jwt_utils.py      # Decorador @token_required, generación y 5 validaciones JWT
│   │   ├── routes.py         # Blueprint api_auth (/registro, /login, /refresh, /perfil)
│   │   └── schemas.py        # Esquemas Marshmallow de autenticación
│   ├── salud/
│   │   ├── __init__.py
│   │   ├── routes.py         # Blueprint api_salud (/salud - Health Check)
│   │   └── schemas.py        # Esquema de respuesta de salud
│   ├── tareas/
│   │   ├── __init__.py
│   │   ├── db.py             # Conector Supabase y Repositorio Mock RLS para pruebas
│   │   ├── routes.py         # Blueprint api_tareas (CRUD con RLS y PATCH)
│   │   └── schemas.py        # Esquemas de tareas
│   └── ecoforia/
│       ├── __init__.py
│       ├── routes.py         # Blueprint api (/productos, /pedidos)
│       └── schemas.py        # Esquemas del marketplace agroecológico
├── sql/
│   └── 01_schema_rls.sql     # DDL de PostgreSQL con RLS y políticas USING / WITH CHECK
├── tests/
│   ├── conftest.py           # Fixtures de Pytest (tokens de prueba para Ana y Beto)
│   └── test_api.py           # 18 pruebas unitarias y de integración
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Exclusión de venv, cache y credenciales sensibles
├── Procfile                  # Comando de arranque para Render (Gunicorn)
├── render.yaml               # Manifiesto de despliegue en la nube
├── requirements.txt          # Dependencias de producción y pruebas
├── pytest.ini                # Configuración de pruebas
└── run.py                    # Punto de entrada local
```

---

## 3. Instalación y Ejecución Local

### 3.1. Requisitos Previos
- Python 3.11 o superior.
- Git.

### 3.2. Configuración del Entorno Virtual
```bash
# 1. Ingresar a la carpeta backend
cd backend

# 2. Crear entorno virtual (si no existe)
python -m venv venv

# 3. Activar entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# En Linux/macOS:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt
```

### 3.3. Iniciar el Servidor
```bash
python run.py
```
El servidor arrancará en:
- **API Local:** `http://localhost:5000`
- **Documentación Swagger UI interactiva:** `http://localhost:5000/docs`
- **Contrato OpenAPI en JSON:** `http://localhost:5000/openapi.json`

---

## 4. Batería de Pruebas Automatizadas (Pytest)

Para ejecutar las 18 pruebas automatizadas de seguridad, RLS, deduplicación y ciclo de vida de tokens:

```bash
pytest -v
```

### Salida Certificada:
```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.1.1, pluggy-1.6.0
rootdir: backend
configfile: pytest.ini
collected 22 items

tests/test_api.py::test_01_salud_health_check PASSED                     [  4%]
tests/test_api.py::test_02_registro_usuario_exitoso PASSED               [  9%]
tests/test_api.py::test_03_registro_usuario_duplicado_409_deduplicacion PASSED [ 13%]
tests/test_api.py::test_04_login_credenciales_correctas PASSED           [ 18%]
tests/test_api.py::test_05_login_password_incorrecto_401 PASSED          [ 22%]
tests/test_api.py::test_06_endpoint_protegido_sin_token_401 PASSED       [ 27%]
tests/test_api.py::test_07_token_alterado_firma_invalida_401 PASSED      [ 31%]
tests/test_api.py::test_08_token_expirado_401 PASSED                     [ 36%]
tests/test_api.py::test_09_refresh_token_renovacion_exitosa PASSED       [ 40%]
tests/test_api.py::test_10_crear_tarea_propia_201 PASSED                 [ 45%]
tests/test_api.py::test_11_listar_tareas_usuario_solo_propias PASSED     [ 50%]
tests/test_api.py::test_12_aislamiento_rls_beto_no_ve_tarea_de_ana_404 PASSED [ 54%]
tests/test_api.py::test_13_aislamiento_rls_beto_no_puede_actualizar_tarea_de_ana_404 PASSED [ 59%]
tests/test_api.py::test_14_aislamiento_rls_beto_no_puede_eliminar_tarea_de_ana_404 PASSED [ 63%]
tests/test_api.py::test_15_ana_actualiza_parcialmente_su_tarea_patch_200 PASSED [ 68%]
tests/test_api.py::test_16_ana_elimina_su_tarea_exitosa_200 PASSED       [ 72%]
tests/test_api.py::test_17_documentacion_swagger_ui_disponible PASSED    [ 77%]
tests/test_api.py::test_18_especificacion_openapi_json_valida PASSED     [ 81%]
tests/test_api.py::test_19_ecoforia_cu01_catalogo_publico_productos PASSED [ 86%]
tests/test_api.py::test_20_ecoforia_cu02_reserva_pedido_directo PASSED   [ 90%]
tests/test_api.py::test_21_ecoforia_cu03_productor_actualiza_cosecha_patch PASSED [ 95%]
tests/test_api.py::test_22_ecoforia_cu04_cambio_estado_despacho_ferial PASSED [100%]

============================= 22 passed in 0.29s ==============================
```

---

## 5. Configuración en Supabase (PostgreSQL + RLS)

1. Crear un proyecto gratuito en [supabase.com](https://supabase.com) (Región recomendada: São Paulo).
2. En el panel de Supabase, desactivar la confirmación por email (solo para entorno de laboratorio):  
   `Authentication` -> `Providers` -> `Email` -> Desmarcar `Confirm email`.
3. Ir al **SQL Editor** en Supabase y ejecutar el script completo ubicado en:  
   `sql/01_schema_rls.sql`
4. Copiar de `Project Settings` -> `API`:
   - **Project URL**
   - **anon / public key** (¡Nunca usar `service_role` en la API pública para no omitir el RLS!)
   - **JWT Secret**

---

## 6. Despliegue en Render (Paso a Paso)

1. **Repositorio Oficial en GitHub:**
   - **URL:** [https://github.com/ProgramWeb2AgroEcologica/Actividad3](https://github.com/ProgramWeb2AgroEcologica/Actividad3)
   - Rama conectada: `main`

2. **Crear Servicio en Render:**
   - Iniciar sesión en [dashboard.render.com](https://dashboard.render.com).
   - Clic en **New +** -> **Web Service**.
   - Conectar el repositorio de GitHub.
   - Completar los parámetros:
     - **Name:** `upds-actividad3-backend`
     - **Region:** `Oregon (US West)` o la más cercana.
     - **Branch:** `main`
     - **Root Directory:** `backend` (o dejar vacío si el backend está en la raíz).
     - **Runtime:** `Python 3`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn "app:create_app()"`
     - **Instance Type:** `Free`
3. **Configurar Variables de Entorno en Render:**
   - `FLASK_ENV`: `production`
   - `SUPABASE_URL`: `https://tu-proyecto.supabase.co`
   - `SUPABASE_KEY`: `tu-clave-anon-de-supabase`
   - `SUPABASE_JWT_SECRET`: `tu-jwt-secret-de-supabase`
   - `CORS_ORIGINS`: `*`
4. Clic en **Deploy Web Service** y esperar a que cambie a estado **Live**.
5. Acceder a Swagger en producción: `https://tu-servicio.onrender.com/docs`.

---

## 7. Respuestas a Preguntas Clave de Cátedra

### ¿Por qué Beto recibe 404 (Not Found) y no 403 (Forbidden) al intentar ver la tarea de Ana?
Por el principio de **Seguridad por Diseño (Security by Design)** y el mecanismo interno de **Row Level Security (RLS)**. Cuando Beto realiza la consulta `GET /api/tareas/<id_Ana>`, la base de datos aplica el filtro `WHERE user_id = auth.uid()`. Dado que el registro pertenece a Ana, la consulta no retorna ninguna fila (0 resultados). Responder con un código `403 Forbidden` confirmaría al atacante que el ID existe pero no tiene permiso, abriendo una vulnerabilidad de **fuga de información y ataque de enumeración de recursos privados**. Al devolver `404 Not Found`, la API trata el recurso como inexistente para ese usuario.

### ¿Por qué se utiliza PATCH en lugar de PUT para actualizar tareas?
El método **PATCH** está diseñado para modificaciones parciales de un recurso (RFC 5789), permitiendo actualizar únicamente los campos enviados (por ejemplo, cambiar solo `completada: true`) preservando el resto de los atributos. Por el contrario, **PUT** (RFC 7231) exige el reemplazo total del recurso, lo que requeriría enviar siempre todos los campos obligatorios; si el cliente omite uno, este podría ser sobreescrito con valores nulos o por defecto.

### ¿Cuál es el estándar de caducidad para Access Token y Refresh Token?
Siguiendo las directrices del **IETF OAuth 2.0 (RFC 6749)** y las recomendaciones del docente:
- **Access Token:** Vida corta (**15 minutos**). Minimiza la ventana de exposición en caso de intercepción o robo de token en tránsito.
- **Refresh Token:** Vida prolongada (**7 a 30 días**). Permite renovar el access token sin forzar al usuario a ingresar nuevamente su contraseña, implementando rotación segura de tokens en cada renovación.
