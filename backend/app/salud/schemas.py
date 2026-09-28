from marshmallow import Schema, fields

class SaludResponseSchema(Schema):
    status = fields.String(dump_default="healthy", metadata={"description": "Estado operativo del servicio"})
    message = fields.String(dump_default="API REST operativa y en buen estado", metadata={"description": "Mensaje descriptivo"})
    version = fields.String(dump_default="1.0.0", metadata={"description": "Versión semántica de la API"})
    timestamp = fields.DateTime(dump_default="now", metadata={"description": "Marca de tiempo UTC"})
    database = fields.String(dump_default="conectado", metadata={"description": "Estado de conectividad con Supabase/PostgreSQL"})
