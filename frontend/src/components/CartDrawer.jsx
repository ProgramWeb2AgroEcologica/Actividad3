import React from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';

export function CartDrawer({ isOpen, onClose, cart, updateQty, removeFromCart, onCheckout }) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.precio_bs * item.cantidad, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Canasta de Cosechas">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg text-emerald-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Canasta Agroecológica</h2>
              <p className="text-xs text-emerald-200">{totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar canasta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-semibold text-slate-800 text-lg">Tu canasta está vacía</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Selecciona hortalizas, frutas y productos limpios directo de nuestros productores.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                  <img
                    src={item.imagen_url || '/images/lechuga.jpg'}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm truncate">{item.nombre}</h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    {item.precio_bs.toFixed(2)} Bs <span className="text-slate-500 font-normal">/ {item.unidad}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{item.comunidad} • {item.productor_nombre}</p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                  <button
                    onClick={() => updateQty(item.id, item.cantidad - 1)}
                    className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800" aria-label={`Cantidad: ${item.cantidad}`}>
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded disabled:opacity-40 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label={`Eliminar ${item.nombre} de la canasta`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span><strong>Impacto directo:</strong> El 100% de este pago va a las familias productoras, sin comisiones de intermediarios.</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-slate-600 font-medium">Total a Pagar en Feria:</span>
              <span className="text-2xl font-black text-emerald-800">{total.toFixed(2)} Bs</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm min-h-[48px]"
              id="tour-cart-checkout-btn"
            >
              <span>Confirmar Reserva de Cosecha</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
