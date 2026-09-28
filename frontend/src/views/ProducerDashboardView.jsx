import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  RotateCcw, 
  Boxes, 
  ClipboardList, 
  DollarSign, 
  MapPin,
  Eye,
  EyeOff,
  User,
  Image as ImageIcon
} from 'lucide-react';

export function ProducerDashboardView({ 
  products, 
  orders, 
  onCreateProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onUpdateOrderStatus, 
  onResetData, 
  showToast 
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulario de Producto (CRUD)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Hortalizas',
    comunidad: 'El Torno',
    productor_nombre: 'Don Faustino Mamani',
    unidad: 'Kilogramo',
    precio_bs: '',
    stock: '',
    descripcion: '',
    imagen_url: '/images/lechuga.jpg'
  });

  const [formErrors, setFormErrors] = useState({});

  const availablePhotos = [
    { label: 'Lechuga', url: '/images/lechuga.jpg' },
    { label: 'Tomate', url: '/images/tomates.jpg' },
    { label: 'Zanahorias', url: '/images/zanahorias.jpg' },
    { label: 'Frutillas', url: '/images/frutillas.jpg' },
    { label: 'Zapallo', url: '/images/zapallo.jpg' },
    { label: 'Achachairú', url: '/images/achachairu.jpg' },
    { label: 'Acelga', url: '/images/acelga.jpg' },
    { label: 'Huevos', url: '/images/huevos.jpg' },
    { label: 'Miel Virgen', url: '/images/miel.jpg' },
    { label: 'Café Tostado', url: '/images/cafe.jpg' },
  ];
  const categories = ['Hortalizas', 'Frutas', 'Tubérculos', 'Artesanales', 'Granja'];
  const communities = ['El Torno', 'Samaipata', 'Porongo', 'Vallegrande'];

  // Métricas para el productor
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.activo).length;
  const totalOrders = orders.length;
  const projectedRevenue = orders.reduce((sum, o) => sum + o.total_bs, 0);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      categoria: 'Hortalizas',
      comunidad: 'El Torno',
      productor_nombre: 'Don Faustino Mamani',
      unidad: 'Kilogramo',
      precio_bs: '',
      stock: '',
      descripcion: '',
      imagen_url: '/images/lechuga.jpg'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      categoria: product.categoria,
      comunidad: product.comunidad,
      productor_nombre: product.productor_nombre,
      unidad: product.unidad,
      precio_bs: product.precio_bs.toString(),
      stock: product.stock.toString(),
      descripcion: product.descripcion,
      imagen_url: product.imagen_url || '/images/lechuga.jpg'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateProductForm = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre de la cosecha es obligatorio.';
    if (!formData.precio_bs || parseFloat(formData.precio_bs) <= 0) errs.precio_bs = 'Ingresa un precio justo mayor a 0 Bs.';
    if (!formData.stock || parseInt(formData.stock, 10) < 0) errs.stock = 'Indica el stock disponible estimado para la feria.';
    if (!formData.unidad.trim()) errs.unidad = 'Indica la unidad de medida.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) {
      showToast('Corrige los errores del formulario.', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, formData);
        showToast('Cosecha actualizada con éxito.', 'success');
      } else {
        await onCreateProduct(formData);
        showToast('Nueva cosecha publicada en el catálogo semanal.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error al guardar el producto.', 'error');
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo?`)) {
      await onDeleteProduct(id);
      showToast(`Cosecha "${nombre}" eliminada.`, 'info');
    }
  };

  const handleToggleActive = async (product) => {
    await onUpdateProduct(product.id, { activo: !product.activo });
    showToast(
      product.activo ? `Cosecha "${product.nombre}" pausada temporalmente.` : `Cosecha "${product.nombre}" activada.`,
      'info'
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      {/* Header */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Gestión Agroecológica • CU-03 y CU-04
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Panel del Productor de la Feria
          </h1>
          <p className="text-xs text-slate-500">
            Administra tus existencias semanales y despacha los pedidos sin intermediarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 min-h-[44px]"
            id="tour-new-product-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Cosecha</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas restablecer todos los datos iniciales de prueba de Santa Cruz?')) {
                onResetData();
                showToast('Datos de prueba restablecidos a valores de fábrica.', 'info');
              }
            }}
            title="Restablecer datos demo"
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-slate-800">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Cosechas Activas</span>
            <Sprout className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeProducts} <span className="text-xs font-normal text-slate-500">/ {totalProducts}</span></div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Total Reservas</span>
            <ClipboardList className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Ingreso Proyectado</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800">{projectedRevenue.toFixed(2)} Bs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">Comisión Intermediario</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800">0.00 Bs (100% Productor)</div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 min-h-[44px] ${
            activeTab === 'products'
              ? 'border-emerald-700 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Gestión de Cosechas ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 min-h-[44px] ${
            activeTab === 'orders'
              ? 'border-emerald-700 text-emerald-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Despacho de Pedidos ({orders.length})</span>
        </button>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-sm text-slate-800">Catálogo de Cosechas Registradas</h2>
            <span className="text-xs text-slate-500">Operaciones CRUD en tiempo real</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors ${
                  !p.activo ? 'opacity-60 bg-slate-50/40' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={p.imagen_url || '/images/lechuga.jpg'}
                      alt={p.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{p.nombre}</h3>
                      <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {p.categoria}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-700" /> {p.comunidad} • <User className="w-3 h-3 text-slate-400" /> {p.productor_nombre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="font-black text-emerald-800 text-base">{p.precio_bs.toFixed(2)} Bs</span>
                    <p className="text-xs text-slate-500">Stock: <strong>{p.stock}</strong> ({p.unidad})</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                        p.activo ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={p.activo ? 'Pausar disponibilidad' : 'Reactivar en catálogo'}
                    >
                      {p.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Editar cosecha"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(p.id, p.nombre)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Eliminar cosecha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-sm text-slate-800">Control de Entregas y Estados Transaccionales</h2>
            <span className="text-xs text-slate-500">Actualización en tiempo real</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((o) => (
              <div key={o.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <span className="font-black text-emerald-900 text-base">{o.codigo}</span>
                    <span className="text-slate-500 text-xs ml-2">Cliente: <strong>{o.cliente_nombre}</strong> ({o.cliente_telefono})</span>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {o.punto_retiro} • Fecha: {o.fecha_retiro}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-base">{o.total_bs.toFixed(2)} Bs</span>
                    
                    {/* Selector de Estado */}
                    <select
                      value={o.estado}
                      onChange={(e) => onUpdateOrderStatus(o.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none min-h-[36px] ${
                        o.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                        o.estado === 'CONFIRMADO' ? 'bg-blue-50 text-blue-900 border-blue-300' :
                        o.estado === 'EN_COSECHA' ? 'bg-purple-50 text-purple-900 border-purple-300' :
                        'bg-emerald-50 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="CONFIRMADO">CONFIRMADO</option>
                      <option value="EN_COSECHA">EN COSECHA</option>
                      <option value="LISTO">LISTO EN FERIA</option>
                      <option value="ENTREGADO">ENTREGADO</option>
                    </select>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>• {it.cantidad} × {it.nombre}</span>
                      <span className="font-semibold">{it.subtotal.toFixed(2)} Bs</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal CRUD Producto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="font-black text-lg text-slate-900">
                {editingProduct ? 'Editar Cosecha' : 'Publicar Nueva Cosecha'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Selector de Fotografía Real */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Fotografía real del producto</label>
                  <span className="text-[11px] text-slate-500">Selecciona o ingresa URL</span>
                </div>

                {/* Previews Grid */}
                <div className="grid grid-cols-5 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {availablePhotos.map((photo) => {
                    const isSelected = formData.imagen_url === photo.url;
                    return (
                      <button
                        type="button"
                        key={photo.url}
                        onClick={() => setFormData({ ...formData, imagen_url: photo.url })}
                        className={`group relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                          isSelected
                            ? 'border-emerald-600 ring-2 ring-emerald-500/40 shadow-sm scale-105'
                            : 'border-slate-200 hover:border-emerald-400 opacity-80 hover:opacity-100'
                        }`}
                        title={photo.label}
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-bold py-0.5 truncate text-center">
                          {photo.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom URL Input */}
                <div className="flex gap-2 items-center pt-1">
                  <input
                    type="url"
                    placeholder="O ingresa enlace directo de imagen (https://...)"
                    value={formData.imagen_url || ''}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  {formData.imagen_url && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                      <img
                        src={formData.imagen_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/lechuga.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Nombre de la cosecha *</label>
                <input
                  type="text"
                  placeholder="Ej. Achachairú de parcela orgánica"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  required
                />
                {formErrors.nombre && <p className="text-red-500 font-semibold">{formErrors.nombre}</p>}
              </div>

              {/* Categoría y Comunidad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Comunidad / Valle</label>
                  <select
                    value={formData.comunidad}
                    onChange={(e) => setFormData({ ...formData, comunidad: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {communities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Precio (Bs) *</label>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="15.00"
                    value={formData.precio_bs}
                    onChange={(e) => setFormData({ ...formData, precio_bs: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    required
                  />
                  {formErrors.precio_bs && <p className="text-red-500 font-semibold">{formErrors.precio_bs}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Stock Est. *</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    required
                  />
                  {formErrors.stock && <p className="text-red-500 font-semibold">{formErrors.stock}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Unidad *</label>
                  <input
                    type="text"
                    placeholder="Ej. Kilogramo"
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Productor */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Productor Responsable</label>
                <input
                  type="text"
                  value={formData.productor_nombre}
                  onChange={(e) => setFormData({ ...formData, productor_nombre: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Descripción ecológica</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el cultivo limpio, riego con aguas limpias, abono..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Botón Guardar */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors min-h-[44px]"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cosecha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
