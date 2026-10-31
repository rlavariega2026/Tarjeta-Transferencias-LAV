import React, { useState } from 'react';
import { 
  Save, 
  Globe, 
  Eye, 
  Smartphone, 
  Monitor, 
  Copy, 
  Share2, 
  CopyCheck, 
  Trash2, 
  Sparkles,
  ArrowLeft,
  Building,
  Layout,
  Palette,
  Building2,
  CreditCard,
  Star,
  MessageCircle,
  QrCode,
  Server,
  AlertCircle
} from 'lucide-react';
import { PaymentCard } from '../../types/paymentCard';
import { IdentityTab } from './tabs/IdentityTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { CustomizationTab } from './tabs/CustomizationTab';
import { BankingTab } from './tabs/BankingTab';
import { PayPalTab } from './tabs/PayPalTab';
import { GoogleReviewTab } from './tabs/GoogleReviewTab';
import { WhatsAppTab } from './tabs/WhatsAppTab';
import { QRCodeTab } from './tabs/QRCodeTab';
import { HostingerTab } from './tabs/HostingerTab';
import { CardRenderer } from '../card/CardRenderer';
import { getCardPublicUrl } from '../../services/apiService';

interface EditorLayoutProps {
  card: PaymentCard;
  allCards: PaymentCard[];
  onChange: (card: PaymentCard) => void;
  onSave: (card: PaymentCard, isPublish: boolean) => Promise<void>;
  onBack: () => void;
  onDelete: (id: string) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export type EditorTabKey = 
  | 'identity' 
  | 'templates' 
  | 'customization' 
  | 'banking' 
  | 'paypal' 
  | 'google' 
  | 'whatsapp' 
  | 'qr' 
  | 'hostinger';

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  card,
  allCards,
  onChange,
  onSave,
  onBack,
  onDelete,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<EditorTabKey>('identity');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const publicUrl = getCardPublicUrl(card.slug);

  const updateCard = (updates: Partial<PaymentCard>) => {
    onChange({ ...card, ...updates });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await onSave({ ...card, status: 'draft' }, false);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Validaciones antes de publicar
    if (!card.businessName.trim()) {
      onNotify('Requisito pendiente', 'Por favor ingresa el nombre comercial del negocio antes de publicar.', 'error');
      setActiveTab('identity');
      return;
    }

    if (!card.slug.trim()) {
      onNotify('Requisito pendiente', 'El enlace permanente (slug) no puede estar vacío.', 'error');
      setActiveTab('identity');
      return;
    }

    // Verificar cuentas bancarias
    if (card.banking.enabled && card.banking.accounts.length === 0) {
      onNotify('Requisito pendiente', 'Has activado transferencias pero no has agregado ninguna cuenta bancaria.', 'error');
      setActiveTab('banking');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ ...card, status: 'published' }, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    onNotify('Enlace copiado', publicUrl, 'success');
  };

  const handleShareWhatsApp = () => {
    const text = `Hola, te comparto nuestra tarjeta digital de pago:\n${publicUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const tabsConfig = [
    { key: 'identity', label: 'Identidad & Logo', icon: Building },
    { key: 'templates', label: '36 Plantillas', icon: Layout },
    { key: 'customization', label: 'Personalizar', icon: Palette },
    { key: 'banking', label: 'Cuentas Bancarias', icon: Building2 },
    { key: 'paypal', label: 'PayPal', icon: CreditCard },
    { key: 'google', label: 'Reseñas Google', icon: Star },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { key: 'qr', label: 'Código QR', icon: QrCode },
    { key: 'hostinger', label: 'Hostinger & API', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra Superior de Control del Editor */}
      <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Volver a lista de tarjetas"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  {card.businessName || 'Nueva Tarjeta de Pago'}
                </h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  card.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {card.status === 'published' ? 'Publicada' : 'Borrador'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                {publicUrl}
              </div>
            </div>
          </div>

          {/* Botones de Guardado y Publicación */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
              title="Copiar enlace público"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-2 text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
              title="Compartir por WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{card.status === 'published' ? 'Actualizar Publicación' : 'Publicar Tarjeta'}</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
              title="Eliminar tarjeta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cuerpo Principal del Editor (2 Columnas: Izquierda Controles, Derecha Vista Previa) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Pestañas de Configuración (7 de 12 columnas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navegador de Pestañas con Iconos */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
            {tabsConfig.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as EditorTabKey)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Renderizado de la pestaña activa */}
          {activeTab === 'identity' && (
            <IdentityTab card={card} onChange={updateCard} allCards={allCards} onNotify={onNotify} />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'customization' && (
            <CustomizationTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'banking' && (
            <BankingTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'paypal' && (
            <PayPalTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'google' && (
            <GoogleReviewTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'qr' && (
            <QRCodeTab card={card} onChange={updateCard} onNotify={onNotify} />
          )}

          {activeTab === 'hostinger' && (
            <HostingerTab onNotify={onNotify} />
          )}
        </div>

        {/* Columna Derecha: Vista Previa en Tiempo Real (5 de 12 columnas) */}
        <div className="lg:col-span-5 sticky top-36">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-xl">
            {/* Controles de Vista Previa */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vista Previa en Vivo
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Interactiva
                </span>
              </div>

              {/* Selector Móvil / Escritorio */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Modo Celular (Pantalla Móvil)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Modo Ampliado / Escritorio"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Marco de Dispositivo Móvil */}
            <div className="flex justify-center overflow-y-auto max-h-[720px] p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              <div className={previewDevice === 'mobile' ? 'w-full max-w-[380px]' : 'w-full'}>
                <CardRenderer
                  card={card}
                  isInteractive={true}
                  onNotify={onNotify}
                  viewMode={previewDevice}
                />
              </div>
            </div>

            <div className="mt-3 text-center text-[11px] text-slate-500">
              💡 Puedes probar los botones de copiar, WhatsApp y QR directamente en esta vista previa.
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-2">¿Eliminar esta tarjeta?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Esta acción no se puede deshacer. Se eliminarán permanentemente los datos bancarios y su enlace público asociado (<code>{card.slug}</code>).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(card.id);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
