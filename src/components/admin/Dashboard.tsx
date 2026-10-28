import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Globe, 
  ExternalLink, 
  Copy, 
  Share2, 
  QrCode, 
  Edit3, 
  CopyPlus, 
  Trash2, 
  ShieldCheck, 
  Building2, 
  CreditCard, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { PaymentCard } from '../../types/paymentCard';
import { getTemplateById } from '../../services/templateCatalog';
import { getCardPublicUrl } from '../../services/apiService';

interface DashboardProps {
  cards: PaymentCard[];
  onSelectCard: (card: PaymentCard) => void;
  onNewCard: () => void;
  onDuplicateCard: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onTogglePublish: (card: PaymentCard) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cards,
  onSelectCard,
  onNewCard,
  onDuplicateCard,
  onDeleteCard,
  onTogglePublish,
  onNotify
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteModalCardId, setDeleteModalCardId] = useState<string | null>(null);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; card: PaymentCard | null; qrUrl: string }>({
    isOpen: false,
    card: null,
    qrUrl: ''
  });

  // Filtrado y búsqueda
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && card.status === statusFilter;
  });

  // Métricas rápidas
  const totalCards = cards.length;
  const publishedCards = cards.filter(c => c.status === 'published').length;
  const totalBankAccounts = cards.reduce((acc, c) => acc + (c.banking?.accounts?.length || 0), 0);
  const totalWithPayPal = cards.filter(c => c.paypal?.enabled && c.paypal?.payUrl).length;

  const handleCopyLink = (card: PaymentCard) => {
    const url = getCardPublicUrl(card.slug);
    navigator.clipboard.writeText(url);
    onNotify('Enlace copiado', url, 'success');
  };

  const handleShareWhatsApp = (card: PaymentCard) => {
    const url = getCardPublicUrl(card.slug);
    const msg = `Hola, te comparto la tarjeta digital oficial de pago de ${card.businessName}:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenQR = async (card: PaymentCard) => {
    try {
      const url = getCardPublicUrl(card.slug);
      const qrData = await QRCode.toDataURL(url, {
        width: 600,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setQrModalData({
        isOpen: true,
        card,
        qrUrl: qrData
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrModalData.qrUrl || !qrModalData.card) return;
    const a = document.createElement('a');
    a.href = qrModalData.qrUrl;
    a.download = `QR_Pagos_${qrModalData.card.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify('Código QR descargado', 'Imagen PNG lista para imprimir o colocar en mostrador.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Encabezado y Métricas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            Biblioteca de Tarjetas Digitales
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Crea, administra y publica tarjetas de pago con transferencias bancarias SPEI, PayPal y Google.
          </p>
        </div>

        <button
          onClick={onNewCard}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Nueva Tarjeta</span>
        </button>
      </div>

      {/* Franja de Métricas / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total de Tarjetas
          </span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
            {totalCards}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Publicadas Activas
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {publishedCards}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Cuentas Bancarias
          </span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
            {totalBankAccounts}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
            Con PayPal
          </span>
          <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
            {totalWithPayPal}
          </span>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por negocio, slug o categoría..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({totalCards})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Publicadas ({publishedCards})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Borradores ({totalCards - publishedCards})
          </button>
        </div>
      </div>

      {/* 3. Cuadrícula de Tarjetas */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const template = getTemplateById(card.templateId);
            const publicUrl = getCardPublicUrl(card.slug);
            const isPublished = card.status === 'published';

            return (
              <div
                key={card.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {card.logoUrl ? (
                        <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          <img src={card.logoUrl} alt={card.businessName} className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow shrink-0"
                          style={{ backgroundColor: card.theme.primaryColor, color: card.theme.buttonTextColor || '#ffffff' }}
                        >
                          {card.businessName.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                          {card.businessName}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {card.tagline || card.category || 'Tarjeta Digital de Pago'}
                        </p>
                      </div>
                    </div>

                    {/* Estado */}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      isPublished
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>

                  {/* Metadatos y Plantilla */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Plantilla:</span>
                      <span className="font-semibold text-slate-200">{template.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Cuentas activas:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{card.banking?.accounts?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Enlace público:</span>
                      <span className="font-mono text-[11px] text-slate-300 truncate max-w-[150px]">
                        /{card.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => onSelectCard(card)}
                      className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                      title="Editar en el panel"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(card)}
                      className="flex items-center justify-center p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Copiar enlace público"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(card)}
                      className="flex items-center justify-center p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
                      title="Compartir por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenQR(card)}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Ver y descargar código QR"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver QR</span>
                      </button>

                      <span>•</span>

                      <button
                        onClick={() => onDuplicateCard(card.id)}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Duplicar como nueva tarjeta"
                      >
                        <CopyPlus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Duplicar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTogglePublish(card)}
                        className="hover:text-amber-400 transition-colors cursor-pointer text-[10px]"
                        title={isPublished ? 'Pasar a borrador' : 'Publicar tarjeta'}
                      >
                        {isPublished ? 'Despublicar' : 'Publicar'}
                      </button>

                      <button
                        onClick={() => setDeleteModalCardId(card.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded transition-colors cursor-pointer"
                        title="Eliminar tarjeta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-1">
            No se encontraron tarjetas
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {searchTerm ? 'No hay resultados que coincidan con tu búsqueda.' : 'Crea tu primera tarjeta de pago digital para empezar a recibir transferencias y pagos con PayPal.'}
          </p>
          <button
            onClick={onNewCard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Primera Tarjeta</span>
          </button>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar */}
      {deleteModalCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-2">¿Eliminar tarjeta?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Esta acción no se puede deshacer. Los datos de la tarjeta y su URL pública se darán de baja permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalCardId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const id = deleteModalCardId;
                  setDeleteModalCardId(null);
                  onDeleteCard(id);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Código QR Rápido */}
      {qrModalData.isOpen && qrModalData.card && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 shadow-2xl border border-slate-800">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold tracking-tight">{qrModalData.card.businessName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Escanéalo con cualquier celular para abrir la tarjeta de pago al instante.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center mb-4">
              <img src={qrModalData.qrUrl} alt="QR de Pago" className="w-48 h-48" />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownloadQrPng}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen PNG (Imprimir)</span>
              </button>

              <button
                onClick={() => handleCopyLink(qrModalData.card!)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Enlace de la Tarjeta</span>
              </button>

              <button
                onClick={() => setQrModalData({ isOpen: false, card: null, qrUrl: '' })}
                className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
