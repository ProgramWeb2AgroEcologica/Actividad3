from marshmallow import Schema, fields, validate

class CrearTareaSchema(Schema):
    titulo = fields.String(
        required=True,
        validate=validate.Length(min=1, max=150, error="El título no puede estar vacío ni exceder 150 caracteres"),
        metadata={"description": "Título o nombre descriptivo de la tarea"}
    )
    descripcion = fields.String(
        load_default="",
        metadata={"description": "Detalles o notas adicionales sobre la tarea"}
    )
    completada = fields.Boolean(
        load_default=False,
        metadata={"description": "Estado booleano de la tarea (true: completada, false: pendiente)"}
    )


class ActualizarTareaSchema(Schema):
    """
    Esquema para actualización parcial (PATCH).
    Diferencia clave con PUT: Todos los campos son opcionales. Permite actualizar
    solamente 'completada' o el 'titulo' sin enviar el objeto completo ni sobreescribir datos.
    """
    titulo = fields.String(
        validate=validate.Length(min=1, max=150),
        metadata={"description": "Nuevo título opcional"}
    )
    descripcion = fields.String(
        metadata={"description": "Nueva descripción opcional"}
    )
    completada = fields.Boolean(
        metadata={"description": "Nuevo estado opcional"}
    )


class TareaResponseSchema(Schema):
    id = fields.String(metadata={"description": "Identificador unívoco (UUID)"})
    titulo = fields.String(metadata={"description": "Título de la tarea"})
    descripcion = fields.String(metadata={"description": "Descripción"})
    completada = fields.Boolean(metadata={"description": "Estado de completado"})
    fecha_creacion = fields.DateTime(metadata={"description": "Fecha y hora de creación ISO 8601"})
    fecha_actualizacion = fields.DateTime(metadata={"description": "Última fecha y hora de actualización"})
    user_id = fields.String(metadata={"description": "UUID del propietario en Supabase Auth"})


class EliminarTareaResponseSchema(Schema):
    mensaje = fields.String(metadata={"description": "Confirmación de eliminación exitosa"})
    id = fields.String(metadata={"description": "UUID de la tarea eliminada"})
