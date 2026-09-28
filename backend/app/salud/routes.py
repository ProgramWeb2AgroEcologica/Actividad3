from datetime import datetime, timezone
from flask_smorest import Blueprint
from app.salud.schemas import SaludResponseSchema

salud_bp = Blueprint(
    "salud",
    __name__,
    url_prefix="/api/salud",
    description="Monitoreo y diagnóstico de salud del servidor (Health Check)"
)

@salud_bp.route("", methods=["GET"])
@salud_bp.response(200, SaludResponseSchema)
def obtener_salud():
    """Verifica que la API esté viva, desplegada y lista para recibir solicitudes."""
    return {
        "status": "healthy",
        "message": "Servidor Flask y extensiones operando correctamente",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc),
        "database": "conectado"
    }
