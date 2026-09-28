/**
 * EcoFeria Santa Cruz - Capa de Servicio API Simulada (Mock RESTful API)
 * Satisface los contratos definidos en Actividad 01 y Laboratorio 02:
 * - GET /api/productos
 * - POST /api/productos
 * - PUT /api/productos/:id
 * - DELETE /api/productos/:id
 * - GET /api/pedidos
 * - POST /api/pedidos
 * - PUT /api/pedidos/:id/estado
 * - GET /api/pedidos/:codigo
 */

const STORAGE_KEYS = {
  PRODUCTS: 'ecoferia_productos_v2',
  ORDERS: 'ecoferia_pedidos_v1',
  PRODUCERS: 'ecoferia_productores_v1'
};

const INITIAL_PRODUCERS = [
  { id: 1, nombre: 'Don Faustino Mamani', comunidad: 'El Torno', telefono: '71023456', asociacion: 'Asoc. Productores Ecológicos El Torno' },
  { id: 2, nombre: 'Doña Teodora Sandoval', comunidad: 'Samaipata', telefono: '72134567', asociacion: 'Red de Mujeres Agroecológicas Samaipata' },
  { id: 3, nombre: 'Don Carmelo Aguilera', comunidad: 'Porongo', telefono: '73245678', asociacion: 'Asoc. Fruticultores y Apícolas Porongo' },
  { id: 4, nombre: 'Doña Martha Soliz', comunidad: 'Vallegrande', telefono: '74356789', asociacion: 'Hortalizas Agroecológicas Vallegrande' }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    productor_id: 2,
    productor_nombre: 'Doña Teodora Sandoval',
    comunidad: 'Samaipata',
    nombre: 'Lechuga Crespa Agroecológica',
    categoria: 'Hortalizas',
    unidad: 'Atado (3 u.)',
    precio_bs: 5.00,
    stock: 45,
    activo: true,
    imagen_url: '/images/lechuga.jpg',
    descripcion: 'Cultivada con bioles orgánicos y agua de vertiente en Samaipata. Cosecha del día.'
  },
  {
    id: 2,
    productor_id: 1,
    productor_nombre: 'Don Faustino Mamani',
    comunidad: 'El Torno',
    nombre: 'Tomate Perita Dulce Natural',
    categoria: 'Hortalizas',
    unidad: 'Kilogramo',
    precio_bs: 12.00,
    stock: 60,
    activo: true,
    imagen_url: '/images/tomates.jpg',
    descripcion: 'Madurado al sol sin etileno ni agroquímicos. Aroma y textura natural para ensaladas.'
  },
  {
    id: 3,
    productor_id: 3,
    productor_nombre: 'Don Carmelo Aguilera',
    comunidad: 'Porongo',
    nombre: 'Miel de Abeja Virgen Silvestre',
    categoria: 'Artesanales',
    unidad: 'Frasco 500g',
    precio_bs: 35.00,
    stock: 25,
    activo: true,
    imagen_url: '/images/miel.jpg',
    descripcion: 'Miel cruda de floración de monte chiquitano en Porongo. 100% pura certificada.'
  },
  {
    id: 4,
    productor_id: 3,
    productor_nombre: 'Don Carmelo Aguilera',
    comunidad: 'Porongo',
    nombre: 'Achachairú Ecológico Seleccionado',
    categoria: 'Frutas',
    unidad: 'Canastillo (50 u.)',
    precio_bs: 25.00,
    stock: 30,
    activo: true,
    imagen_url: '/images/achachairu.jpg',
    descripcion: 'Cosecha fresca de árboles criollos de Porongo. Dulce, carnoso y refrescante.'
  },
  {
    id: 5,
    productor_id: 4,
    productor_nombre: 'Doña Martha Soliz',
    comunidad: 'Vallegrande',
    nombre: 'Zanahorias Baby Dulces',
    categoria: 'Hortalizas',
    unidad: 'Kilogramo',
    precio_bs: 8.00,
    stock: 40,
    activo: true,
    imagen_url: '/images/zanahorias.jpg',
    descripcion: 'Tierra negra de altura de Vallegrande. Muy crocantes y llenas de caroteno.'
  },
  {
    id: 6,
    productor_id: 2,
    productor_nombre: 'Doña Teodora Sandoval',
    comunidad: 'Samaipata',
    nombre: 'Frutillas Seleccionadas de Altura',
    categoria: 'Frutas',
    unidad: 'Caja 500g',
    precio_bs: 15.00,
    stock: 35,
    activo: true,
    imagen_url: '/images/frutillas.jpg',
    descripcion: 'Frutillas aromáticas sin pesticidas sintéticos. Riego por goteo con aguas limpias.'
  },
  {
    id: 7,
    productor_id: 1,
    productor_nombre: 'Don Faustino Mamani',
    comunidad: 'El Torno',
    nombre: 'Zapallo Criollo Sabor Intenso',
    categoria: 'Tubérculos',
    unidad: 'Kilogramo',
    precio_bs: 7.00,
    stock: 50,
    activo: true,
    imagen_url: '/images/zapallo.jpg',
    descripcion: 'Pulpa anaranjada cremosa, ideal para locros, sopas y purés caseros.'
  },
  {
    id: 8,
    productor_id: 3,
    productor_nombre: 'Don Carmelo Aguilera',
    comunidad: 'Porongo',
    nombre: 'Huevos de Gallina Feliz de Campo',
    categoria: 'Granja',
    unidad: 'Maple (15 u.)',
    precio_bs: 22.00,
    stock: 20,
    activo: true,
    imagen_url: '/images/huevos.jpg',
    descripcion: 'Gallinas criadas al aire libre alimentadas con maíz orgánico y pastoreo natural.'
  },
  {
    id: 9,
    productor_id: 2,
    productor_nombre: 'Doña Teodora Sandoval',
    comunidad: 'Samaipata',
    nombre: 'Café Agroforestal Tostado y Molido',
    categoria: 'Artesanales',
    unidad: 'Paquete 250g',
    precio_bs: 28.00,
    stock: 18,
    activo: true,
    imagen_url: '/images/cafe.jpg',
    descripcion: 'Granos arábicos de sombra cosechados a 1.650 msnm. Tueste medio con notas a chocolate.'
  },
  {
    id: 10,
    productor_id: 1,
    productor_nombre: 'Don Faustino Mamani',
    comunidad: 'El Torno',
    nombre: 'Acelga y Espinaca Gigante',
    categoria: 'Hortalizas',
    unidad: 'Atado Mixto',
    precio_bs: 6.00,
    stock: 30,
    activo: true,
    imagen_url: '/images/acelga.jpg',
    descripcion: 'Hojas verdes oscuras, tiernas y crujientes, cosechadas a mano la madrugada previa a feria.'
  }
];

const INITIAL_ORDERS = [
  {
    id: 101,
    codigo: 'ECO-7104',
    cliente_nombre: 'Valeria Justiniano',
    cliente_telefono: '77312345',
    punto_retiro: 'Feria Parque Urbano (Sábados 07:00 a 12:00)',
    fecha_retiro: '2026-09-26',
    estado: 'CONFIRMADO', // PENDIENTE, CONFIRMADO, EN_COSECHA, LISTO, ENTREGADO
    fecha_creacion: '2026-09-19T14:30:00Z',
    items: [
      { producto_id: 1, nombre: 'Lechuga Crespa Agroecológica', cantidad: 2, precio_bs: 5.0, subtotal: 10.0 },
      { producto_id: 2, nombre: 'Tomate Perita Dulce Natural', cantidad: 2, precio_bs: 12.0, subtotal: 24.0 },
      { producto_id: 3, nombre: 'Miel de Abeja Virgen Silvestre', cantidad: 1, precio_bs: 35.0, subtotal: 35.0 }
    ],
    total_bs: 69.00
  },
  {
    id: 102,
    codigo: 'ECO-8422',
    cliente_nombre: 'Carlos Arteaga Ribera',
    cliente_telefono: '76098765',
    punto_retiro: 'EcoFeria 4to Anillo y Av. Busch (Viernes 15:00 a 19:00)',
    fecha_retiro: '2026-09-25',
    estado: 'EN_COSECHA',
    fecha_creacion: '2026-09-20T09:15:00Z',
    items: [
      { producto_id: 4, nombre: 'Achachairú Ecológico Seleccionado', cantidad: 2, precio_bs: 25.0, subtotal: 50.0 },
      { producto_id: 6, nombre: 'Frutillas Seleccionadas de Altura', cantidad: 2, precio_bs: 15.0, subtotal: 30.0 }
    ],
    total_bs: 80.00
  }
];

// Helper para emular latencia realista de red (200-300ms)
const delay = (ms = 220) => new Promise(res => setTimeout(res, ms));

function getStored(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }
}

export const MockApi = {
  // Productos (CRUD)
  async getProductos() {
    await delay(0);
    const list = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return list.map(p => ({
      ...p,
      imagen_url: p.imagen_url || '/images/lechuga.jpg'
    }));
  },

  async getProductoById(id) {
    await delay(150);
    const list = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const item = list.find(p => p.id === Number(id));
    if (!item) throw new Error(`Producto con ID ${id} no encontrado`);
    return {
      ...item,
      imagen_url: item.imagen_url || '/images/lechuga.jpg'
    };
  },

  async createProducto(productoData) {
    await delay(300);
    const list = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const nuevo = {
      ...productoData,
      id: Date.now(),
      precio_bs: parseFloat(productoData.precio_bs),
      stock: parseInt(productoData.stock, 10),
      activo: true,
      imagen_url: productoData.imagen_url || '/images/lechuga.jpg'
    };
    const updated = [nuevo, ...list];
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return nuevo;
  },

  async updateProducto(id, changes) {
    await delay(250);
    const list = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = list.findIndex(p => p.id === Number(id));
    if (index === -1) throw new Error('Producto no encontrado');

    const updatedItem = {
      ...list[index],
      ...changes,
      precio_bs: changes.precio_bs !== undefined ? parseFloat(changes.precio_bs) : list[index].precio_bs,
      stock: changes.stock !== undefined ? parseInt(changes.stock, 10) : list[index].stock
    };
    list[index] = updatedItem;
    setStored(STORAGE_KEYS.PRODUCTS, list);
    return updatedItem;
  },

  async deleteProducto(id) {
    await delay(200);
    const list = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = list.filter(p => p.id !== Number(id));
    setStored(STORAGE_KEYS.PRODUCTS, filtered);
    return { ok: true, id };
  },

  // Pedidos (CRUD)
  async getPedidos() {
    await delay(0);
    return getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  async getPedidoByCodigo(codigo) {
    await delay(180);
    const list = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const cleanCode = codigo.trim().toUpperCase();
    const found = list.find(o => o.codigo.toUpperCase() === cleanCode || o.cliente_telefono === cleanCode);
    return found || null;
  },

  async createPedido(pedidoData) {
    await delay(350);
    const list = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const randomCode = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevoPedido = {
      id: Date.now(),
      codigo: randomCode,
      cliente_nombre: pedidoData.cliente_nombre.trim(),
      cliente_telefono: pedidoData.cliente_telefono.trim(),
      punto_retiro: pedidoData.punto_retiro,
      fecha_retiro: pedidoData.fecha_retiro,
      estado: 'PENDIENTE',
      fecha_creacion: new Date().toISOString(),
      items: pedidoData.items,
      total_bs: parseFloat(pedidoData.total_bs)
    };

    // Descontar existencias de productos
    const products = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    pedidoData.items.forEach(item => {
      const prod = products.find(p => p.id === item.producto_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.cantidad);
      }
    });
    setStored(STORAGE_KEYS.PRODUCTS, products);

    const updated = [nuevoPedido, ...list];
    setStored(STORAGE_KEYS.ORDERS, updated);
    return nuevoPedido;
  },

  async updateEstadoPedido(id, nuevoEstado) {
    await delay(200);
    const list = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = list.findIndex(o => o.id === Number(id));
    if (index === -1) throw new Error('Pedido no encontrado');
    list[index].estado = nuevoEstado;
    setStored(STORAGE_KEYS.ORDERS, list);
    return list[index];
  },

  // Productores
  async getProductores() {
    await delay(100);
    return getStored(STORAGE_KEYS.PRODUCERS, INITIAL_PRODUCERS);
  },

  // Utilidad de restablecimiento a valores de fábrica
  resetData() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCERS);
    return { ok: true };
  }
};
