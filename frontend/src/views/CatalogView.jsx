import React, { useState } from 'react';
import { Search, MapPin, Tag, Plus, Check, Sparkles, Filter, Leaf, ShoppingBag, ShieldCheck, User } from 'lucide-react';

export function CatalogView({ products, loading, cart, addToCart, updateQty, onOpenCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCommunity, setSelectedCommunity] = useState('Todas');

  const categories = ['Todos', 'Hortalizas', 'Frutas', 'Tubérculos', 'Artesanales', 'Granja'];
  const communities = ['Todas', 'Samaipata', 'El Torno', 'Porongo', 'Vallegrande'];

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    if (!p.activo) return false;
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.categoria === selectedCategory;
    const matchesCommunity = selectedCommunity === 'Todas' || p.comunidad === selectedCommunity;
    return matchesSearch && matchesCategory && matchesCommunity;
  });

  const getCartQuantity = (productId) => {
    const item = cart.find((i) => i.id === productId);
    return item ? item.cantidad : 0;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero & Territorial Impact Banner */}
      <section
        id="tour-brand"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 shadow-xl"
        aria-label="Presentación de EcoFeria Santa Cruz"
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 backdrop-blur-xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            <span>Feria Agroecológica Departamental • Santa Cruz</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Cosechas frescas del valle, <span className="text-emerald-300">directo a tu mesa</span>
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Reserva tus hortalizas y frutas limpias antes de la cosecha. Paga a precio justo en el punto de retiro ferial y apoya directamente a las familias campesinas de El Torno, Samaipata y Porongo.
          </p>

          {/* Sostenibilidad y métricas vinculadas a la Actividad 01 */}
          <div
            id="tour-impact-banner"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-700/50"
          >
            <div className="bg-emerald-950/40 border border-emerald-700/40 p-2.5 rounded-xl">
              <span className="text-xl sm:text-2xl font-black text-amber-400">0%</span>
              <p className="text-[11px] text-emerald-200 font-medium leading-tight">Intermediarios </p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-700/40 p-2.5 rounded-xl">
              <span className="text-xl sm:text-2xl font-black text-emerald-300">100%</span>
              <p className="text-[11px] text-emerald-200 font-medium leading-tight">Trabajo Campesino </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-emerald-950/40 border border-emerald-700/40 p-2.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0" />
              <p className="text-[11px] text-emerald-200 font-medium leading-tight">100% Agroecológico </p>
            </div>
          </div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Filter and Search Bar */}
      <section
        id="tour-filters"
        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
        aria-label="Filtros del catálogo"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar hortaliza, fruta o productor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all min-h-[44px]"
              aria-label="Buscar cosechas"
            />
          </div>

          {/* Community Filter */}
          <div className="flex items-center gap-2 sm:w-64">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 hidden sm:block" />
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white min-h-[44px]"
              aria-label="Filtrar por municipio o comunidad"
            >
              {communities.map((c) => (
                <option key={c} value={c}>
                  {c === 'Todas' ? '📍 Todas las Comunidades' : `📍 ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills (Mobile horizontal scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Categorías de productos">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                role="tab"
                aria-selected={isSelected}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[40px] flex items-center gap-1.5 ${isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
              >
                <Tag className="w-3 h-3 opacity-70" />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section
        id="tour-products-grid"
        className="space-y-4"
        aria-label="Listado de cosechas disponibles"
      >
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Cosechas Semanales Disponibles ({filteredProducts.length})
          </h2>
          {cart.length > 0 && (
            <button
              onClick={onOpenCart}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 min-h-[40px]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ver Canasta ({cart.reduce((a, b) => a + b.cantidad, 0)})</span>
            </button>
          )}
        </div>

        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="h-32 bg-slate-100 rounded-xl" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No se encontraron cosechas</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Intenta cambiando los filtros de búsqueda o categoría para ver la oferta de otros valles.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedCommunity('Todas');
              }}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors min-h-[44px]"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const qty = getCartQuantity(product.id);
              const isAvailable = product.stock > 0;

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all p-4 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header with Product Photography and Badges */}
                    <div className="relative h-44 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden mb-3">
                      <img
                        src={product.imagen_url || '/images/lechuga.jpg'}
                        alt={product.nombre}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                        }}
                      />

                      {/* Community Badge */}
                      <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        {product.comunidad}
                      </span>

                      {/* Stock Badge */}
                      <span className={`absolute top-2 right-2 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs ${product.stock <= 10
                          ? 'bg-amber-100/95 backdrop-blur-xs text-amber-900 border border-amber-200'
                          : 'bg-emerald-100/95 backdrop-blur-xs text-emerald-900 border border-emerald-200'
                        }`}>
                        {product.stock > 0 ? `${product.stock} disp.` : 'Agotado'}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                        {product.categoria}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                        {product.nombre}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {product.descripcion}
                      </p>
                    </div>

                    {/* Producer */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        {product.productor_nombre}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Area */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-500 block">Precio Justo</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-emerald-800">
                          {product.precio_bs.toFixed(2)} Bs
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          / {product.unidad}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button or Stepper */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!isAvailable}
                        className="bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 min-h-[48px] shadow-xs"
                        aria-label={`Añadir ${product.nombre} a la canasta`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQty(product.id, qty - 1)}
                          className="w-8 h-8 rounded-lg bg-white text-emerald-800 font-black flex items-center justify-center hover:bg-emerald-100 transition-colors min-h-[36px] min-w-[36px]"
                          aria-label={`Disminuir ${product.nombre}`}
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-black text-emerald-950 text-sm">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQty(product.id, qty + 1)}
                          disabled={qty >= product.stock}
                          className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-black flex items-center justify-center hover:bg-emerald-800 disabled:opacity-40 transition-colors min-h-[36px] min-w-[36px]"
                          aria-label={`Aumentar ${product.nombre}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
