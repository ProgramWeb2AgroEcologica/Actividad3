from flask import g, jsonify, request
from flask_smorest import Blueprint
from app.tareas.schemas import (
    CrearTareaSchema,
    ActualizarTareaSchema,
    TareaResponseSchema,
    EliminarTareaResponseSchema
)
from app.auth.schemas import MensajeRespuestaSchema
from app.auth.jwt_utils import token_required
from app.tareas.db import get_task_repository

tareas_bp = Blueprint(
    "tareas",
    __name__,
    url_prefix="/api/tareas",
    description="Gestión de tareas (CRUD) protegidas por JWT y Row Level Security (RLS)"
)


@tareas_bp.route("", methods=["GET"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.response(200, TareaResponseSchema(many=True))
def listar_tareas():
    """
    Lista únicamente las tareas pertenecientes al usuario autenticado.
    Demuestra la aplicación de Row Level Security (RLS) en tiempo real:
    SELECT * FROM tareas WHERE auth.uid() = user_id;
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    tareas = repo.listar_del_usuario(user_id)
    return tareas, 200


@tareas_bp.route("", methods=["POST"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.arguments(CrearTareaSchema)
@tareas_bp.response(201, TareaResponseSchema)
def crear_tarea(datos):
    """
    Crea una nueva tarea vinculada al usuario autenticado.
    El campo user_id se asigna de forma segura a partir del JWT verificado (auth.uid()).
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    nueva_tarea = repo.crear(
        user_id=user_id,
        titulo=datos["titulo"],
        descripcion=datos.get("descripcion", ""),
        completada=datos.get("completada", False)
    )
    return nueva_tarea, 201


@tareas_bp.route("/<string:tarea_id>", methods=["GET"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.response(200, TareaResponseSchema)
@tareas_bp.alt_response(404, schema=MensajeRespuestaSchema, description="Tarea no encontrada o ajena al usuario")
def obtener_tarea(tarea_id):
    """
    Obtiene una tarea específica por su ID.
    Seguridad por Diseño (RLS): Si la tarea pertenece a otro usuario (ej. Beto consulta tarea de Ana),
    la base de datos devuelve 404 (Not Found) en lugar de 403 (Forbidden), evitando la
    enumeración de identificadores de recursos.
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    tarea = repo.obtener_por_id(tarea_id, user_id)
    if not tarea:
        return jsonify({
            "mensaje": f"Tarea con ID '{tarea_id}' no encontrada o no pertenece al usuario autenticado",
            "error": "Not Found"
        }), 404

    return tarea, 200


@tareas_bp.route("/<string:tarea_id>", methods=["PATCH"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.arguments(ActualizarTareaSchema)
@tareas_bp.response(200, TareaResponseSchema)
@tareas_bp.alt_response(404, schema=MensajeRespuestaSchema, description="Tarea no encontrada o ajena al usuario")
def actualizar_tarea(datos, tarea_id):
    """
    Actualiza parcialmente una tarea propia (PATCH).
    Justificación técnica: Se utiliza PATCH en lugar de PUT para modificar únicamente los
    campos suministrados (ej. cambiar solo 'completada' a true), sin exigir el reenvío
    completo de la entidad ni arriesgar sobreescritura accidental.
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    tarea_actualizada = repo.actualizar_parcial(tarea_id, user_id, datos)
    if not tarea_actualizada:
        return jsonify({
            "mensaje": f"Tarea con ID '{tarea_id}' no encontrada o no pertenece al usuario",
            "error": "Not Found"
        }), 404

    return tarea_actualizada, 200


@tareas_bp.route("/<string:tarea_id>", methods=["DELETE"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.response(200, EliminarTareaResponseSchema)
@tareas_bp.alt_response(404, schema=MensajeRespuestaSchema, description="Tarea no encontrada o ajena al usuario")
def eliminar_tarea(tarea_id):
    """
    Elimina una tarea propia. Si un usuario intenta eliminar una tarea ajena, recibe 404.
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    exito = repo.eliminar(tarea_id, user_id)
    if not exito:
        return jsonify({
            "mensaje": f"Tarea con ID '{tarea_id}' no encontrada o no pertenece al usuario",
            "error": "Not Found"
        }), 404

    return {
        "mensaje": "Tarea eliminada exitosamente",
        "id": str(tarea_id)
    }, 200
