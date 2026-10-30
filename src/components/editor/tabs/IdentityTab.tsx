import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon, Building, Tag, Globe, Check, AlertCircle } from 'lucide-react';
import { PaymentCard } from '../../../types/paymentCard';
import { uploadLogo, getHostingerSettings } from '../../../services/apiService';

interface IdentityTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  allCards: PaymentCard[];
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const IdentityTab: React.FC<IdentityTabProps> = ({
  card,
  onChange,
  allCards,
  onNotify
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settings = getHostingerSettings();

  // Slug validation
  const cleanSlug = card.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const isDuplicateSlug = allCards.some(c => c.id !== card.id && c.slug.toLowerCase() === cleanSlug);

  const handleSlugChange = (raw: string) => {
    const formatted = raw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    onChange({ slug: formatted });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onNotify('Subiendo imagen...', 'Procesando archivo de logotipo', 'info');
      const result = await uploadLogo(file);
      onChange({ logoUrl: result.url });
      onNotify('Logotipo cargado', 'La imagen se guardó correctamente en la tarjeta.', 'success');
    } catch (err: any) {
      onNotify('Error al cargar', err.message || 'No se pudo subir la imagen', 'error');
    }
  };

  const handleRemoveLogo = () => {
    onChange({ logoUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    onNotify('Logotipo eliminado', 'Se usará el monograma tipográfico comercial.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Datos Principales del Negocio */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Identidad Comercial del Negocio</span>
        </h3>

        <div className="space-y-4">
          {/* Nombre Comercial */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre Comercial del Negocio <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={card.businessName}
              onChange={(e) => onChange({ businessName: e.target.value })}
              placeholder="Ej. Terraza Gourmet Bistro, Consultoría Jurídica, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Eslogan / Subtítulo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Eslogan o Subtítulo Comercial
            </label>
            <input
              type="text"
              value={card.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="Ej. Cortes Selectos & Cocina de Autor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Categoría / Giro */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Giro Comercial o Categoría
            </label>
            <input
              type="text"
              value={card.category}
              onChange={(e) => onChange({ category: e.target.value })}
              placeholder="Ej. Restaurante, Retail, Servicios Médicos, Inmobiliaria"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Tamaño de los textos de identidad */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Tamaño de textos en la tarjeta</h4>
              <p className="text-[11px] text-slate-400 mt-1">Ajusta cada elemento y revisa el resultado en la vista previa.</p>
            </div>
            {([
              { key: 'businessNameFontSize', label: 'Nombre comercial', value: card.theme.businessNameFontSize || 24, min: 18, max: 42 },
              { key: 'taglineFontSize', label: 'Eslogan o subtítulo', value: card.theme.taglineFontSize || 14, min: 10, max: 26 },
              { key: 'categoryFontSize', label: 'Giro comercial o categoría', value: card.theme.categoryFontSize || 11, min: 9, max: 20 }
            ] as const).map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">{item.label}</label>
                  <span className="text-xs font-mono text-emerald-400">{item.value}px</span>
                </div>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  value={item.value}
                  onChange={(event) => onChange({ theme: { ...card.theme, [item.key]: Number(event.target.value) } })}
                  className="w-full accent-emerald-500"
                />
              </div>
            ))}
          </div>

          {/* Enlace Único / Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Enlace Permanente / Slug Único <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">Solo letras, números y guiones</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={card.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="nombre-del-negocio"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-slate-100 text-sm focus:outline-none transition-colors ${
                  isDuplicateSlug
                    ? 'border-rose-500 pr-10'
                    : 'border-slate-700 focus:border-emerald-500 pr-10'
                }`}
              />
              <div className="absolute right-3 top-3">
                {isDuplicateSlug ? (
                  <span title="Este enlace ya está en uso por otra tarjeta">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </span>
                ) : (
                  <span title="Enlace disponible">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </span>
                )}
              </div>
            </div>

            {isDuplicateSlug && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Atención: Este enlace ya pertenece a otra tarjeta. Elige uno diferente para evitar sobrescribirla.</span>
              </p>
            )}

            {/* Vista previa del enlace público */}
            <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono break-all flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>URL en Hostinger:</span>
              <span className="text-emerald-300">
                {settings.baseUrl || 'https://lavdigitalmkt.com/pagos-digitales/'}t/{card.slug || 'nombre-del-negocio'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Logotipo Comercial */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>Logotipo del Negocio</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Previsualizador del Logotipo */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden p-2 relative group">
              {card.logoUrl ? (
                <>
                  <img
                    src={card.logoUrl}
                    alt="Logo del negocio"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute inset-0 bg-slate-950/80 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-semibold"
                    title="Eliminar logotipo"
                  >
                    <X className="w-4 h-4" />
                    <span>Quitar</span>
                  </button>
                </>
              ) : (
                <div className="text-center p-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-1 text-xs font-bold text-emerald-400">
                    LP
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">Sin logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Controles de Carga y Ajuste */}
          <div className="flex-1 space-y-3 w-full">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                id="logo-upload-input"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir Logotipo (PNG, JPG, WebP, SVG)</span>
                </button>

                {card.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors"
                    title="Eliminar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Soporta fondos transparentes. Tamaño máximo 5MB. Si no subes un logo, se generará un monograma tipográfico comercial de marca.
              </p>
            </div>

            {/* Ajustes de forma, tamaño y alineación */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              {/* Forma */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Forma</label>
                <select
                  value={card.logoShape || 'rounded'}
                  onChange={(e) => onChange({ logoShape: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="rounded">Redondeado</option>
                  <option value="circle">Circular</option>
                  <option value="square">Cuadrado</option>
                  <option value="original">Original</option>
                </select>
              </div>

              {/* Tamaño */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Tamaño</label>
                <select
                  value={card.logoSize || 'md'}
                  onChange={(e) => onChange({ logoSize: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="sm">Pequeño</option>
                  <option value="md">Mediano</option>
                  <option value="lg">Grande</option>
                  <option value="xl">Extra Grande</option>
                </select>
              </div>

              {/* Alineación */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Alineación</label>
                <select
                  value={card.logoAlignment || 'center'}
                  onChange={(e) => onChange({ logoAlignment: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="center">Centrado</option>
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Leyenda al pie / Nota de verificación */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Nota de Pie de Tarjeta / Validez Oficial
        </label>
        <input
          type="text"
          value={card.publicNotes || ''}
          onChange={(e) => onChange({ publicNotes: e.target.value })}
          placeholder="Ej. Datos oficiales verificados para clientes y proveedores."
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Aparece al final de la tarjeta pública para transmitir formalidad y confianza a los clientes.
        </p>
      </div>
    </div>
  );
};
