import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  HelpCircle,
  Wifi
} from 'lucide-react';
import { PaymentCard, BankAccount, BankCustomField } from '../../../types/paymentCard';
import { validateClabe, BANK_CODES } from '../../../services/clabeValidator';

interface BankingTabProps {
  card: PaymentCard;
  onChange: (updates: Partial<PaymentCard>) => void;
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const BankingTab: React.FC<BankingTabProps> = ({
  card,
  onChange,
  onNotify
}) => {
  const [selectedAccIndex, setSelectedAccIndex] = useState<number>(0);
  const accounts = card.banking.accounts || [];
  const currentAcc = accounts[selectedAccIndex] || accounts[0];
  const wifi = card.wifi || { enabled:false, ssid:'', password:'' };

  const updateAccount = (index: number, updates: Partial<BankAccount>) => {
    const updatedList = [...accounts];
    updatedList[index] = { ...updatedList[index], ...updates };
    onChange({
      banking: {
        ...card.banking,
        accounts: updatedList
      }
    });
  };

  const handleAddAccount = () => {
    const newId = `acc_${Date.now()}`;
    const newAcc: BankAccount = {
      id: newId,
      accountLabel: `Cuenta ${accounts.length + 1}`,
      beneficiary: card.businessName,
      bankName: '',
      clabe: '',
      accountNumber: '',
      cardNumber: '',
      accountType: 'Débito / Cheques',
      reference: '',
      concept: '',
      currency: 'MXN',
      instructions: '',
      customFields: [],
      visibleFields: {
        beneficiary: true,
        bankName: true,
        clabe: true,
        accountNumber: true,
        cardNumber: false,
        accountType: true,
        reference: true,
        concept: true,
        currency: true,
        instructions: true
      },
      shareInWhatsApp: true
    };

    const updated = [...accounts, newAcc];
    onChange({
      banking: {
        ...card.banking,
        accounts: updated
      }
    });
    setSelectedAccIndex(updated.length - 1);
    onNotify('Nueva cuenta agregada', 'Configura los datos bancarios para este nuevo método.', 'success');
  };

  const handleDeleteAccount = (index: number) => {
    if (accounts.length <= 1) {
      onNotify('Aviso', 'Debe existir al menos una cuenta bancaria en el módulo.', 'info');
      return;
    }
    const filtered = accounts.filter((_, i) => i !== index);
    onChange({
      banking: {
        ...card.banking,
        accounts: filtered
      }
    });
    setSelectedAccIndex(Math.max(0, index - 1));
    onNotify('Cuenta eliminada', 'La cuenta ha sido retirada de la tarjeta.', 'info');
  };

  const toggleFieldVisibility = (fieldKey: keyof BankAccount['visibleFields']) => {
    if (!currentAcc) return;
    const currentVis = currentAcc.visibleFields[fieldKey];
    updateAccount(selectedAccIndex, {
      visibleFields: {
        ...currentAcc.visibleFields,
        [fieldKey]: !currentVis
      }
    });
  };

  const handleAddCustomField = () => {
    if (!currentAcc) return;
    const newCf: BankCustomField = {
      id: `cf_${Date.now()}`,
      label: 'Campo Adicional',
      value: ''
    };
    updateAccount(selectedAccIndex, {
      customFields: [...(currentAcc.customFields || []), newCf]
    });
  };

  const handleRemoveCustomField = (cfId: string) => {
    if (!currentAcc) return;
    updateAccount(selectedAccIndex, {
      customFields: (currentAcc.customFields || []).filter(cf => cf.id !== cfId)
    });
  };

  const handleUpdateCustomField = (cfId: string, label: string, value: string) => {
    if (!currentAcc) return;
    const updated = (currentAcc.customFields || []).map(cf => cf.id === cfId ? { ...cf, label, value } : cf);
    updateAccount(selectedAccIndex, { customFields: updated });
  };

  // Validación de CLABE en tiempo real
  const clabeValidation = currentAcc?.clabe ? validateClabe(currentAcc.clabe) : null;

  return (
    <div className="space-y-6">
      {/* Interruptor del Módulo */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Módulo de Transferencias Bancarias (SPEI)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Módulo central del producto. Permite configurar una o múltiples cuentas bancarias con botones de copia individual y masiva.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={card.banking.enabled}
            onChange={(e) => onChange({
              banking: { ...card.banking, enabled: e.target.checked }
            })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <section className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span>Configuración de WiFi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configura aquí la red que aparecerá en la tarjeta. El visitante podrá copiar el nombre y la contraseña desde el bloque WiFi.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0" title="Mostrar u ocultar los datos WiFi en la tarjeta">
            <input type="checkbox" checked={wifi.enabled} onChange={e=>onChange({wifi:{...wifi,enabled:e.target.checked}})} className="sr-only peer"/>
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre de la red (SSID)</label>
              <input type="text" value={wifi.ssid} onChange={e=>onChange({wifi:{...wifi,ssid:e.target.value}})} placeholder="Ej. Mi_Negocio_WiFi" autoComplete="off" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña WiFi</label>
              <div className="flex gap-2">
                <input type="text" value={wifi.password} onChange={e=>onChange({wifi:{...wifi,password:e.target.value}})} placeholder="Escribe la contraseña de la red" autoComplete="off" className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"/>
                <button type="button" disabled={!wifi.password} onClick={async()=>{try{await navigator.clipboard.writeText(wifi.password);onNotify('Contraseña copiada','La contraseña WiFi se copió al portapapeles.','success');}catch{onNotify('No se pudo copiar','El navegador no permitió acceder al portapapeles.','error');}}} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Copiar contraseña WiFi">
                  <Copy className="w-3.5 h-3.5"/>
                  <span>Copiar</span>
                </button>
              </div>
            </div>
        </div>
      </section>

      {card.banking.enabled && (
        <>
          {/* Título de la sección pública */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título de la Sección en la Tarjeta
            </label>
            <input
              type="text"
              value={card.banking.sectionTitle}
              onChange={(e) => onChange({
                banking: { ...card.banking, sectionTitle: e.target.value }
              })}
              placeholder="Ej. Datos para Transferencia Bancaria (SPEI)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Selector de Cuentas y Botón Agregar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              {accounts.map((acc, idx) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccIndex(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedAccIndex === idx
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {acc.accountLabel || `Cuenta ${idx + 1}`}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddAccount}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Cuenta</span>
            </button>
          </div>

          {/* Editor de la Cuenta Seleccionada */}
          {currentAcc && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Encabezado de la cuenta y botón eliminar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex-1 mr-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Etiqueta de la Cuenta (Nombre Interno y Público)
                  </label>
                  <input
                    type="text"
                    value={currentAcc.accountLabel}
                    onChange={(e) => updateAccount(selectedAccIndex, { accountLabel: e.target.value })}
                    placeholder="Ej. Cuenta Principal, Pedidos Express, Sucursal"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-medium"
                  />
                </div>

                {accounts.length > 1 && (
                  <button
                    onClick={() => handleDeleteAccount(selectedAccIndex)}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-950/20 transition-colors cursor-pointer"
                    title="Eliminar esta cuenta bancaria"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              {/* Campos Principales con botón de visibilidad (Ojo) */}
              <div className="space-y-4">
                {/* 1. Titular */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nombre del Titular de la Cuenta
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleFieldVisibility('beneficiary')}
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      {currentAcc.visibleFields.beneficiary ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Visible en tarjeta</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-500 text-[11px]">Oculto</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentAcc.beneficiary}
                    onChange={(e) => updateAccount(selectedAccIndex, { beneficiary: e.target.value })}
                    placeholder="Nombre completo o Razón Social registrada en el banco"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 2. Banco */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Institución Bancaria (Banco)
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleFieldVisibility('bankName')}
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      {currentAcc.visibleFields.bankName ? (
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1"><Eye className="w-3 h-3" /> Visible</span>
                      ) : (
                        <span className="text-slate-500 text-[11px] flex items-center gap-1"><EyeOff className="w-3 h-3" /> Oculto</span>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentAcc.bankName}
                    onChange={(e) => updateAccount(selectedAccIndex, { bankName: e.target.value })}
                    placeholder="Ej. BBVA México, Santander, Banorte, Nu, STP, etc."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {/* Chips rápidos de bancos comunes */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['BBVA', 'Santander', 'Banorte', 'Citibanamex', 'HSBC', 'Nu México', 'Banco Azteca', 'STP', 'Mercado Pago'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => updateAccount(selectedAccIndex, { bankName: b })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. CLABE Interbancaria con Validador ABM */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <span>CLABE Interbancaria (18 dígitos)</span>
                      <span className="text-emerald-400 font-bold">*SPEI</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleFieldVisibility('clabe')}
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      {currentAcc.visibleFields.clabe ? (
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1"><Eye className="w-3 h-3" /> Visible</span>
                      ) : (
                        <span className="text-slate-500 text-[11px] flex items-center gap-1"><EyeOff className="w-3 h-3" /> Oculto</span>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={18}
                    value={currentAcc.clabe}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      updateAccount(selectedAccIndex, { clabe: val });
                    }}
                    placeholder="012180001234567897"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                  />

                  {/* Feedback de Validación de CLABE */}
                  {currentAcc.clabe && clabeValidation && (
                    <div className="mt-2 text-xs">
                      {clabeValidation.isValid ? (
                        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            CLABE válida de 18 dígitos: <strong>{clabeValidation.bankName}</strong> (Dígito verificador correcto).
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <div>{clabeValidation.error}</div>
                            {clabeValidation.bankName && (
                              <div className="text-[11px] text-amber-400 mt-0.5">
                                Código de institución: {clabeValidation.bankName}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Número de Cuenta & Número de Tarjeta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Número de Cuenta */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Número de Cuenta</label>
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility('accountNumber')}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200"
                      >
                        {currentAcc.visibleFields.accountNumber ? (
                          <span className="text-emerald-400 text-[11px]">Visible</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Oculto</span>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentAcc.accountNumber}
                      onChange={(e) => updateAccount(selectedAccIndex, { accountNumber: e.target.value.trim() })}
                      placeholder="Ej. 0123456789"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                    />
                  </div>

                  {/* Número de Tarjeta (Opcional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">No. de Tarjeta (16 dígitos)</label>
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility('cardNumber')}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-200"
                      >
                        {currentAcc.visibleFields.cardNumber ? (
                          <span className="text-emerald-400 text-[11px]">Visible</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Oculto</span>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={19}
                      value={currentAcc.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        updateAccount(selectedAccIndex, { cardNumber: val });
                      }}
                      placeholder="4152 3134 9876 5432"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* 5. Referencia & Concepto de Pago */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Referencia */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Referencia Sugerida</label>
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility('reference')}
                        className="text-xs text-slate-400"
                      >
                        {currentAcc.visibleFields.reference ? 'Visible' : 'Oculto'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentAcc.reference}
                      onChange={(e) => updateAccount(selectedAccIndex, { reference: e.target.value })}
                      placeholder="Ej. No. de Pedido o Nombre del Cliente"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>

                  {/* Concepto */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Concepto de Pago</label>
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility('concept')}
                        className="text-xs text-slate-400"
                      >
                        {currentAcc.visibleFields.concept ? 'Visible' : 'Oculto'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentAcc.concept}
                      onChange={(e) => updateAccount(selectedAccIndex, { concept: e.target.value })}
                      placeholder="Ej. Pago Servicio / Anticipo"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                </div>

                {/* 6. Moneda & Instrucciones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Moneda Aceptada</label>
                    <input
                      type="text"
                      value={currentAcc.currency}
                      onChange={(e) => updateAccount(selectedAccIndex, { currency: e.target.value })}
                      placeholder="MXN, USD, EUR"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instrucciones de Pago</label>
                    <input
                      type="text"
                      value={currentAcc.instructions}
                      onChange={(e) => updateAccount(selectedAccIndex, { instructions: e.target.value })}
                      placeholder="Ej. Enviar comprobante por WhatsApp al terminar."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                </div>

                {/* 7. Campos Personalizados Dinámicos */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Campos Adicionales Opcionales</span>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Campo</span>
                    </button>
                  </div>

                  {currentAcc.customFields && currentAcc.customFields.length > 0 ? (
                    <div className="space-y-2">
                      {currentAcc.customFields.map((cf) => (
                        <div key={cf.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cf.label}
                            onChange={(e) => handleUpdateCustomField(cf.id, e.target.value, cf.value)}
                            placeholder="Nombre del campo"
                            className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                          />
                          <input
                            type="text"
                            value={cf.value}
                            onChange={(e) => handleUpdateCustomField(cf.id, cf.label, e.target.value)}
                            placeholder="Valor"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(cf.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300"
                            title="Eliminar campo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Puedes agregar campos extra como "Sucursal", "Código BIC/SWIFT", "RFC", etc.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
