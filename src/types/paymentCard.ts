/**
 * LAV Digital Pagos - Tipos y modelos de datos
 */

export type CardStatus = 'draft' | 'published' | 'archived';

export interface BankCustomField {
  id: string;
  label: string;
  value: string;
}

export interface BankAccount {
  id: string;
  accountLabel: string; // e.g. "Cuenta Principal", "Pedidos Express", "Sucursal Monterrey"
  beneficiary: string;  // Nombre del titular
  bankName: string;     // Nombre del banco (BBVA, Santander, Banorte, STP, Nu, etc.)
  clabe: string;        // 18 dígitos CLABE
  accountNumber: string;// Número de cuenta
  cardNumber: string;   // Número de tarjeta (opcional)
  accountType: string;  // "Débito", "Cheques", "Empresarial"
  reference: string;    // Referencia de pago sugerida
  concept: string;      // Concepto sugerido
  currency: string;     // "MXN", "USD", "EUR"
  instructions: string; // Instrucciones adicionales
  customFields: BankCustomField[];
  visibleFields: {
    beneficiary: boolean;
    bankName: boolean;
    clabe: boolean;
    accountNumber: boolean;
    cardNumber: boolean;
    accountType: boolean;
    reference: boolean;
    concept: boolean;
    currency: boolean;
    instructions: boolean;
  };
  shareInWhatsApp: boolean;
}

export interface PayPalConfig {
  enabled: boolean;
  sectionTitle: string;
  payUrl: string;        // e.g. "https://paypal.me/minegocio" o link comercial
  businessName: string;
  description: string;
  suggestedAmount: string;
  currency: string;
  buttonText: string;
  instructions: string;
}

export interface GoogleReviewConfig {
  enabled: boolean;
  sectionTitle: string;
  reviewUrl: string;     // e.g. "https://g.page/r/.../review" o enlace directo
  buttonText: string;
  message: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;   // Número con lada para recibir comprobantes (opcional)
  businessPhoneFormatted?: string;
  shareCardMessage: string;
  shareBankMessage: string;
  shareAllMessage: string;
  promptText: string;
}

export interface QRCodeConfig {
  enabled: boolean;
  includeLogo: boolean;
  size: number;
  fgColor: string;
  bgColor: string;
}

export interface CardTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentTextColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  borderColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  fontFamily: 'sans' | 'display' | 'serif' | 'mono' | 'poppins' | 'montserrat' | 'lora' | 'space';
  cardElevation: 'flat' | 'subtle-border' | 'soft-shadow' | 'glass' | 'bold-border';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  accentGradient?: string;
  backgroundGradient?: string;
  metallicStyle?: 'none' | 'gold' | 'silver' | 'rose-gold' | 'titanium';
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'mesh' | 'radial';
  backgroundImage?: string;
  businessNameFontSize?: number;
  taglineFontSize?: number;
  categoryFontSize?: number;
}

export interface WifiConfig { enabled: boolean; ssid: string; password: string; }

export interface PaymentCard {
  id: string;
  slug: string;
  businessName: string;
  tagline: string;
  category: string;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Identidad
  logoUrl?: string;
  logoShape: 'original' | 'square' | 'circle' | 'rounded';
  logoSize: 'sm' | 'md' | 'lg' | 'xl';
  logoAlignment: 'left' | 'center' | 'right';
  
  // Plantilla & Estilos
  templateId: string;
  theme: CardTheme;
  
  // Módulos
  banking: {
    enabled: boolean;
    sectionTitle: string;
    accounts: BankAccount[];
  };
  paypal: PayPalConfig;
  googleReview: GoogleReviewConfig;
  whatsapp: WhatsAppConfig;
  qrCode: QRCodeConfig;
  wifi?: WifiConfig;
  
  // Metadatos
  publicNotes?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  defaultTheme: CardTheme;
  badgeText: string;
  accentColor: string;
}
