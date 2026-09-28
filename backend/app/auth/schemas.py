from marshmallow import Schema, fields, validate

class RegistroUsuarioSchema(Schema):
    email = fields.Email(required=True, metadata={"description": "Correo electrónico corporativo o personal"})
    password = fields.String(
        required=True,
        validate=validate.Length(min=6, error="La contraseña debe poseer al menos 6 caracteres"),
        metadata={"description": "Contraseña de acceso del usuario"}
    )
    nombre = fields.String(
        load_default="Usuario",
        metadata={"description": "Nombre visible o identificador"}
    )


class LoginUsuarioSchema(Schema):
    email = fields.Email(required=True, metadata={"description": "Correo electrónico registrado"})
    password = fields.String(required=True, metadata={"description": "Contraseña del usuario"})


class RefreshTokenSchema(Schema):
    refresh_token = fields.String(
        required=True,
        metadata={"description": "Refresh token de larga duración emitido durante el login"}
    )


class AuthTokensResponseSchema(Schema):
    access_token = fields.String(metadata={"description": "JWT de acceso de corta duración (~15 min)"})
    refresh_token = fields.String(metadata={"description": "JWT de refresco de larga duración (7 días)"})
    token_type = fields.String(dump_default="Bearer", metadata={"description": "Tipo de token para el encabezado Authorization"})
    expires_in = fields.Integer(metadata={"description": "Segundos de validez del access token"})
    user = fields.Dict(metadata={"description": "Metadatos del usuario autenticado (id, email, rol)"})


class PerfilUsuarioResponseSchema(Schema):
    id = fields.String(metadata={"description": "UUID unívoco del usuario"})
    email = fields.Email(metadata={"description": "Correo electrónico"})
    nombre = fields.String(metadata={"description": "Nombre del usuario"})
    rol = fields.String(metadata={"description": "Rol asignado (ej. authenticated, admin)"})
    expiracion_token = fields.Integer(metadata={"description": "Timestamp UNIX de expiración del token activo"})


class MensajeRespuestaSchema(Schema):
    mensaje = fields.String(metadata={"description": "Mensaje informativo"})
    error = fields.String(dump_default=None, metadata={"description": "Detalle del error si ocurrió alguno"})
