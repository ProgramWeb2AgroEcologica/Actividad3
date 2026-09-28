import pytest
from app import create_app
from app.config import TestingConfig
from app.auth.jwt_utils import generar_tokens
from app.tareas.db import _mock_repo

@pytest.fixture(scope="session")
def app():
    """Instancia la aplicación en modo Testing."""
    test_config = {
        "TESTING": True,
        "DEBUG": False,
        "PROPAGATE_EXCEPTIONS": False,
        "SUPABASE_JWT_SECRET": "test-jwt-secret-upds-2026-safe-and-deterministic",
        "ACCESS_TOKEN_EXPIRE_MINUTES": 15,
        "REFRESH_TOKEN_EXPIRE_DAYS": 7,
        "JWT_ALGORITHM": "HS256",
        "JWT_AUDIENCE": "authenticated",
        "JWT_ISSUER": "supabase",
        "JWT_LEEWAY_SECONDS": 10
    }
    app = create_app(test_config=test_config)
    return app


@pytest.fixture
def client(app):
    """Cliente HTTP para realizar solicitudes simuladas."""
    _mock_repo.reiniciar()
    return app.test_client()


@pytest.fixture
def ana_auth(app):
    """Genera tokens de prueba y credenciales para el usuario Ana."""
    with app.app_context():
        tokens = generar_tokens(
            user_id="11111111-1111-1111-1111-111111111111",
            email="ana@upds.edu.bo",
            rol="authenticated",
            nombre="Ana García"
        )
    return {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "email": "ana@upds.edu.bo",
        "tokens": tokens,
        "headers": {"Authorization": f"Bearer {tokens['access_token']}"}
    }


@pytest.fixture
def beto_auth(app):
    """Genera tokens de prueba y credenciales para el usuario Beto."""
    with app.app_context():
        tokens = generar_tokens(
            user_id="22222222-2222-2222-2222-222222222222",
            email="beto@upds.edu.bo",
            rol="authenticated",
            nombre="Beto Ramos"
        )
    return {
        "user_id": "22222222-2222-2222-2222-222222222222",
        "email": "beto@upds.edu.bo",
        "tokens": tokens,
        "headers": {"Authorization": f"Bearer {tokens['access_token']}"}
    }
