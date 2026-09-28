import random
from flask import jsonify, request
from flask_smorest import Blueprint
from app.ecoforia.schemas import (
    ProductoSchema,
    ActualizarProductoSchema,
    PedidoSchema,
    ActualizarEstadoPedidoSchema
)
from app.auth.jwt_utils import token_required

ecoforia_bp = Blueprint(
    "ecoforia",
    __name__,
    url_prefix="/api",
    description="Endpoints del Proyecto Socioformativo 'Feria Agroecológica Santa Cruz' (CU-01 al CU-04)"
)

# Catálogo inicial de cosechas de los Valles Cruceños (Actividad 01 y 02)
_productos = [
    {"id": 1, "nombre": "Lechuga Crespa Hidropónica", "precio": 5.0, "categoria": "Hortalizas", "comunidad": "Samaipata", "stock": 45, "unidad": "Unidad", "imagen": "/images/lechuga.jpg", "activo": True},
    {"id": 2, "nombre": "Tomate Perita Seleccionado", "precio": 8.5, "categoria": "Hortalizas", "comunidad": "El Torno", "stock": 80, "unidad": "Kg", "imagen": "/images/tomates.jpg", "activo": True},
    {"id": 3, "nombre": "Zanahoria Baby Crujiente", "precio": 6.0, "categoria": "Tubérculos", "comunidad": "Vallegrande", "stock": 50, "unidad": "Kg", "imagen": "/images/zanahorias.jpg", "activo": True},
    {"id": 4, "nombre": "Miel Pura de Monte Virgen", "precio": 35.0, "categoria": "Artesanales", "comunidad": "Porongo", "stock": 25, "unidad": "Frasco 500g", "imagen": "/images/miel.jpg", "activo": True},
    {"id": 5, "nombre": "Huevos de Gallina de Campo", "precio": 22.0, "categoria": "Granja", "comunidad": "Porongo", "stock": 30, "unidad": "Maple 30 u.", "imagen": "/images/huevos.jpg", "activo": True},
    {"id": 6, "nombre": "Frutilla Dulce de Altura", "precio": 18.0, "categoria": "Frutas", "comunidad": "Samaipata", "stock": 40, "unidad": "Kg", "imagen": "/images/frutillas.jpg", "activo": True},
    {"id": 7, "nombre": "Achachairú Silvestre Cruceño", "precio": 25.0, "categoria": "Frutas", "comunidad": "Porongo", "stock": 35, "unidad": "100 u.", "imagen": "/images/achachairu.jpg", "activo": True},
    {"id": 8, "nombre": "Acelga Fresca Agroecológica", "precio": 4.0, "categoria": "Hortalizas", "comunidad": "El Torno", "stock": 30, "unidad": "Mazo", "imagen": "/images/acelga.jpg", "activo": True},
    {"id": 9, "nombre": "Zapallo Plomo Criollo", "precio": 15.0, "categoria": "Hortalizas", "comunidad": "Vallegrande", "stock": 20, "unidad": "Kg", "imagen": "/images/zapallo.jpg", "activo": True},
    {"id": 10, "nombre": "Café Tostado de los Valles", "precio": 40.0, "categoria": "Artesanales", "comunidad": "Samaipata", "stock": 15, "unidad": "Bolsa 250g", "imagen": "/images/cafe.jpg", "activo": True}
]
_siguiente_producto_id = 11

_pedidos = [
    {
        "id": 1,
        "codigo": "ECO-2101",
        "cliente": "Carlos Roca",
        "celular": "77312345",
        "puntoRetiro": "Feria Barrio Lindo",
        "fechaRetiro": "2026-10-03",
        "totalBs": 45.0,
        "estado": "En Cosecha",
        "items": [{"productoId": 1, "nombre": "Lechuga Crespa Hidropónica", "cantidad": 2, "precioUnitario": 5.0, "subtotal": 10.0}]
    }
]
_siguiente_pedido_id = 2

# ----------------- CU-01: CATÁLOGO SEMANAL (CONSUMIDOR) -----------------

@ecoforia_bp.route("/productos", methods=["GET"])
@ecoforia_bp.response(200, ProductoSchema(many=True))
def listar_productos():
    """CU-01: Retorna el catálogo completo de cosechas disponibles para el consumidor."""
    return _productos, 200


@ecoforia_bp.route("/productos/<int:producto_id>", methods=["GET"])
@ecoforia_bp.response(200, ProductoSchema)
def obtener_producto(producto_id):
    """CU-01: Obtiene el detalle de una cosecha específica por su ID."""
    prod = next((p for p in _productos if p["id"] == producto_id), None)
    if not prod:
        return jsonify({"error": "Producto no encontrado"}), 404
    return prod, 200


# ----------------- CU-03: GESTIÓN DE COSECHA (PRODUCTOR) -----------------

@ecoforia_bp.route("/productos", methods=["POST"])
@token_required
@ecoforia_bp.doc(security=[{"BearerAuth": []}])
@ecoforia_bp.arguments(ProductoSchema)
@ecoforia_bp.response(201, ProductoSchema)
def crear_producto(datos):
    """CU-03: Publica una nueva cosecha desde el panel campesino (Requiere token)."""
    global _siguiente_producto_id
    nuevo = {**datos, "id": _siguiente_producto_id}
    _siguiente_producto_id += 1
    _productos.append(nuevo)
    return nuevo, 201


@ecoforia_bp.route("/productos/<int:producto_id>", methods=["PUT", "PATCH"])
@token_required
@ecoforia_bp.doc(security=[{"BearerAuth": []}])
@ecoforia_bp.arguments(ActualizarProductoSchema)
@ecoforia_bp.response(200, ProductoSchema)
def actualizar_producto(datos, producto_id):
    """CU-03: Actualiza stock, precio unitario o estado activo (PUT / PATCH atómico)."""
    prod = next((p for p in _productos if p["id"] == producto_id), None)
    if not prod:
        return jsonify({"error": "Producto no encontrado"}), 404
    for k, v in datos.items():
        if v is not None:
            prod[k] = v
    return prod, 200


@ecoforia_bp.route("/productos/<int:producto_id>", methods=["DELETE"])
@token_required
@ecoforia_bp.doc(security=[{"BearerAuth": []}])
def eliminar_producto(producto_id):
    """CU-03: Desactiva o elimina una cosecha del catálogo activo (Requiere token)."""
    global _productos
    prod = next((p for p in _productos if p["id"] == producto_id), None)
    if not prod:
        return jsonify({"error": "Producto no encontrado"}), 404
    _productos = [p for p in _productos if p["id"] != producto_id]
    return jsonify({"mensaje": "Producto eliminado exitosamente", "id": producto_id}), 200


# ----------------- CU-02: RESERVAS Y PEDIDOS (CONSUMIDOR) -----------------

@ecoforia_bp.route("/pedidos", methods=["POST"])
@ecoforia_bp.arguments(PedidoSchema)
@ecoforia_bp.response(201, PedidoSchema)
def crear_pedido(datos):
    """CU-02: Registra una nueva reserva comunitaria con emisión de código ECO-XXXX."""
    global _siguiente_pedido_id
    codigo = f"ECO-{random.randint(2000, 9999)}"
    nuevo_pedido = {
        **datos,
        "id": _siguiente_pedido_id,
        "codigo": codigo,
        "estado": "Registrado"
    }
    _siguiente_pedido_id += 1

    # Descuento de stock en productos correspondientes
    for item in datos.get("items", []):
        p = next((prod for prod in _productos if prod["id"] == item["productoId"]), None)
        if p and p["stock"] >= item["cantidad"]:
            p["stock"] -= item["cantidad"]

    _pedidos.append(nuevo_pedido)
    return nuevo_pedido, 201


@ecoforia_bp.route("/pedidos/<string:codigo>", methods=["GET"])
@ecoforia_bp.response(200, PedidoSchema)
def obtener_pedido_por_codigo(codigo):
    """CU-02 / CU-04: Rastrea un pedido por su código unívoco (ECO-XXXX) o número celular."""
    codigo_limpio = codigo.strip().upper()
    pedido = next((p for p in _pedidos if p["codigo"] == codigo_limpio or p["celular"] == codigo), None)
    if not pedido:
        return jsonify({"error": f"No se encontró ningún pedido con identificador '{codigo}'"}), 404
    return pedido, 200


# ----------------- CU-04: MONITOREO Y DESPACHO (PRODUCTOR) -----------------

@ecoforia_bp.route("/pedidos", methods=["GET"])
@ecoforia_bp.response(200, PedidoSchema(many=True))
def listar_pedidos():
    """CU-04: Lista las reservas registradas para el control de despacho ferial."""
    return _pedidos, 200


@ecoforia_bp.route("/pedidos/<int:pedido_id>/estado", methods=["PUT", "PATCH"])
@token_required
@ecoforia_bp.doc(security=[{"BearerAuth": []}])
@ecoforia_bp.arguments(ActualizarEstadoPedidoSchema)
@ecoforia_bp.response(200, PedidoSchema)
def actualizar_estado_pedido(datos, pedido_id):
    """CU-04: Actualiza el estado transaccional (Tablero de Despacho Campesino)."""
    pedido = next((p for p in _pedidos if p["id"] == pedido_id), None)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404
    pedido["estado"] = datos["estado"]
    return pedido, 200
