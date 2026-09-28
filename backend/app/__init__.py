import os
from flask import Flask, jsonify
from flask_smorest import Api
from flask_cors import CORS
from app.config import config_by_name

def create_app(config_name=None, test_config=None):
    """
    Patrón Application Factory (Fábrica de Aplicaciones):
    Instancia y configura la aplicación Flask de forma modular y desacoplada,
    permitiendo inyectar configuraciones alternativas para testing y producción.
    """
    app = Flask(__name__)

    # Carga de configuración base
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Sobreescritura opcional para entornos de test
    if test_config:
        app.config.from_mapping(test_config)

    # Inicializar CORS
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"))

    # Inicializar Flask-Smorest OpenAPI
    api = Api(app)

    # Manejadores de error globales HTTP
    @app.errorhandler(404)
    def recurso_no_encontrado(e):
        return jsonify({
            "error": "Not Found",
            "mensaje": "El recurso solicitado no fue encontrado en el servidor."
        }), 404

    @app.errorhandler(405)
    def metodo_no_permitido(e):
        return jsonify({
            "error": "Method Not Allowed",
            "mensaje": "El método HTTP utilizado no está permitido para esta ruta."
        }), 405

    @app.errorhandler(500)
    def error_interno(e):
        return jsonify({
            "error": "Internal Server Error",
            "mensaje": "Se produjo un error no controlado en el servidor."
        }), 500

    # Registro de Blueprints modulares (Flask-Smorest)
    from app.salud.routes import salud_bp
    from app.auth.routes import auth_bp
    from app.tareas.routes import tareas_bp
    from app.ecoforia.routes import ecoforia_bp

    api.register_blueprint(salud_bp)
    api.register_blueprint(auth_bp)
    api.register_blueprint(tareas_bp)
    api.register_blueprint(ecoforia_bp)

    return app
