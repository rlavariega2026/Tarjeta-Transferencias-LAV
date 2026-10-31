import React from 'react';
import { PlusCircle, ExternalLink, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HeaderProps {
  currentView: 'dashboard' | 'editor' | 'templates' | 'hostinger';
  onNavigate: (view: 'dashboard' | 'editor' | 'templates' | 'hostinger') => void;
  onNewCard: () => void;
  isEditing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onNewCard,
  isEditing
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark, no compound badge pills) */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-white text-base tracking-tighter">LP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-slate-100 tracking-tight whitespace-nowrap">
              LAV Digital <span className="text-emerald-400 font-semibold">Pagos</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text links with hover transitions) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'dashboard' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Mis Tarjetas
          </button>

          <button
            onClick={() => onNavigate('editor')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'editor' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            {isEditing ? 'Editor Activo' : 'Editor de Tarjeta'}
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'templates' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Catálogo Oficial de 20 Plantillas Comerciales
          </button>

          <button
            onClick={() => onNavigate('hostinger')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'hostinger' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Despliegue Hostinger
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
              title="Instalar aplicación en dispositivo"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Instalar App
            </button>
          )}

          <button
            onClick={onNewCard}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Tarjeta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
