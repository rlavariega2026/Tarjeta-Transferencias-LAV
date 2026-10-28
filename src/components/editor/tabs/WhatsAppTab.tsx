import React from 'react';
import { MessageCircle, Send, Phone, Info } from 'lucide-react';
import { PaymentCard } from '../../../types/paymentCard';

interface WhatsAppTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const WhatsAppTab: React.FC<WhatsAppTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const wa = card.whatsapp;

  const updateWhatsApp = (updates: Partial<typeof card.whatsapp>) => {
    onChange({
      whatsapp: { ...wa, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Interruptor del Módulo */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Módulo de WhatsApp y Mensajes de Cobro</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza los mensajes preformateados para enviar la tarjeta, los datos bancarios o recibir comprobantes directamente en tu WhatsApp.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={wa.enabled}
            onChange={(e) => updateWhatsApp({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {wa.enabled && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          {/* Teléfono Comercial de Validación */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Teléfono de WhatsApp del Negocio (Para Recibir Comprobantes)</span>
              <span className="text-[11px] text-slate-400 font-normal">Con código de país (ej. 521...)</span>
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-400 text-xs">
                <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              </div>
              <input
                type="tel"
                value={wa.phoneNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  updateWhatsApp({ phoneNumber: cleaned });
                }}
                placeholder="525512345678"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Si lo capturas, en la tarjeta pública aparecerá el botón 'Confirmar Pago por WhatsApp' para que el cliente te envíe su comprobante con un solo toque.
            </p>
          </div>

          {/* Mensaje al compartir tarjeta */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mensaje Previo al Compartir Enlace de la Tarjeta
            </label>
            <textarea
              rows={2}
              value={wa.shareCardMessage}
              onChange={(e) => updateWhatsApp({ shareCardMessage: e.target.value })}
              placeholder="Hola, te comparto nuestra tarjeta digital oficial de pago:"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Mensaje al compartir datos bancarios */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Encabezado para Enviar Datos Bancarios como Texto
            </label>
            <textarea
              rows={2}
              value={wa.shareBankMessage}
              onChange={(e) => updateWhatsApp({ shareBankMessage: e.target.value })}
              placeholder="Te comparto los datos oficiales para realizar tu transferencia bancaria:"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Mensaje al compartir todos los métodos */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mensaje al Compartir Todos los Métodos (SPEI + PayPal)
            </label>
            <textarea
              rows={2}
              value={wa.shareAllMessage}
              onChange={(e) => updateWhatsApp({ shareAllMessage: e.target.value })}
              placeholder="Hola, aquí tienes todos los métodos de pago disponibles de nuestro negocio:"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Texto del botón de confirmación en la tarjeta */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Texto del Botón de Confirmación en la Tarjeta
            </label>
            <input
              type="text"
              value={wa.promptText || 'Confirmar Pago por WhatsApp'}
              onChange={(e) => updateWhatsApp({ promptText: e.target.value })}
              placeholder="Confirmar Pago por WhatsApp"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
            />
          </div>

          {/* Información técnica de compatibilidad */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Todos los enlaces usan la API oficial de WhatsApp compatible con dispositivos Android, iOS, WhatsApp Web y computadoras de escritorio. El mensaje se abre listo para que el usuario lo revise antes de enviar.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
