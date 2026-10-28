import React from 'react';
import { CreditCard, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { PaymentCard } from '../../../types/paymentCard';

interface PayPalTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PayPalTab: React.FC<PayPalTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const paypal = card.paypal;

  const updatePayPal = (updates: Partial<typeof card.paypal>) => {
    onChange({
      paypal: { ...paypal, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Interruptor del Módulo */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span>Módulo de Pagos con PayPal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Permite a tus clientes pagar directamente con tarjeta de crédito, débito o saldo PayPal.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={paypal.enabled}
            onChange={(e) => updatePayPal({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>

      {paypal.enabled && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          {/* Enlace de Pago PayPal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Enlace Directo de Pago de PayPal <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">paypal.me o link comercial oficial</span>
            </label>
            <input
              type="url"
              value={paypal.payUrl}
              onChange={(e) => updatePayPal({ payUrl: e.target.value })}
              placeholder="https://paypal.me/tu-nombre-comercial"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Al hacer clic en la tarjeta pública, abrirá este enlace directamente en una nueva pestaña segura.
            </p>
          </div>

          {/* Texto del Botón */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Texto del Botón en la Tarjeta
            </label>
            <input
              type="text"
              value={paypal.buttonText}
              onChange={(e) => updatePayPal({ buttonText: e.target.value })}
              placeholder="Ej. Pagar con PayPal o Tarjeta"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Nombre Comercial y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre de la Cuenta PayPal (Opcional)
              </label>
              <input
                type="text"
                value={paypal.businessName}
                onChange={(e) => updatePayPal({ businessName: e.target.value })}
                placeholder="Ej. Terraza Gourmet Oficial"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monto Sugerido (Opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paypal.suggestedAmount}
                  onChange={(e) => updatePayPal({ suggestedAmount: e.target.value })}
                  placeholder="Ej. 250.00"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                />
                <input
                  type="text"
                  value={paypal.currency}
                  onChange={(e) => updatePayPal({ currency: e.target.value })}
                  placeholder="MXN"
                  className="w-20 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Descripción / Nota informativa */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción del Pago
            </label>
            <input
              type="text"
              value={paypal.description}
              onChange={(e) => updatePayPal({ description: e.target.value })}
              placeholder="Aceptamos tarjetas de crédito Visa, Mastercard y American Express."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
            />
          </div>

          {/* Instrucciones adicionales */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Instrucciones Opcionales
            </label>
            <input
              type="text"
              value={paypal.instructions}
              onChange={(e) => updatePayPal({ instructions: e.target.value })}
              placeholder="Ej. Favor de conservar tu comprobante digital de PayPal."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
            />
          </div>

          {/* Aviso de seguridad */}
          <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl flex items-start gap-2 text-xs text-blue-300">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Por seguridad bancaria, LAV Digital Pagos no solicita contraseñas ni almacena credenciales privadas. El cliente realiza el pago directamente en la plataforma protegida de PayPal.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
