import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  Receipt, 
  QrCode 
} from 'lucide-react';

export function CheckoutView({ cart, onBackToCatalog, onOrderConfirmed, showToast }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    punto_retiro: 'Feria Parque Urbano (Sábados 07:00 a 12:00)',
    fecha_retiro: getNextSaturday()
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Helper para pre-seleccionar el próximo sábado
  function getNextSaturday() {
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return d.toISOString().split('T')[0];
  }

  const pickupPoints = [
    { id: 'p1', label: 'Feria Parque Urbano (Sábados 07:00 a 12:00)', zona: 'Centro / 2do Anillo' },
    { id: 'p2', label: 'EcoFeria 4to Anillo y Av. Busch (Viernes 15:00 a 19:00)', zona: 'Oeste / UAGRM' },
    { id: 'p3', label: 'Feria Barrio Lindo / Estación (Miércoles 06:00 a 11:00)', zona: 'Sur' },
    { id: 'p4', label: 'Punto de Acopio El Torno - Mercado Central (Domingos)', zona: 'Valles Cruceños' }
  ];

  const total = cart.reduce((sum, item) => sum + item.precio_bs * item.cantidad, 0);

  // Validación estricta en tiempo real
  const validateField = (field, value) => {
    let err = '';
    if (field === 'nombre') {
      if (!value.trim()) {
        err = 'El nombre completo es obligatorio para identificar tu canasta.';
      } else if (value.trim().length < 3) {
        err = 'Ingresa al menos 3 caracteres.';
      }
    }

    if (field === 'telefono') {
      const cleanPhone = value.replace(/\s+/g, '');
      if (!cleanPhone) {
        err = 'El número de celular es obligatorio para avisarte al cosechar.';
      } else if (!/^[67]\d{7}$/.test(cleanPhone)) {
        err = 'Ingresa un celular válido de 8 dígitos que comience con 6 o 7.';
      }
    }

    if (field === 'fecha_retiro') {
      if (!value) {
        err = 'Selecciona la fecha estimada en la que recogerás tu cosecha.';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todo antes de enviar
    const errNombre = validateField('nombre', formData.nombre);
    const errTel = validateField('telefono', formData.telefono);
    const errFecha = validateField('fecha_retiro', formData.fecha_retiro);

    if (errNombre || errTel || errFecha) {
      showToast('Por favor corrige los campos señalados en rojo.', 'error', 'Formulario incompleto');
      return;
    }

    if (cart.length === 0) {
      showToast('Tu canasta está vacía. Añade productos antes de reservar.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        cliente_nombre: formData.nombre,
        cliente_telefono: formData.telefono,
        punto_retiro: formData.punto_retiro,
        fecha_retiro: formData.fecha_retiro,
        items: cart.map((i) => ({
          producto_id: i.id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio_bs: i.precio_bs,
          subtotal: i.precio_bs * i.cantidad,
          imagen_url: i.imagen_url
        })),
        total_bs: total
      };

      const result = await onOrderConfirmed(orderPayload);
      setConfirmedOrder(result);
      showToast(`¡Reserva ${result.codigo} registrada con éxito!`, 'success', 'Reserva confirmada');
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al registrar la reserva. Intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Si ya se confirmó la orden, mostramos el Comprobante Digital
  if (confirmedOrder) {
    const whatsappMsg = encodeURIComponent(
      `Hola EcoFeria Santa Cruz! Acabo de registrar mi reserva de cosecha con código *${confirmedOrder.codigo}* a nombre de *${confirmedOrder.cliente_nombre}*. Punto de retiro: ${confirmedOrder.punto_retiro}. Total: ${confirmedOrder.total_bs.toFixed(2)} Bs.`
    );

    return (
      <div className="max-w-xl mx-auto py-6 space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 text-center space-y-2">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-emerald-200 mb-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-300" />
            </div>
            <span className="bg-emerald-700/60 border border-emerald-500/40 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Reserva Confirmada
            </span>
            <h2 className="text-2xl font-black text-white">Comprobante de Cosecha</h2>
            <p className="text-xs text-emerald-100">
              Presenta este código al momento de retirar tus productos en la feria.
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6">
            {/* Código Destacado */}
            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Código de Reserva</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-wider">
                {confirmedOrder.codigo}
              </div>
              <p className="text-xs text-slate-500">
                Cliente: <strong>{confirmedOrder.cliente_nombre}</strong> • Tel: {confirmedOrder.cliente_telefono}
              </p>
            </div>

            {/* Info de Retiro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Punto de Retiro
                </span>
                <p className="font-bold text-slate-800">{confirmedOrder.punto_retiro}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Fecha Estimada
                </span>
                <p className="font-bold text-slate-800">{confirmedOrder.fecha_retiro}</p>
              </div>
            </div>

            {/* Desglose de Productos */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Detalle de la Cosecha</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      {item.imagen_url && (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={item.imagen_url}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/lechuga.jpg';
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800">{item.nombre}</span>
                        <p className="text-[11px] text-slate-500">Cant: {item.cantidad} × {item.precio_bs.toFixed(2)} Bs</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{item.subtotal.toFixed(2)} Bs</span>
                  </div>
                ))}
                <div className="p-3 bg-emerald-50/50 flex justify-between items-center font-bold text-sm text-emerald-950">
                  <span>Total a Pagar en Mano:</span>
                  <span className="text-lg font-black text-emerald-800">{confirmedOrder.total_bs.toFixed(2)} Bs</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3 pt-2">
              <a
                href={`https://wa.me/?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all min-h-[48px]"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir Comprobante por WhatsApp</span>
              </a>

              <button
                onClick={onBackToCatalog}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm transition-all min-h-[48px]"
              >
                Volver al Catálogo Semanal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista del formulario si no está confirmada
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Botón Volver */}
      <button
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-800 font-semibold text-xs transition-colors min-h-[40px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>← Volver a explorar cosechas</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Reserva (CU-02) */}
        <section 
          className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5"
          aria-labelledby="checkout-form-title"
        >
          <div className="space-y-1">
            <h1 id="checkout-form-title" className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Confirmar Reserva de Cosecha
            </h1>
            <p className="text-xs text-slate-500">
              No requieres tarjeta bancaria ni pagos previos. Reservas directo al agricultor y pagas al recibir tus productos limpios en la feria.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Nombre Completo */}
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="block text-xs font-bold text-slate-700">
                Nombre y Apellido <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej. Valeria Justiniano"
                  value={formData.nombre}
                  onChange={handleChange}
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all min-h-[44px] focus:outline-none focus:bg-white ${
                    errors.nombre 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-600'
                  }`}
                  required
                />
              </div>
              {errors.nombre && (
                <p id="nombre-error" className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.nombre}</span>
                </p>
              )}
            </div>

            {/* Teléfono Celular Cruceño */}
            <div className="space-y-1.5">
              <label htmlFor="telefono" className="block text-xs font-bold text-slate-700">
                Celular / WhatsApp (Santa Cruz) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  maxLength={8}
                  placeholder="Ej. 77312345 (8 dígitos)"
                  value={formData.telefono}
                  onChange={handleChange}
                  aria-invalid={!!errors.telefono}
                  aria-describedby={errors.telefono ? 'telefono-error' : undefined}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all min-h-[44px] focus:outline-none focus:bg-white ${
                    errors.telefono 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-200 focus:ring-2 focus:ring-emerald-600'
                  }`}
                  required
                />
              </div>
              {errors.telefono && (
                <p id="telefono-error" className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.telefono}</span>
                </p>
              )}
              <p className="text-[11px] text-slate-500">Te enviaremos la confirmación cuando el agricultor corte la cosecha.</p>
            </div>

            {/* Punto de Retiro */}
            <div className="space-y-1.5">
              <label htmlFor="punto_retiro" className="block text-xs font-bold text-slate-700">
                Punto de Retiro en Santa Cruz <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="punto_retiro"
                  name="punto_retiro"
                  value={formData.punto_retiro}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  required
                >
                  {pickupPoints.map((p) => (
                    <option key={p.id} value={p.label}>
                      {p.label} ({p.zona})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha de Retiro */}
            <div className="space-y-1.5">
              <label htmlFor="fecha_retiro" className="block text-xs font-bold text-slate-700">
                Fecha Estimada de Retiro <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="fecha_retiro"
                  name="fecha_retiro"
                  type="date"
                  value={formData.fecha_retiro}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  aria-invalid={!!errors.fecha_retiro}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm min-h-[48px]"
              >
                {submitting ? (
                  <span>Registrando reserva en el sistema...</span>
                ) : (
                  <>
                    <ClipboardCheck className="w-5 h-5" />
                    <span>Confirmar Reserva ({total.toFixed(2)} Bs)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Resumen Lateral de la Canasta */}
        <section 
          className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 h-fit"
          aria-label="Resumen de productos en canasta"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900">Resumen del Pedido</h2>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
              {cart.reduce((a, b) => a + b.cantidad, 0)} ítems
            </span>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Tu canasta está vacía. Añade productos desde el catálogo semanal.
            </p>
          ) : (
            <div className="space-y-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={item.imagen_url || '/images/lechuga.jpg'}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 line-clamp-1">{item.nombre}</span>
                      <p className="text-slate-500">{item.cantidad} × {item.precio_bs.toFixed(2)} Bs / {item.unidad}</p>
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {item.comunidad}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm shrink-0">
                    {(item.precio_bs * item.cantidad).toFixed(2)} Bs
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Costo de reserva:</span>
              <span className="font-bold text-emerald-700">0.00 Bs (Gratuito)</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Comisión de plataforma:</span>
              <span className="font-bold text-emerald-700">0.00 Bs (Cero intermediarios)</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-base font-black text-slate-900">
              <span>Total en Feria:</span>
              <span className="text-2xl text-emerald-800">{total.toFixed(2)} Bs</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
