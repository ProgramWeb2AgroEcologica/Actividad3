import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    puerto = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1")
    print("=" * 60)
    print("UPDS - PROGRAMACIÓN WEB II (ACTIVIDAD 03)")
    print("Servidor Backend Iniciado Exitosamente")
    print(f"URL Local:   http://localhost:{puerto}")
    print(f"Swagger UI:  http://localhost:{puerto}/docs")
    print(f"OpenAPI Doc: http://localhost:{puerto}/openapi.json")
    print("=" * 60)
    app.run(host="0.0.0.0", port=puerto, debug=debug)
