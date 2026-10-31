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

      {/* Paletas rápidas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3"><h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Paletas premium prediseñadas</h4><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          {name:'Obsidiana / Oro',primary:'#d6b77a',secondary:'#a87935',background:'#17130c',surface:'#241d12',text:'#fff8e8',buttonText:'#17130c'},
          {name:'Zafiro',primary:'#60a5fa',secondary:'#2563eb',background:'#071629',surface:'#102b49',text:'#eff6ff',buttonText:'#071629'},
          {name:'Esmeralda',primary:'#34d399',secondary:'#059669',background:'#061b16',surface:'#103126',text:'#ecfdf5',buttonText:'#06251b'},
          {name:'Rose Gold',primary:'#e8b4ad',secondary:'#b76e79',background:'#24151b',surface:'#38242b',text:'#fff7f5',buttonText:'#24151b'},
          {name:'Amatista',primary:'#c4b5fd',secondary:'#7c3aed',background:'#160d2b',surface:'#281a42',text:'#faf5ff',buttonText:'#160d2b'},
          {name:'Carbono',primary:'#67e8f9',secondary:'#0891b2',background:'#080d14',surface:'#111c27',text:'#ecfeff',buttonText:'#080d14'},
          {name:'Champagne',primary:'#e8cc91',secondary:'#a87935',background:'#211a10',surface:'#302719',text:'#fffaf0',buttonText:'#211a10'},
          {name:'Marfil',primary:'#475569',secondary:'#94a3b8',background:'#f1f5f9',surface:'#ffffff',text:'#0f172a',buttonText:'#ffffff'}
        ].map(p=><button key={p.name} type="button" onClick={()=>updateTheme({primaryColor:p.primary,secondaryColor:p.secondary,backgroundColor:p.background,surfaceColor:p.surface,textColor:p.text,accentTextColor:p.primary,buttonBgColor:p.primary,buttonTextColor:p.buttonText,borderColor:p.secondary})} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-left hover:border-emerald-500 transition-colors"><span className="block h-5 rounded-md mb-2" style={{background:`linear-gradient(90deg,${p.primary},${p.secondary})`}}/><span className="text-[11px] text-slate-200 font-semibold">{p.name}</span></button>)}
      </div></div>

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

      {/* Degradados y acabados metálicos */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4"><h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Degradados y acabados metálicos</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-xs font-medium text-slate-300">Fondo degradado<select value={theme.backgroundGradient||''} onChange={e=>updateTheme({backgroundGradient:e.target.value||undefined})} className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs">
          <option value="">Sin degradado</option><option value="linear-gradient(135deg,#09090f 0%,#7f1d3d 55%,#f472b6 100%)">Rubí / Rosa</option><option value="linear-gradient(135deg,#061629 0%,#075985 50%,#67e8f9 100%)">Zafiro / Cian</option><option value="linear-gradient(135deg,#052e1a 0%,#047857 55%,#a3e635 100%)">Esmeralda</option><option value="linear-gradient(135deg,#1e1b4b 0%,#6d28d9 55%,#c4b5fd 100%)">Violeta</option><option value="linear-gradient(135deg,#431407 0%,#9a3412 50%,#fbbf24 100%)">Cobre / Ámbar</option><option value="linear-gradient(135deg,#f8fafc 0%,#cbd5e1 55%,#64748b 100%)">Plata / Hielo</option><option value="linear-gradient(135deg,#211a10 0%,#a87935 55%,#f4e3b4 100%)">Champagne / Oro</option><option value="linear-gradient(135deg,#0f172a 0%,#334155 50%,#94a3b8 100%)">Titanio</option>
        </select></label>
        <label className="block text-xs font-medium text-slate-300">Acabado metálico<select value={theme.metallicStyle||'none'} onChange={e=>updateTheme({metallicStyle:e.target.value as any})} className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs"><option value="none">Sin acabado metálico</option><option value="gold">Oro</option><option value="silver">Plata</option><option value="rose-gold">Oro rosa</option><option value="titanium">Titanio</option></select></label>
      </div></div>

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
            { id: 'mono', name: 'JetBrains Mono', desc: 'Fintech & técnica', sample: '012 345 678' },
            { id: 'poppins', name: 'Poppins', desc: 'Geométrica y actual', sample: 'Aa Bb 123' },
            { id: 'montserrat', name: 'Montserrat', desc: 'Corporativa y firme', sample: 'Aa Bb 123' },
            { id: 'lora', name: 'Lora', desc: 'Editorial y elegante', sample: 'Aa Bb 123' },
            { id: 'space', name: 'Space Grotesk', desc: 'Tecnológica y moderna', sample: 'Aa Bb 123' }
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
        </div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
          {[
            {key:'businessNameFontSize',label:'Tamaño del nombre',min:16,max:42,fallback:24},
            {key:'taglineFontSize',label:'Tamaño del eslogan',min:10,max:24,fallback:14},
            {key:'categoryFontSize',label:'Tamaño de categoría',min:9,max:18,fallback:11}
          ].map(item=><label key={item.key} className="block text-xs font-medium text-slate-300"><span className="flex justify-between mb-2"><span>{item.label}</span><strong className="text-emerald-400">{(theme as any)[item.key]||item.fallback}px</strong></span><input type="range" min={item.min} max={item.max} value={(theme as any)[item.key]||item.fallback} onChange={e=>updateTheme({[item.key]:Number(e.target.value)} as any)} className="w-full accent-emerald-500"/></label>)}
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
