import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  DollarSign, 
  Star, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Download,
  Send,
  Sparkles,
  Layers,
  Wifi
} from 'lucide-react';
import QRCode from 'qrcode';
import { PaymentCard, BankAccount } from '../../types/paymentCard';
import { formatClabeDisplay, formatCardNumberDisplay } from '../../services/clabeValidator';
import { getCardPublicUrl } from '../../services/apiService';

interface CardRendererProps {
  card: PaymentCard;
  isInteractive?: boolean;
  onNotify?: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  viewMode?: 'mobile' | 'desktop';
  overrideBaseUrl?: string;
  isPublicView?: boolean;
}

export const CardRenderer: React.FC<CardRendererProps> = ({
  card,
  isInteractive = true,
  onNotify,
  viewMode = 'mobile',
  overrideBaseUrl,
  isPublicView = false
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeAccountTab, setActiveAccountTab] = useState<number>(0);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const publicUrl = getCardPublicUrl(card.slug, overrideBaseUrl);

  const notify = (title: string, desc?: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (onNotify) {
      onNotify(title, desc, type);
    }
  };

  // Helper para copiar al portapapeles
  const handleCopy = async (label: string, value: string, fieldKey: string) => {
    if (!value || !isInteractive) return;
    try {
      await navigator.clipboard.writeText(value.trim());
      setCopiedField(fieldKey);
      notify(`${label} copiado`, value, 'success');
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (e) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = value.trim();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldKey);
      notify(`${label} copiado`, value, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Genera el texto estructurado de una cuenta bancaria completa
  const generateAccountCopyText = (acc: BankAccount): string => {
    const lines: string[] = [];
    lines.push(`💳 *DATOS DE TRANSFERENCIA BANCARIA (SPEI)*`);
    lines.push(`*Negocio:* ${card.businessName}`);
    if (acc.accountLabel) lines.push(`*Cuenta:* ${acc.accountLabel}`);
    if (acc.beneficiary && acc.visibleFields.beneficiary) lines.push(`*Titular:* ${acc.beneficiary}`);
    if (acc.bankName && acc.visibleFields.bankName) lines.push(`*Banco:* ${acc.bankName}`);
    if (acc.clabe && acc.visibleFields.clabe) lines.push(`*CLABE (18 dígitos):* ${acc.clabe}`);
    if (acc.accountNumber && acc.visibleFields.accountNumber) lines.push(`*No. de Cuenta:* ${acc.accountNumber}`);
    if (acc.cardNumber && acc.visibleFields.cardNumber) lines.push(`*No. de Tarjeta:* ${acc.cardNumber}`);
    if (acc.accountType && acc.visibleFields.accountType) lines.push(`*Tipo:* ${acc.accountType}`);
    if (acc.reference && acc.visibleFields.reference) lines.push(`*Referencia:* ${acc.reference}`);
    if (acc.concept && acc.visibleFields.concept) lines.push(`*Concepto:* ${acc.concept}`);
    if (acc.currency && acc.visibleFields.currency) lines.push(`*Moneda:* ${acc.currency}`);
    if (acc.instructions && acc.visibleFields.instructions) lines.push(`*Instrucciones:* ${acc.instructions}`);
    
    if (acc.customFields && acc.customFields.length > 0) {
      acc.customFields.forEach(f => {
        if (f.label && f.value) lines.push(`*${f.label}:* ${f.value}`);
      });
    }

    lines.push(`\n🔗 Ver tarjeta digital completa: ${publicUrl}`);
    return lines.join('\n');
  };

  // Genera el texto de todos los métodos habilitados
  const generateAllMethodsCopyText = (): string => {
    const sections: string[] = [];
    sections.push(`💳 *MÉTODOS OFICIALES DE PAGO — ${card.businessName.toUpperCase()}*`);
    if (card.tagline) sections.push(`${card.tagline}`);

    if (card.banking.enabled && card.banking.accounts.length > 0) {
      sections.push(`\n🏦 *TRANSFERENCIAS BANCARIAS:*`);
      card.banking.accounts.forEach((acc, i) => {
        sections.push(`\n[${i + 1}] ${acc.accountLabel || 'Cuenta Bancaria'}`);
        if (acc.beneficiary && acc.visibleFields.beneficiary) sections.push(`• Titular: ${acc.beneficiary}`);
        if (acc.bankName && acc.visibleFields.bankName) sections.push(`• Banco: ${acc.bankName}`);
        if (acc.clabe && acc.visibleFields.clabe) sections.push(`• CLABE: ${acc.clabe}`);
        if (acc.accountNumber && acc.visibleFields.accountNumber) sections.push(`• Cuenta: ${acc.accountNumber}`);
        if (acc.cardNumber && acc.visibleFields.cardNumber) sections.push(`• Tarjeta: ${acc.cardNumber}`);
        if (acc.reference && acc.visibleFields.reference) sections.push(`• Referencia: ${acc.reference}`);
        if (acc.concept && acc.visibleFields.concept) sections.push(`• Concepto: ${acc.concept}`);
      });
    }

    if (card.paypal.enabled && card.paypal.payUrl) {
      sections.push(`\n🅿️ *PAYPAL:*`);
      sections.push(`• Paga con tarjeta o saldo: ${card.paypal.payUrl}`);
      if (card.paypal.description) sections.push(`• Nota: ${card.paypal.description}`);
    }

    sections.push(`\n🔗 Tarjeta digital verificada: ${publicUrl}`);
    return sections.join('\n');
  };

  // Copia masiva de cuenta
  const handleCopyAccountAll = (acc: BankAccount) => {
    const text = generateAccountCopyText(acc);
    navigator.clipboard.writeText(text);
    notify('Datos bancarios copiados', 'Se copiaron todos los datos de la cuenta en formato organizado para WhatsApp.', 'success');
  };

  // Copia masiva total
  const handleCopyAllMethods = () => {
    const text = generateAllMethodsCopyText();
    navigator.clipboard.writeText(text);
    notify('Todos los métodos copiados', 'Se han copiado cuentas bancarias y enlaces de pago al portapapeles.', 'success');
  };

  // Compartir por WhatsApp
  const handleShareWhatsApp = (type: 'card' | 'bank' | 'all') => {
    let message = '';
    if (type === 'card') {
      message = `${card.whatsapp.shareCardMessage || 'Hola, te comparto nuestra tarjeta digital de pago:'}\n${publicUrl}`;
    } else if (type === 'bank') {
      const activeAcc = card.banking.accounts[activeAccountTab] || card.banking.accounts[0];
      if (activeAcc) {
        message = `${card.whatsapp.shareBankMessage || 'Datos para transferencia:'}\n\n${generateAccountCopyText(activeAcc)}`;
      }
    } else {
      message = generateAllMethodsCopyText();
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Enviar confirmación al WhatsApp del negocio
  const handleConfirmPaymentWhatsApp = () => {
    if (!card.whatsapp.phoneNumber) return;
    const cleanPhone = card.whatsapp.phoneNumber.replace(/\D/g, '');
    const msg = `Hola ${card.businessName}, acabo de realizar mi pago mediante su tarjeta digital. Adjunto mi comprobante para validación:`;
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Generar QR en modal
  const handleOpenQrModal = async () => {
    try {
      const url = await QRCode.toDataURL(publicUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
      setShowQrModal(true);
    } catch (e) {
      console.error('Error generating QR:', e);
    }
  };

  // Descarga QR PNG
  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Pagos_${card.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Código QR descargado', 'Imagen PNG en alta resolución lista para imprimir.', 'success');
  };

  // Estilos del tema
  const theme = card.theme;
  const isDarkTheme = ['#090d16', '#050c18', '#020617', '#030712', '#111827'].includes(theme.backgroundColor.toLowerCase());
  
  // Clases dinámicas según la plantilla
  const templateId = card.templateId || 'minimalist-slate';
  
  // Renderizado del logotipo o monograma tipográfico
  const renderLogo = () => {
    const sizeClasses = {
      sm: 'h-12 w-12',
      md: 'h-16 w-16 sm:h-20 sm:w-20',
      lg: 'h-20 w-20 sm:h-24 sm:w-24',
      xl: 'h-24 w-24 sm:h-28 sm:w-28'
    }[card.logoSize || 'md'];

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-2xl',
      original: 'rounded-xl'
    }[card.logoShape || 'rounded'];

    const alignClasses = {
      left: 'justify-start text-left',
      center: 'justify-center text-center',
      right: 'justify-end text-right'
    }[card.logoAlignment || 'center'];

    if (card.logoUrl) {
      return (
        <div className={`flex items-center ${alignClasses} mb-4`}>
          <div className={`${sizeClasses} ${shapeClasses} overflow-hidden shadow-sm flex items-center justify-center p-1 bg-white/90 border border-black/10`}>
            <img 
              src={card.logoUrl} 
              alt={`Logotipo de ${card.businessName}`}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      );
    }

    // Monograma tipográfico de marca elegante si no hay logotipo subido
    const initials = card.businessName
      ? card.businessName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
      : 'LP';

    return (
      <div className={`flex items-center ${alignClasses} mb-4`}>
        <div 
          className={`${sizeClasses} ${shapeClasses} flex items-center justify-center shadow-md font-display font-black text-xl tracking-wider`}
          style={{ 
            backgroundColor: theme.primaryColor,
            color: theme.buttonTextColor || '#ffffff'
          }}
        >
          {initials}
        </div>
      </div>
    );
  };

  // Renderizado de botón individual de copiar dato
  const renderCopyItem = (
    label: string, 
    value: string, 
    fieldKey: string, 
    displayValue?: string, 
    highlight: boolean = false,
    isMonospace: boolean = false
  ) => {
    if (!value) return null;
    const isCopied = copiedField === fieldKey;

    return (
      <div 
        className={`group flex items-center justify-between p-3 rounded-xl transition-all border ${
          highlight 
            ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20' 
            : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10'
        }`}
      >
        <div className="flex-1 min-w-0 pr-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
            {label}
          </span>
          <span className={`text-sm sm:text-base font-medium break-all block mt-0.5 ${isMonospace ? 'font-mono tabular-nums tracking-wide' : ''}`}>
            {displayValue || value}
          </span>
        </div>

        <button
          onClick={() => handleCopy(label, value, fieldKey)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${
            isCopied
              ? 'bg-emerald-500 text-white'
              : 'bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-current'
          }`}
          title={`Copiar ${label}`}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div 
      className={`premium-template premium-${templateId} w-full max-w-md mx-auto transition-all duration-300 relative ${
        viewMode === 'desktop' ? 'max-w-xl' : 'max-w-md'
      }`}
      style={{
        backgroundColor: theme.backgroundColor,
        backgroundImage: theme.backgroundImage ? `linear-gradient(rgba(0,0,0,0.10), rgba(0,0,0,0.10)), url(${theme.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: theme.textColor,
        fontFamily: ({sans:"'Plus Jakarta Sans',sans-serif",display:"'Outfit',sans-serif",serif:"'Playfair Display',Georgia,serif",mono:"'JetBrains Mono',monospace",poppins:"'Poppins','Plus Jakarta Sans',sans-serif",montserrat:"'Montserrat',sans-serif",lora:"'Lora',Georgia,serif",space:"'Space Grotesk',sans-serif"} as Record<string,string>)[theme.fontFamily] || "'Plus Jakarta Sans',sans-serif"
      }}
      data-template={templateId}
    >
      {/* Tarjeta Contenedora Principal */}
      <div 
        className={`premium-card-shell metallic-${theme.metallicStyle || 'none'} p-5 sm:p-7 rounded-3xl transition-all ${
          templateId === 'neo-brutalist' 
            ? 'border-3 border-black shadow-[6px_6px_0px_#000000]' 
            : templateId === 'glassmorphism-aurora'
            ? 'backdrop-blur-xl border border-white/20 shadow-2xl'
            : templateId === 'premium-gold-dark'
            ? 'border-2 border-amber-600/50 shadow-2xl'
            : templateId === 'cyber-futuristic'
            ? 'border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            : 'border border-black/10 dark:border-white/10 shadow-lg'
        }`}
        style={{
          backgroundColor: theme.surfaceColor,
          backgroundImage: theme.backgroundImage ? `linear-gradient(rgba(0,0,0,0.10), rgba(0,0,0,0.10)), url(${theme.backgroundImage})` : (theme.backgroundGradient || undefined),
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Cabecera / Identidad del Negocio */}
        <div data-premium-section="brand">
        <div className="mb-6">
          {renderLogo()}

          <div className={card.logoAlignment === 'left' ? 'text-left' : card.logoAlignment === 'right' ? 'text-right' : 'text-center'}>
            <div className="flex items-center gap-2 justify-center mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-balance leading-snug" style={{ fontSize: theme.businessNameFontSize || 24 }}>
                {card.businessName}
              </h1>
              <span title="Cuenta Comercial Verificada">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              </span>
            </div>

            {card.tagline && (
              <p className="text-xs sm:text-sm opacity-80 font-normal leading-relaxed text-balance" style={{ fontSize: theme.taglineFontSize || 14 }}>
                {card.tagline}
              </p>
            )}

            {card.category && (
              <div className="mt-2 font-semibold opacity-60 tracking-wider uppercase" style={{ fontSize: theme.categoryFontSize || 11 }}>
                {card.category}
              </div>
            )}
          </div>

          {/* Plantilla especial: Detalles visuales distintivos */}
          {templateId === 'gastro-culinary' && (
            <div className="mt-3 py-2 px-3 bg-amber-900/10 border-y border-amber-900/20 text-center text-xs font-serif italic text-amber-800 dark:text-amber-200">
              Comanda / Cuenta de Mesa Oficial • Consumos & Propinas
            </div>
          )}

          {templateId === 'retail-store' && (
            <div className="mt-3 flex items-center justify-between py-1.5 px-3 bg-black/5 dark:bg-white/5 rounded text-[11px] font-mono">
              <span>FOLIO: {card.slug.toUpperCase()}</span>
              <span>ESTADO: ACTIVO</span>
            </div>
          )}

          {templateId === 'premium-gold-dark' && (
            <div className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TERMINAL DE PAGO VIP VERIFICADA</span>
            </div>
          )}
        </div>

                </div>
        {/* Acciones Rápidas Superiores: QR y Compartir */}
        <div data-premium-section="quick-actions">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleOpenQrModal}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10"
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span>Código QR</span>
          </button>

          <button
            onClick={() => handleShareWhatsApp('card')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors border border-emerald-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>

          <button
            onClick={handleCopyAllMethods}
            className="flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10"
            title="Copiar todos los métodos de pago de una vez"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

                </div>
        {/* MÓDULO 1: TRANSFERENCIAS BANCARIAS */}
        <div data-premium-section="banking">
        {card.banking.enabled && card.banking.accounts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{card.banking.sectionTitle || 'Transferencias Bancarias'}</span>
              </h2>

              {card.banking.accounts.length > 1 && (
                <span className="text-[11px] font-medium opacity-50">
                  {card.banking.accounts.length} Cuentas
                </span>
              )}
            </div>

            {/* Pestañas de Cuentas si hay más de 1 */}
            {card.banking.accounts.length > 1 && (
              <div className="flex gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-xl mb-4 overflow-x-auto">
                {card.banking.accounts.map((acc, index) => (
                  <button
                    key={acc.id}
                    onClick={() => setActiveAccountTab(index)}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      activeAccountTab === index
                        ? 'bg-white dark:bg-slate-800 shadow-sm font-semibold text-emerald-600 dark:text-emerald-400'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {acc.accountLabel || `Cuenta ${index + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Cuenta Activa Seleccionada */}
            {(() => {
              const acc = card.banking.accounts[activeAccountTab] || card.banking.accounts[0];
              if (!acc) return null;

              return (
                <div className="space-y-2.5">
                  {acc.accountLabel && card.banking.accounts.length === 1 && (
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                      {acc.accountLabel}
                    </div>
                  )}

                  {/* Titular */}
                  {acc.visibleFields.beneficiary && acc.beneficiary && 
                    renderCopyItem('Titular de la Cuenta', acc.beneficiary, `beneficiary_${acc.id}`)}

                  {/* Banco */}
                  {acc.visibleFields.bankName && acc.bankName && 
                    renderCopyItem('Banco Destino', acc.bankName, `bank_${acc.id}`)}

                  {/* CLABE Interbancaria (SPEI) - Resaltada y en formato legible 3-3-11-1 */}
                  {acc.visibleFields.clabe && acc.clabe && 
                    renderCopyItem(
                      'CLABE Interbancaria (SPEI)', 
                      acc.clabe, 
                      `clabe_${acc.id}`, 
                      formatClabeDisplay(acc.clabe), 
                      true, 
                      true
                    )}

                  {/* Número de Cuenta */}
                  {acc.visibleFields.accountNumber && acc.accountNumber && 
                    renderCopyItem('Número de Cuenta', acc.accountNumber, `account_${acc.id}`, undefined, false, true)}

                  {/* Número de Tarjeta */}
                  {acc.visibleFields.cardNumber && acc.cardNumber && 
                    renderCopyItem(
                      'Número de Tarjeta (16 dígitos)', 
                      acc.cardNumber, 
                      `card_${acc.id}`, 
                      formatCardNumberDisplay(acc.cardNumber), 
                      false, 
                      true
                    )}

                  {/* Tipo de Cuenta */}
                  {acc.visibleFields.accountType && acc.accountType && 
                    renderCopyItem('Tipo de Cuenta', acc.accountType, `type_${acc.id}`)}

                  {/* Referencia sugerida */}
                  {acc.visibleFields.reference && acc.reference && 
                    renderCopyItem('Referencia Sugerida', acc.reference, `ref_${acc.id}`)}

                  {/* Concepto de pago */}
                  {acc.visibleFields.concept && acc.concept && 
                    renderCopyItem('Concepto de Pago', acc.concept, `concept_${acc.id}`)}

                  {/* Moneda */}
                  {acc.visibleFields.currency && acc.currency && 
                    renderCopyItem('Moneda Aceptada', acc.currency, `currency_${acc.id}`)}

                  {/* Campos personalizados */}
                  {acc.customFields && acc.customFields.map((cf) => 
                    renderCopyItem(cf.label, cf.value, `custom_${cf.id}_${acc.id}`)
                  )}

                  {/* Instrucciones de la cuenta */}
                  {acc.visibleFields.instructions && acc.instructions && (
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs leading-relaxed opacity-80 border border-black/5 dark:border-white/5 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{acc.instructions}</span>
                    </div>
                  )}

                  {/* Botón: Copiar todos los datos de esta cuenta */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleCopyAccountAll(acc)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white shadow-md active:scale-98 transition-all"
                      style={{
                        backgroundColor: theme.buttonBgColor || theme.primaryColor,
                        color: theme.buttonTextColor || '#ffffff'
                      }}
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copiar Todos los Datos Bancarios</span>
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp('bank')}
                      className="flex items-center justify-center px-3 py-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98 transition-all"
                      title="Enviar datos bancarios por WhatsApp"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

                </div>
        {/* MÓDULO WIFI */}
        {card.wifi?.enabled&&(card.wifi.ssid||card.wifi.password)&&<section className="mb-6 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2 mb-3"><Wifi className="w-4 h-4 text-cyan-500"/><span>Conexión WiFi</span></h2>
          {card.wifi.ssid&&<div className="mb-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"><span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">Nombre de la red (SSID)</span><span className="text-sm font-medium break-all block mt-0.5">{card.wifi.ssid}</span></div>}
          {card.wifi.password&&renderCopyItem('Contraseña WiFi',card.wifi.password,'wifi_password',undefined,true,true)}
        </section>}

        {/* MÓDULO 2: PAYPAL */}
        <div data-premium-section="paypal">
        {card.paypal.enabled && card.paypal.payUrl && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-950/20 via-sky-950/10 to-indigo-950/20 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{card.paypal.sectionTitle || 'Pago Seguro con PayPal'}</span>
              </span>
            </div>

            {card.paypal.description && (
              <p className="text-xs opacity-80 mb-3 leading-relaxed">
                {card.paypal.description}
              </p>
            )}

            {card.paypal.suggestedAmount && (
              <div className="text-xs font-semibold mb-3 flex items-center gap-1">
                <span className="opacity-70">Monto sugerido:</span>
                <span className="text-emerald-500 font-bold">${card.paypal.suggestedAmount} {card.paypal.currency || 'MXN'}</span>
              </div>
            )}

            <a
              href={card.paypal.payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md active:scale-98 transition-all no-underline"
            >
              <span>{card.paypal.buttonText || 'Pagar con PayPal'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {card.paypal.instructions && (
              <p className="text-[11px] opacity-60 mt-2 text-center">
                {card.paypal.instructions}
              </p>
            )}
          </div>
        )}

                </div>
        {/* MÓDULO 3: CALIFICACIÓN EN GOOGLE */}
        <div data-premium-section="reviews">
        {card.googleReview.enabled && card.googleReview.reviewUrl && (
          <div className="mb-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
            <div className="flex items-center justify-center gap-1 mb-2 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>

            <h3 className="text-sm font-bold tracking-tight mb-1">
              {card.googleReview.sectionTitle || '¿Disfrutaste tu experiencia?'}
            </h3>

            {card.googleReview.message && (
              <p className="text-xs opacity-80 mb-3 leading-relaxed">
                {card.googleReview.message}
              </p>
            )}

            <a
              href={card.googleReview.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-black/10 dark:border-white/10 active:scale-98 transition-all no-underline"
            >
              <GoogleLogoSmall />
              <span>{card.googleReview.buttonText || 'Califícanos en Google'}</span>
            </a>
          </div>
        )}

                </div>
        {/* MÓDULO 4: BOTÓN DE CONFIRMACIÓN POR WHATSAPP */}
        <div data-premium-section="whatsapp">
        {card.whatsapp.enabled && card.whatsapp.phoneNumber && (
          <div className="mb-4">
            <button
              onClick={handleConfirmPaymentWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{card.whatsapp.promptText || 'Confirmar Pago por WhatsApp'}</span>
            </button>
          </div>
        )}

                </div>
        {/* Pie de la tarjeta: información del establecimiento */}
        {card.publicNotes && !(isPublicView && (card.publicNotes.trim().startsWith('ID:') || card.publicNotes.includes('LAV Digital Pagos'))) && (
          <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 text-center">
            <p className="text-[11px] opacity-60">
              {card.publicNotes}
            </p>
          </div>
        )}
      </div>

      {/* Modal / Sheet del Código QR para cobro en mostrador */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold tracking-tight">Código QR para Cobro</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Escanéalo con cualquier celular para abrir esta tarjeta de pago al instante.
              </p>
            </div>

            {qrDataUrl && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center mb-4">
                <img src={qrDataUrl} alt="QR de Pago" className="w-48 h-48" />
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleDownloadQrPng}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen PNG (Imprimir)</span>
              </button>

              <button
                onClick={() => handleCopy('Enlace', publicUrl, 'qr_url_modal')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Enlace de la Tarjeta</span>
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Pequeño logo SVG de Google limpio para el botón de reseñas
function GoogleLogoSmall() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
