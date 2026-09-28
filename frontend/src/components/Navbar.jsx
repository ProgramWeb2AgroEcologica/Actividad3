import React, { useState } from 'react';
import { Sprout, ShoppingBag, Menu, X, Sparkles, ClipboardList, Search, UserCheck } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, cartCount, onOpenCart, onStartTour }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Catálogo Semanal', icon: Sprout },
    { id: 'checkout', label: 'Reservar Cosecha', icon: ClipboardList },
    { id: 'orders', label: 'Mis Pedidos', icon: Search },
    { id: 'producer', label: 'Panel Productor', icon: UserCheck }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => handleNavClick('catalog')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-sm shadow-emerald-800/30">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-emerald-950 tracking-tight">EcoFeria</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Santa Cruz
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xs:block">Cosecha directa • Cero intermediarios</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200" aria-label="Navegación principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-${item.id}`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-white/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Tour Button + Cart Button + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Driver.js Onboarding button */}
            <button
              onClick={onStartTour}
              id="tour-guide-trigger-btn"
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs font-bold transition-colors min-h-[44px]"
              title="Iniciar tour guiado interactivo"
              aria-label="Ver tour guiado interactivo de EcoFeria"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Tour Guía</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="tour-cart-btn"
              className="relative flex items-center justify-center p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-all min-h-[44px] min-w-[44px]"
              aria-label={`Ver canasta, ${cartCount} productos`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-slate-200 space-y-1 animate-in slide-in-from-top-2 duration-150" aria-label="Menú móvil">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
