from marshmallow import Schema, fields, validate

class ItemPedidoSchema(Schema):
    productoId = fields.Integer(required=True)
    nombre = fields.String(required=True)
    cantidad = fields.Integer(required=True, validate=validate.Range(min=1))
    precioUnitario = fields.Float(required=True)
    subtotal = fields.Float(required=True)


class ProductoSchema(Schema):
    id = fields.Integer(dump_only=True)
    nombre = fields.String(required=True, validate=validate.Length(min=2))
    precio = fields.Float(required=True, validate=validate.Range(min=0.1))
    categoria = fields.String(required=True)
    comunidad = fields.String(required=True)
    stock = fields.Integer(required=True, validate=validate.Range(min=0))
    unidad = fields.String(load_default="Kg")
    imagen = fields.String(load_default="")
    activo = fields.Boolean(load_default=True)


class ActualizarProductoSchema(Schema):
    nombre = fields.String()
    precio = fields.Float()
    categoria = fields.String()
    comunidad = fields.String()
    stock = fields.Integer()
    unidad = fields.String()
    imagen = fields.String()
    activo = fields.Boolean()


class PedidoSchema(Schema):
    id = fields.Integer(dump_only=True)
    codigo = fields.String(dump_only=True)
    cliente = fields.String(required=True, validate=validate.Length(min=3))
    celular = fields.String(required=True, validate=validate.Regexp(r"^[67]\d{7}$", error="Debe ser un número celular boliviano válido de 8 dígitos que inicie con 6 o 7"))
    puntoRetiro = fields.String(required=True)
    fechaRetiro = fields.String(required=True)
    totalBs = fields.Float(required=True)
    estado = fields.String(dump_default="Registrado")
    items = fields.List(fields.Nested(ItemPedidoSchema), required=True)


class ActualizarEstadoPedidoSchema(Schema):
    estado = fields.String(
        required=True,
        validate=validate.OneOf(["Registrado", "Confirmado", "En Cosecha", "Listo en Feria", "Entregado", "Cancelado"])
    )
