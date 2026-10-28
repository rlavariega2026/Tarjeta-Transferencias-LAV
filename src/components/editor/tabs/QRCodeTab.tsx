import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Copy, Printer, Check, ExternalLink, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { PaymentCard } from '../../../types/paymentCard';
import { getCardPublicUrl } from '../../../services/apiService';

interface QRCodeTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const QRCodeTab: React.FC<QRCodeTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const publicUrl = getCardPublicUrl(card.slug);

  useEffect(() => {
    generateQRCodes();
  }, [card.slug, card.qrCode]);

  const generateQRCodes = async () => {
    try {
      // PNG en alta resolución (1024px) ideal para impresión comercial
      const png = await QRCode.toDataURL(publicUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: card.qrCode.fgColor || '#0f172a',
          light: card.qrCode.bgColor || '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      setPngDataUrl(png);

      // SVG vectorial infinito
      const svg = await QRCode.toString(publicUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: card.qrCode.fgColor || '#0f172a',
          light: card.qrCode.bgColor || '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      setSvgString(svg);
    } catch (err) {
      console.error('Error generating QR:', err);
    }
  };

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = `QR_LAV_${card.slug}_HD.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify('QR PNG descargado', 'Imagen en alta resolución (1024x1024) lista para folletos o mostrador.', 'success');
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_LAV_${card.slug}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('QR SVG vectorial descargado', 'Archivo vectorial escalable para diseño gráfico.', 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    onNotify('Enlace copiado', publicUrl, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintStand = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Información del QR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Código QR Permanente para Cobro Físico y Mostrador</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Cada tarjeta cuenta con su propio código QR de alta resolución vinculado permanentemente a su URL pública. No caduca y sigue funcionando incluso después de actualizar tus datos bancarios.
        </p>

        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="font-mono text-emerald-300 truncate">
            {publicUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar URL'}</span>
          </button>
        </div>
      </div>

      {/* Visualizador y Botones de Descarga */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Vista previa gráfica del QR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="text-slate-900 font-bold text-base mb-1 tracking-tight">
            {card.businessName}
          </div>
          <div className="text-slate-500 text-xs mb-4">
            Escanea para pagar con SPEI o PayPal
          </div>

          {pngDataUrl ? (
            <img src={pngDataUrl} alt="QR de Pago" className="w-56 h-56 rounded-lg" />
          ) : (
            <div className="w-56 h-56 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
              Generando QR...
            </div>
          )}

          <div className="mt-4 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ✓ Tarjeta Digital LAV Pagos
          </div>
        </div>

        {/* Acciones y Personalización */}
        <div className="space-y-4">
          <button
            onClick={handleDownloadPng}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Imagen PNG (1024x1024 Alta Resolución)</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Vector SVG (Para Imprenta / Diseño)</span>
          </button>

          <button
            onClick={handlePrintStand}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Letrero para Mostrador / Mesa</span>
          </button>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Personalizar Colores del QR</span>
            <div className="flex gap-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Color del Código</label>
                <input
                  type="color"
                  value={card.qrCode.fgColor || '#0f172a'}
                  onChange={(e) => {
                    onChange({
                      qrCode: { ...card.qrCode, fgColor: e.target.value }
                    });
                  }}
                  className="w-10 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Fondo del Código</label>
                <input
                  type="color"
                  value={card.qrCode.bgColor || '#ffffff'}
                  onChange={(e) => {
                    onChange({
                      qrCode: { ...card.qrCode, bgColor: e.target.value }
                    });
                  }}
                  className="w-10 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Recomendación: Mantén un contraste alto (fondo claro con código oscuro) para asegurar lectura instantánea con cualquier cámara de smartphone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
