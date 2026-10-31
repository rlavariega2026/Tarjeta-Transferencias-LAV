import React, { useEffect, useState } from 'react';
import { CardRenderer } from '../card/CardRenderer';
import { PaymentCard } from '../../types/paymentCard';
import { fetchCardBySlug } from '../../services/apiService';
import { AlertCircle, Smartphone, Share2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PublicCardViewProps {
  slug: string;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PublicCardView: React.FC<PublicCardViewProps> = ({
  slug,
  onNotify
}) => {
  const [card, setCard] = useState<PaymentCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  // Limpieza defensiva de elementos administrativos que no deben aparecer
  // en una tarjeta pública, incluso si una plantilla o caché los inserta.
  useEffect(() => {
    const removeAdminArtifacts = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach((element) => {
        const label = (element.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (label.includes('panel admin')) {
          element.remove();
        }
      });

      document.querySelectorAll('body *').forEach((element) => {
        if (element.children.length > 0) return;
        const label = (element.textContent || '').replace(/\s+/g, ' ').trim();
        const normalized = label.toLowerCase();

        // El enlace puede estar montado como un div/span con evento, no solo como <a> o <button>.
        if (normalized.includes('panel admin')) {
          const clickable = element.closest('a, button, [role="button"]');
          (clickable || element.parentElement || element).remove();
          return;
        }

        // No mostrar el identificador interno ni la marca técnica en la tarjeta pública.
        if (/^ID:\s*/i.test(label) || /^LAV Digital Pagos$/i.test(label)) {
          const container = element.closest('footer') || element.parentElement;
          container?.remove();
        }
      });
    };

    removeAdminArtifacts();
    const observer = new MutationObserver(removeAdminArtifacts);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadCard();
  }, [slug]);

  const loadCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const found = await fetchCardBySlug(slug);
      if (found) {
        setCard(found);
        // Actualizar título y favicon dinámicamente en el navegador
        document.title = `💳 Pago a ${found.businessName} — LAV Pagos`;
      } else {
        setError(`No se encontró ninguna tarjeta activa con el enlace "/${slug}".`);
      }
    } catch (e: any) {
      setError('Error de conexión al cargar la tarjeta de pago.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse mb-3">
          <span className="font-display font-bold text-emerald-400 text-lg">LP</span>
        </div>
        <p className="text-xs font-medium text-slate-400">
          Cargando datos bancarios verificados...
        </p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-2">Tarjeta no disponible</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {error || 'El enlace que intentas abrir no existe o ha sido despublicado temporalmente por el negocio.'}
          </p>

        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 transition-colors"
      style={{
        backgroundColor: card.theme.backgroundColor || '#090d16',
        backgroundImage: card.theme.backgroundImage ? `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.12)), url("${card.theme.backgroundImage}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Botón Flotante Superior PWA / Instalar en Celular */}
      <div className="w-full max-w-md flex items-center justify-between py-2 px-1 mb-2">
        <div />

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Instalar en pantalla de inicio"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar Tarjeta</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIosGuide(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-black/10 dark:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardar en iPhone</span>
            </button>
          )}
        </div>
      </div>

      {/* Renderizado de la Tarjeta Digital Pura (Mobile First) */}
      <main className="w-full pb-8">
        <CardRenderer
          card={card}
          isInteractive={true}
          onNotify={onNotify}
          viewMode="mobile"
          isPublicView={true}
        />
      </main>

      {/* Modal Guía iOS */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 text-center">
            <h3 className="text-sm font-bold mb-2">Instalar en tu iPhone</h3>
            <p className="text-xs text-slate-300 text-left space-y-2 mb-4 leading-relaxed">
              1. Toca el botón <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 inline mx-1" /> en la barra inferior de Safari.<br />
              2. Desplázate hacia abajo y selecciona <strong>Agregar al inicio</strong>.<br />
              3. Tendrás acceso directo a esta tarjeta sin abrir el navegador.
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
