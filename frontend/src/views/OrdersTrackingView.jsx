import React, { useState } from 'react';
import { Search, PackageCheck, MapPin, Calendar, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export function OrdersTrackingView({ orders, onSearchByCode, showToast }) {
  const [query, setQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      showToast('Ingresa un código (ej. ECO-7104) o celular', 'info');
      return;
    }

    setSearching(true);
    try {
      const found = await onSearchByCode(query);
      if (found) {
        setSelectedOrder(found);
        showToast(`Pedido ${found.codigo} localizado.`, 'success');
      } else {
        setSelectedOrder(null);
        showToast('No se encontró ninguna reserva con ese código o celular.', 'error', 'Sin resultados');
      }
    } finally {
      setSearching(false);
    }
  };

  const stages = [
    { key: 'PENDIENTE', label: 'Registrado', desc: 'Reserva guardada en el sistema', icon: Clock },
    { key: 'CONFIRMADO', label: 'Confirmado', desc: 'Aceptado por la asociación', icon: CheckCircle2 },
    { key: 'EN_COSECHA', label: 'En Cosecha', desc: 'Cosechando en parcela', icon: Truck },
    { key: 'LISTO', label: 'Listo en Feria', desc: 'Empacado para entrega', icon: PackageCheck }
  ];

  const getStageIndex = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 0;
      case 'CONFIRMADO': return 1;
      case 'EN_COSECHA': return 2;
      case 'LISTO': case 'ENTREGADO': return 3;
      default: return 0;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Header & Search Bar */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="text-center max-w-md mx-auto space-y-1">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Rastreo de Cosecha
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Consulta el Estado de tu Reserva
          </h1>
          <p className="text-xs text-slate-500">
            Ingresa tu código de reserva (ej. <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">ECO-7104</code>) o tu número de celular registrado.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Código ECO-XXXX o Celular..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white min-h-[48px]"
              aria-label="Código de pedido o celular"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 rounded-xl text-sm transition-colors min-h-[48px] shrink-0"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </section>

      {/* Selected Order Result Card */}
      {selectedOrder ? (
        <article className="bg-white rounded-3xl border border-emerald-200 shadow-md p-6 space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reserva Verificada</span>
              <h2 className="text-2xl font-black text-emerald-900">{selectedOrder.codigo}</h2>
              <p className="text-xs text-slate-500">
                Cliente: <strong>{selectedOrder.cliente_nombre}</strong> • Cel: {selectedOrder.cliente_telefono}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total a Pagar en Mano</span>
              <span className="text-2xl font-black text-emerald-800">{selectedOrder.total_bs.toFixed(2)} Bs</span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Progreso de la Cosecha</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {stages.map((stage, idx) => {
                const currentIdx = getStageIndex(selectedOrder.estado);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.key}
                    className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : isPassed
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-white border-dashed border-slate-200 opacity-40 text-slate-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                      isCurrent ? 'bg-emerald-700 text-white' : isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight hidden sm:block">
                      {stage.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pickup Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Punto de Retiro
              </span>
              <p className="font-bold text-slate-800">{selectedOrder.punto_retiro}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Fecha Estimada
              </span>
              <p className="font-bold text-slate-800">{selectedOrder.fecha_retiro}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cosechas Reservadas</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
              {selectedOrder.items.map((i, index) => (
                <div key={index} className="p-2.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{i.cantidad} × {i.nombre}</span>
                  <span className="font-bold text-slate-900">{i.subtotal.toFixed(2)} Bs</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      ) : (
        /* Lista de Pedidos de Ejemplo para probar */
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
            Reservas Recientes en el Sistema
          </h2>
          <div className="space-y-2">
            {orders.slice(0, 4).map((o) => (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <span className="font-black text-emerald-800 text-sm">{o.codigo}</span>
                  <span className="text-slate-500 ml-2 font-medium">({o.cliente_nombre})</span>
                  <p className="text-[11px] text-slate-500">📍 {o.punto_retiro}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{o.total_bs.toFixed(2)} Bs</span>
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                    {o.estado}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
