import React, { useState } from 'react';
import { TEMPLATES_CATALOG, TemplateDefinition } from '../../services/templateCatalog';
import { PaymentCard } from '../../types/paymentCard';
import { CardRenderer } from '../card/CardRenderer';
import { PlusCircle, Check, Sparkles, Filter, ArrowRight } from 'lucide-react';

interface TemplatesCatalogViewProps {
  onSelectTemplateToCreate: (template: TemplateDefinition) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const TemplatesCatalogView: React.FC<TemplatesCatalogViewProps> = ({
  onSelectTemplateToCreate,
  onNotify
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [previewTemplateId, setPreviewTemplateId] = useState<string>(TEMPLATES_CATALOG[0].id);

  const categories = ['Todos', 'Minimalismo & Lujo', 'Empresarial & Corporativo', 'Tecnología & Finanzas', 'Gastronomía & Hospitality', 'Retail & Comercio', 'Creativo & Moderno'];

  const filtered = TEMPLATES_CATALOG.filter(t => {
    if (selectedCategory === 'Todos') return true;
    return t.category.includes(selectedCategory) || selectedCategory.includes(t.category);
  });

  const activeTemplate = TEMPLATES_CATALOG.find(t => t.id === previewTemplateId) || TEMPLATES_CATALOG[0];

  // Tarjeta sintética de demostración basada en la plantilla seleccionada
  const demoCard: PaymentCard = {
    id: 'demo_catalog',
    slug: 'demo-negocio',
    businessName: activeTemplate.name.replace(/^\d+\.\s*/, ''),
    tagline: activeTemplate.description,
    category: activeTemplate.category,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logoShape: 'circle',
    logoSize: 'md',
    logoAlignment: 'center',
    templateId: activeTemplate.id,
    theme: { ...activeTemplate.defaultTheme },
    banking: {
      enabled: true,
      sectionTitle: 'Transferencias Bancarias (SPEI)',
      accounts: [
        {
          id: 'demo_acc_1',
          accountLabel: 'Cuenta Principal',
          beneficiary: 'Empresa Comercial SA de CV',
          bankName: 'BBVA México',
          clabe: '012180001234567897',
          accountNumber: '0123456789',
          cardNumber: '4152313498765432',
          accountType: 'Cheques / SPEI',
          reference: 'Folio Pedido',
          concept: 'Pago Servicio',
          currency: 'MXN',
          instructions: 'Envía tu comprobante digital para validación inmediata.',
          customFields: [],
          visibleFields: {
            beneficiary: true,
            bankName: true,
            clabe: true,
            accountNumber: true,
            cardNumber: true,
            accountType: true,
            reference: true,
            concept: true,
            currency: true,
            instructions: true
          },
          shareInWhatsApp: true
        }
      ]
    },
    paypal: {
      enabled: true,
      sectionTitle: 'Pago con Tarjeta o Saldo PayPal',
      payUrl: 'https://paypal.me/negociodemo',
      businessName: 'Negocio Oficial',
      description: 'Aceptamos pagos con tarjetas de débito y crédito.',
      suggestedAmount: '350.00',
      currency: 'MXN',
      buttonText: 'Pagar con PayPal',
      instructions: 'Procesamiento seguro en plataforma oficial.'
    },
    googleReview: {
      enabled: true,
      sectionTitle: '¿Te encantó nuestro servicio?',
      reviewUrl: 'https://g.page/r/negociodemo/review',
      buttonText: 'Califícanos en Google ★★★★★',
      message: 'Tu opinión nos ayuda a seguir creciendo. ¡Gracias!'
    },
    whatsapp: {
      enabled: true,
      phoneNumber: '525512345678',
      shareCardMessage: 'Te comparto nuestra tarjeta de pago:',
      shareBankMessage: 'Datos para transferencia bancaria:',
      shareAllMessage: 'Aquí tienes todos nuestros métodos de pago:',
      promptText: 'Confirmar pago por WhatsApp'
    },
    qrCode: {
      enabled: true,
      includeLogo: true,
      size: 260,
      fgColor: '#0f172a',
      bgColor: '#ffffff'
    },
    publicNotes: 'Datos comerciales oficiales para clientes.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
          Catálogo Oficial de 26 Plantillas Comerciales
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cada diseño responde a un giro comercial específico con estructura visual, tipografía y estilo adaptados para máxima conversión.
        </p>
      </div>

      {/* Filtro de Categorías */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Layout de Catálogo: Izquierda Lista de 26 Plantillas, Derecha Vista Previa Flotante */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista de Plantillas (7 columnas) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((tmpl) => {
            const isSelected = tmpl.id === previewTemplateId;
            return (
              <div
                key={tmpl.id}
                onClick={() => setPreviewTemplateId(tmpl.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: tmpl.accentColor }} 
                    />
                    <h3 className="text-sm font-bold text-slate-100 truncate">
                      {tmpl.name}
                    </h3>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-400 mb-2">
                    {tmpl.badgeText}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                    {tmpl.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {tmpl.category}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplateToCreate(tmpl);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <span>Usar diseño</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vista Previa Interactiva de la Plantilla Seleccionada (5 columnas) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {activeTemplate.name}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {activeTemplate.badgeText}
                </span>
              </div>

              <button
                onClick={() => onSelectTemplateToCreate(activeTemplate)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Crear Tarjeta</span>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[640px] p-2 bg-slate-950/90 rounded-2xl border border-slate-800/80">
              <CardRenderer
                card={demoCard}
                isInteractive={true}
                onNotify={onNotify}
                viewMode="mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
