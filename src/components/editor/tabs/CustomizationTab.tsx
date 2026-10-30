import React, { useRef } from 'react';
import { Palette, Type, Square, Sliders, RotateCcw } from 'lucide-react';
import { PaymentCard } from '../../../types/paymentCard';
import { getTemplateById } from '../../../services/templateCatalog';
import { uploadLogo } from '../../../services/apiService';

interface CustomizationTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomizationTab: React.FC<CustomizationTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const theme = card.theme;
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundUpload = async (file?: File) => {
    if (!file) return;
    try {
      const result = await uploadLogo(file);
      updateTheme({ backgroundImage: result.url });
      onNotify('Fondo actualizado', 'La imagen se guardó y aparecerá en la tarjeta publicada.', 'success');
    } catch (error: any) {
      onNotify('No se pudo cargar el fondo', error?.message || 'Usa una imagen PNG, JPG o WebP.', 'error');
    }
  };

  const updateTheme = (updates: Partial<typeof card.theme>) => {
    onChange({
      theme: { ...theme, ...updates }
    });
  };

  const handleResetToTemplateDefault = () => {
    const tmpl = getTemplateById(card.templateId);
    onChange({
      theme: { ...tmpl.defaultTheme }
    });
    onNotify('Estilos restaurados', `Se aplicaron los colores y tipografía predeterminados de "${tmpl.name}".`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Botón Restaurar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>Personalización Visual Completa</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajusta los colores, tipografía, bordes y espaciados tanto para la vista previa como para la publicación real.
          </p>
        </div>

        <button
          onClick={handleResetToTemplateDefault}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restablecer Diseño Original</span>
        </button>
      </div>

      {/* Imagen de fondo personalizada */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Imagen de fondo</h4>
          <p className="text-xs text-slate-400 mt-1">Sube una fotografía o textura para colocarla detrás de la tarjeta.</p>
        </div>
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            void handleBackgroundUpload(event.target.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => backgroundInputRef.current?.click()} className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950">
            Subir imagen de fondo
          </button>
          {theme.backgroundImage && (
            <button type="button" onClick={() => updateTheme({ backgroundImage: '' })} className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-rose-300">
              Quitar imagen
            </button>
          )}
        </div>
        {theme.backgroundImage && <img src={theme.backgroundImage} alt="Vista previa del fondo" className="w-full h-32 object-cover rounded-xl border border-slate-700" />}
        <p className="text-[11px] text-slate-500">PNG, JPG o WebP. Máximo 5 MB.</p>
      </div>

      {/* 1. Paleta de Colores */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Paleta de Colores
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Color Principal */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color Principal de Acento
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Color de Fondo General */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color de Fondo General
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : '#f8fafc'}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Color de Tarjeta / Superficie */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color de Superficie (Cuerpo de Tarjeta)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.surfaceColor.startsWith('#') ? theme.surfaceColor : '#ffffff'}
                onChange={(e) => updateTheme({ surfaceColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.surfaceColor}
                onChange={(e) => updateTheme({ surfaceColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Color de Texto Principal */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color de Texto Principal
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.textColor.startsWith('#') ? theme.textColor : '#0f172a'}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Color Botón Principal */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color Botones de Acción
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.buttonBgColor.startsWith('#') ? theme.buttonBgColor : theme.primaryColor}
                onChange={(e) => updateTheme({ buttonBgColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.buttonBgColor}
                onChange={(e) => updateTheme({ buttonBgColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Color Texto de Botón */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Color Texto en Botones
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.buttonTextColor.startsWith('#') ? theme.buttonTextColor : '#ffffff'}
                onChange={(e) => updateTheme({ buttonTextColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={theme.buttonTextColor}
                onChange={(e) => updateTheme({ buttonTextColor: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tipografía & Fuente */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4 text-emerald-400" />
          <span>Familia Tipográfica</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'sans', name: 'Plus Jakarta Sans', desc: 'Moderna y legible', sample: 'Aa Bb 123' },
            { id: 'display', name: 'Outfit', desc: 'Geométrica & dinámica', sample: 'Aa Bb 123' },
            { id: 'serif', name: 'Playfair Display', desc: 'Editorial & lujo', sample: 'Aa Bb 123' },
            { id: 'mono', name: 'JetBrains Mono', desc: 'Fintech & técnica', sample: '012 345 678' }
          ].map((font) => (
            <button
              key={font.id}
              onClick={() => updateTheme({ fontFamily: font.id as any })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                theme.fontFamily === font.id
                  ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-bold text-slate-100">{font.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{font.desc}</div>
              <div className="text-xs text-emerald-400 mt-2 font-medium opacity-80">{font.sample}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bordes, Esquinas y Sombras */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Square className="w-4 h-4 text-emerald-400" />
          <span>Geometría, Esquinas & Elevación</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Radio de esquinas */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Radio de Esquinas Redondeadas
            </label>
            <select
              value={theme.borderRadius}
              onChange={(e) => updateTheme({ borderRadius: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="none">Recto (0px - Brutalista / Editorial)</option>
              <option value="sm">Sutil (4px)</option>
              <option value="md">Estándar (8px)</option>
              <option value="lg">Amplio (12px)</option>
              <option value="xl">Redondeado (16px)</option>
              <option value="2xl">Muy Redondeado (24px)</option>
              <option value="3xl">Orgánico Curvado (32px)</option>
            </select>
          </div>

          {/* Elevación / Sombras */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Estilo de Contorno y Sombra
            </label>
            <select
              value={theme.cardElevation}
              onChange={(e) => updateTheme({ cardElevation: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="subtle-border">Borde Milimétrico Fino (Recomendado)</option>
              <option value="soft-shadow">Sombra Suave Flotante</option>
              <option value="flat">Plano sin sombra</option>
              <option value="glass">Cristal Esmerilado (Glassmorphism)</option>
              <option value="bold-border">Borde Grueso Negro (Neo-Brutalismo)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
