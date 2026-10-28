/**
 * Validador de CLABE Interbancaria Mexicana (18 dígitos)
 * Norma oficial del Banco de México / ABM
 */

// Catálogo de códigos de instituciones financieras de México
export const BANK_CODES: Record<string, string> = {
  '002': 'Banamex (Citibanamex)',
  '012': 'BBVA México',
  '014': 'Santander México',
  '021': 'HSBC México',
  '030': 'Banco del Bajío',
  '036': 'Inbursa',
  '042': 'Mifel',
  '044': 'Scotiabank Inverlat',
  '058': 'Banregio',
  '059': 'Invex',
  '060': 'Bansi',
  '062': 'Afirme',
  '072': 'Banorte',
  '102': 'ABN AMRO',
  '106': 'Bank of America',
  '127': 'Banco Azteca',
  '130': 'Compartamos Banco',
  '136': 'Intercam Banco',
  '137': 'Bancoppel',
  '138': 'ABC Capital',
  '140': 'Consubanco',
  '147': 'Bankaool',
  '166': 'Banco del Bienestar',
  '638': 'Nu México (Nu)',
  '646': 'STP (Sistema de Transferencias y Pagos)',
  '659': 'Oxxo Pay / Spin',
  '670': 'Mercado Pago Wallet',
  '684': 'Klar / Servicios Financieros Alternativos',
  '706': 'Arcus / RappiPay',
  '846': 'Albo / STP',
  '901': 'CLS Bank International',
  '902': 'SD. INDEVAL'
};

export interface ClabeValidationResult {
  isValid: boolean;
  length: number;
  bankName: string | null;
  bankCode: string | null;
  error: string | null;
  isChecksumValid: boolean;
}

/**
 * Calcula el dígito verificador ponderado según el algoritmo ABM
 * Factores de peso cíclicos: 3, 7, 1
 */
function calculateClabeCheckDigit(clabe17: string): number {
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const digit = parseInt(clabe17.charAt(i), 10);
    const product = (digit * weights[i]) % 10;
    sum = (sum + product) % 10;
  }
  return (10 - (sum % 10)) % 10;
}

export function validateClabe(clabe: string): ClabeValidationResult {
  const cleanClabe = clabe.replace(/\s+/g, '');
  
  if (!cleanClabe) {
    return {
      isValid: false,
      length: 0,
      bankName: null,
      bankCode: null,
      error: 'La CLABE no puede estar vacía',
      isChecksumValid: false
    };
  }

  if (!/^\d+$/.test(cleanClabe)) {
    return {
      isValid: false,
      length: cleanClabe.length,
      bankName: null,
      bankCode: null,
      error: 'La CLABE debe contener exclusivamente números',
      isChecksumValid: false
    };
  }

  if (cleanClabe.length !== 18) {
    return {
      isValid: false,
      length: cleanClabe.length,
      bankName: null,
      bankCode: null,
      error: `Longitud incorrecta: ${cleanClabe.length} de 18 dígitos requeridos`,
      isChecksumValid: false
    };
  }

  const bankCode = cleanClabe.substring(0, 3);
  const bankName = BANK_CODES[bankCode] || 'Institución bancaria no listada en catálogo ABM';

  const clabe17 = cleanClabe.substring(0, 17);
  const expectedCheckDigit = calculateClabeCheckDigit(clabe17);
  const actualCheckDigit = parseInt(cleanClabe.charAt(17), 10);
  const isChecksumValid = expectedCheckDigit === actualCheckDigit;

  if (!isChecksumValid) {
    return {
      isValid: false,
      length: 18,
      bankName,
      bankCode,
      error: `Dígito verificador inválido (calculado: ${expectedCheckDigit}, capturado: ${actualCheckDigit})`,
      isChecksumValid: false
    };
  }

  return {
    isValid: true,
    length: 18,
    bankName,
    bankCode,
    error: null,
    isChecksumValid: true
  };
}

/**
 * Formatea una CLABE en bloques visuales 3-3-11-1 para facilitar la lectura sin alterar el valor copiado
 */
export function formatClabeDisplay(clabe: string): string {
  const clean = clabe.replace(/\D/g, '');
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  if (clean.length <= 17) return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 17)} ${clean.slice(17, 18)}`;
}

/**
 * Formatea números de tarjeta en bloques de 4 dígitos
 */
export function formatCardNumberDisplay(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}
