import React, { useState } from 'react';
import { Layout, Check, Sparkles, RefreshCw } from 'lucide-react';
import { PaymentCard } from '../../../types/paymentCard';
import { TEMPLATES_CATALOG, getTemplateById } from '../../../services/templateCatalog';

interface TemplatesTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Minimalismo & Lujo', 'Empresarial & Corporativo', 'Tecnología & Finanzas', 'Gastronomía & Hospitality', 'Retail & Comercio', 'Creativo & Moderno'];

  const filteredTemplates = TEMPLATES_CATALOG.filter(t => {
    if (selectedCategory === 'Todos') return true;
    return t.category.includes(selectedCategory) || selectedCategory.includes(t.category);
  });

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = getTemplateById(templateId);
    // Cambiar la plantilla pero preservar los datos de cuentas, paypal y negocio
    onChange({
      templateId,
      theme: { ...tmpl.defaultTheme }
    });
    onNotify('Plantilla cambiada', `Se ha aplicado el diseño "${tmpl.name}". Tus datos se conservan intactos.`, 'success');
  };

  const handleResetToTemplateTheme = () => {
    const tmpl = getTemplateById(card.templateId);
    onChange({
      theme: { ...tmpl.defaultTheme }
    });
    onNotify('Estilos restablecidos', `Se restauraron los colores y tipografía original de "${tmpl.name}".`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <span>20 Plantillas Comerciales Verdaderamente Diferentes</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Cada plantilla cuenta con una composición visual, tipografía y distribución única. Cambiar de plantilla no borra ningún dato.
          </p>
        </div>

        <button
          onClick={handleResetToTemplateTheme}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
          title="Restablecer colores originales de la plantilla actual"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restaurar Estilo Original</span>
        </button>
      </div>

      {/* Filtro por Categorías */}
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

      {/* Cuadrícula de 20 Plantillas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isSelected = card.templateId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Indicador de Seleccionado */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div>
                {/* Cabecera de la plantilla */}
                <div className="flex items-center gap-2 mb-2 pr-7">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shrink-0" 
                    style={{ backgroundColor: template.accentColor }} 
                  />
                  <h4 className="text-sm font-bold text-slate-100 tracking-tight">
                    {template.name}
                  </h4>
                </div>

                <div className="text-[11px] font-semibold text-emerald-400 mb-2">
                  {template.badgeText} • <span className="text-slate-400 font-normal">{template.category}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {template.description}
                </p>

                {/* Características destacadas */}
                <div className="space-y-1 mb-4">
                  {template.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Muestra de Colores Predeterminados */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-5 h-5 rounded-md border border-slate-700 shadow-sm"
                    style={{ backgroundColor: template.defaultTheme.primaryColor }}
                    title="Color principal"
                  />
                  <div 
                    className="w-5 h-5 rounded-md border border-slate-700 shadow-sm"
                    style={{ backgroundColor: template.defaultTheme.backgroundColor }}
                    title="Color de fondo"
                  />
                  <div 
                    className="w-5 h-5 rounded-md border border-slate-700 shadow-sm"
                    style={{ backgroundColor: template.defaultTheme.surfaceColor }}
                    title="Superficie de tarjeta"
                  />
                </div>

                <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isSelected ? 'Activa' : 'Seleccionar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
