import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base para la aplicación Flask."""
    SECRET_KEY = os.getenv("SECRET_KEY", "upds-secret-key-2026-programacion-web-2")
    PROPAGATE_EXCEPTIONS = True

    # Configuración de OpenAPI / Swagger (Flask-Smorest)
    API_TITLE = "API REST Tareas Seguras (UPDS - Actividad 3)"
    API_VERSION = "v1"
    OPENAPI_VERSION = "3.0.3"
    OPENAPI_URL_PREFIX = "/"
    OPENAPI_SWAGGER_UI_PATH = "/docs"  # Exigido en clase: disponible en /docs
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    # Configuración de seguridad Bearer JWT en Swagger UI (botón Authorize)
    API_SPEC_OPTIONS = {
        "info": {
            "description": (
                "API REST modular construida con Flask 3, Flask-Smorest, PyJWT y PostgreSQL/Supabase con Row Level Security (RLS).\n\n"
                "### Guía de Autenticación:\n"
                "1. Ejecute `POST /api/auth/registro` o `POST /api/auth/login` para obtener un `access_token`.\n"
                "2. Haga clic en el botón verde **Authorize** arriba a la derecha.\n"
                "3. Pegue únicamente el valor del token (sin la palabra Bearer).\n"
                "4. Podrá probar todos los endpoints protegidos con RLS."
            ),
            "contact": {
                "name": "Equipo UPDS: Eduar Heredia & Limbert David Quispe Osco",
                "email": "estudiante@upds.edu.bo"
            }
        },
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "Ingrese su JWT access token obtenido en /api/auth/login"
                }
            }
        },
        "security": [{"BearerAuth": []}]
    }

    # Credenciales de Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_PUBLISHABLE_KEY", os.getenv("SUPABASE_ANON_KEY", "")))
    SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", SUPABASE_KEY)
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", os.getenv("SUPABASE_SECRET_KEY", "upds-jwt-secret-key-for-local-and-production-testing-2026"))
    SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL", "")

    # Ciclo de vida de tokens (Buenas prácticas RFC 6749 y requerimiento docente)
    # Token de acceso corto (~15 min) para minimizar ventana de ataque ante fugas
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    # Token de refresco largo (7 días) para renovación sin reingresar credenciales
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Parámetros JWT (Verificación de audiencia, emisor y tolerancia)
    JWT_ALGORITHM = "HS256"
    JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "authenticated")
    JWT_ISSUER = os.getenv("JWT_ISSUER", "supabase")
    JWT_LEEWAY_SECONDS = 10  # Margen de tolerancia de 10 segundos para desfase de relojes (leeway)

    # Configuración de CORS
    CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    SUPABASE_URL = "http://mock-supabase.test"
    SUPABASE_KEY = "mock-anon-key"
    SUPABASE_JWT_SECRET = "test-jwt-secret-upds-2026-safe-and-deterministic"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig
}
