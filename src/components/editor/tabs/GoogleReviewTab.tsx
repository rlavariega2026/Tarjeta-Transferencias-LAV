import React from 'react';
import { Star, ExternalLink, Info } from 'lucide-react';
import { PaymentCard } from '../../../types/paymentCard';

interface GoogleReviewTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const GoogleReviewTab: React.FC<GoogleReviewTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const google = card.googleReview;

  const updateGoogle = (updates: Partial<typeof card.googleReview>) => {
    onChange({
      googleReview: { ...google, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Interruptor del Módulo */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Calificación y Reseñas en Google</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Invita a tus clientes satisfechos a dejar una reseña de 5 estrellas en tu perfil de Google tras realizar su pago.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={google.enabled}
            onChange={(e) => updateGoogle({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {google.enabled && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          {/* Enlace Directo a Reseñas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Enlace Directo de Reseñas de Google (Google Review Link) <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">https://g.page/r/... o Maps</span>
            </label>
            <input
              type="url"
              value={google.reviewUrl}
              onChange={(e) => updateGoogle({ reviewUrl: e.target.value })}
              placeholder="https://g.page/r/tu-negocio/review"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Puedes obtener este enlace directo desde tu panel de Google Business Profile ('Pedir reseñas' / 'Compartir formulario de opinión').
            </p>
          </div>

          {/* Texto del Botón */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Texto del Botón
            </label>
            <input
              type="text"
              value={google.buttonText}
              onChange={(e) => updateGoogle({ buttonText: e.target.value })}
              placeholder="Ej. Califícanos en Google"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Mensaje de Invitación */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mensaje de Invitación a los Clientes
            </label>
            <textarea
              rows={3}
              value={google.message}
              onChange={(e) => updateGoogle({ message: e.target.value })}
              placeholder="Ej. Tu opinión nos ayuda a seguir brindándote la mejor atención. ¡Gracias por tu preferencia!"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Aviso ético */}
          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Cumpliendo las directrices oficiales: no se inventan puntuaciones ni estrellas falsas. El botón abre la ventana oficial de Google para que tus clientes opinen de forma verídica.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
