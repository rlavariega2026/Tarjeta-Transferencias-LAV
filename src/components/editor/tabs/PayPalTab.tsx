import React from 'react';
import paypalLogo from '../../../assets/paypal.png';
import { PaymentCard } from '../../../types/paymentCard';

interface PayPalTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
}

export const PayPalTab: React.FC<PayPalTabProps> = ({
  card,
  onChange
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
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <img src={paypalLogo} alt="" className="w-5 h-5 rounded bg-white" />
            <span>Cobros y datos para recibir pagos por PayPal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            <label htmlFor="paypal-enabled">Mostrar sección para recibir pagos</label>
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="paypal-enabled"
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
            <label htmlFor="paypal-url" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enlace de cobro para recibir pagos (opcional)
            </label>
            <input
              id="paypal-url"
              type="url"
              value={paypal.payUrl}
              onChange={(e) => updatePayPal({ payUrl: e.target.value })}
              placeholder="https://paypal.me/tu-nombre-comercial"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Pega tu enlace HTTPS de PayPal.me o el enlace de cobro generado en PayPal.
            </p>
          </div>

          {/* Texto del Botón */}
          <div>
            <label htmlFor="paypal-button" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Texto del botón
            </label>
            <input
              type="text"
              id="paypal-button"
              value={paypal.buttonText}
              onChange={(e) => updatePayPal({ buttonText: e.target.value })}
              placeholder="Ej. Pagar con PayPal o Tarjeta"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-semibold text-slate-300">
              Moneda
              <select
                value={paypal.currency || 'MXN'}
                onChange={(e) => updatePayPal({ currency: e.target.value })}
                className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
              >
                <option value="MXN">MXN (Pesos Mexicanos)</option>
                <option value="USD">USD (Dólares Americanos)</option>
                <option value="EUR">EUR (Euros)</option>
                <option value="CAD">CAD (Dólares Canadienses)</option>
                <option value="GBP">GBP (Libras Esterlinas)</option>
                {paypal.currency && !['MXN', 'USD', 'EUR', 'CAD', 'GBP'].includes(paypal.currency) && (
                  <option value={paypal.currency}>{paypal.currency}</option>
                )}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Monto sugerido (opcional)
              <input
                type="text"
                inputMode="decimal"
                value={paypal.suggestedAmount}
                onChange={(e) => updatePayPal({ suggestedAmount: e.target.value })}
                placeholder="Ej. 250.00"
                className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-300">
            Correo de PayPal que recibe el dinero (opcional)
            <input
              type="email"
              value={paypal.recipientEmail ?? ''}
              onChange={(e) => updatePayPal({ recipientEmail: e.target.value })}
              placeholder="cobros@tu-negocio.com"
              className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-300">
            Concepto que verá quien te pague
            <input
              type="text"
              value={paypal.concept ?? ''}
              onChange={(e) => updatePayPal({ concept: e.target.value })}
              placeholder="Ej. Anticipo de diseño"
              className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-300">
            Nombre de la cuenta PayPal (opcional)
            <input
              type="text"
              value={paypal.businessName}
              onChange={(e) => updatePayPal({ businessName: e.target.value })}
              className="mt-1.5 w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
            />
          </label>

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
        </div>
      )}
    </div>
  );
};
