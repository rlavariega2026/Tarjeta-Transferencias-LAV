import { PaymentCard } from '../types/paymentCard';
import { INITIAL_DEMO_CARD } from './templateCatalog';

const API_BASE = `${import.meta.env.BASE_URL}api`;

const LOCAL_STORAGE_KEY = 'lav_pagos_cards_v1';
const SETTINGS_STORAGE_KEY = 'lav_pagos_hostinger_settings';

export interface HostingerSettings {
  baseUrl: string; // e.g. "https://lavdigitalmkt.com/pagos-digitales/"
  apiEndpoint: string; // e.g. "https://lavdigitalmkt.com/pagos-digitales/api"
  useRemoteApi: boolean;
}

export const DEFAULT_HOSTINGER_SETTINGS: HostingerSettings = {
  baseUrl: 'https://lavdigitalagency.com/Tarjetas-transferencias/',
  apiEndpoint: `${import.meta.env.BASE_URL}api`,
  useRemoteApi: false
};

export function getHostingerSettings(): HostingerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const merged = { ...DEFAULT_HOSTINGER_SETTINGS, ...saved };
      if (['lavdigitalagency.com', 'www.lavdigitalagency.com'].includes(window.location.hostname.toLowerCase())) {
        return { ...merged, baseUrl: 'https://lavdigitalagency.com/Tarjetas-transferencias/', apiEndpoint: `${import.meta.env.BASE_URL}api` };
      }
      return merged;
    }
  } catch (e) {
    console.error('Error reading hostinger settings:', e);
  }
  if (['lavdigitalagency.com', 'www.lavdigitalagency.com'].includes(window.location.hostname.toLowerCase())) {
    return { ...DEFAULT_HOSTINGER_SETTINGS, baseUrl: 'https://lavdigitalagency.com/Tarjetas-transferencias/', apiEndpoint: `${import.meta.env.BASE_URL}api` };
  }
  return DEFAULT_HOSTINGER_SETTINGS;
}

export function saveHostingerSettings(settings: HostingerSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving hostinger settings:', e);
  }
}

/**
 * Carga inicial de tarjetas desde LocalStorage para sincronización inmediata
 */
function getLocalCards(): PaymentCard[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local cards:', e);
  }
  // Semilla inicial
  saveLocalCards([INITIAL_DEMO_CARD]);
  return [INITIAL_DEMO_CARD];
}

function saveLocalCards(cards: PaymentCard[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Error saving local cards:', e);
  }
}

/**
 * Obtiene todas las tarjetas (intenta servidor Express / PHP, y sincroniza con localStorage)
 */
export async function fetchCards(): Promise<PaymentCard[]> {
  try {
    const response = await fetch(`${API_BASE}/cards`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        saveLocalCards(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('API de servidor no accesible en este instante, usando almacenamiento persistente local:', err);
  }
  return getLocalCards();
}

/**
 * Obtiene una tarjeta individual por su slug (para vista pública)
 */
export async function fetchCardBySlug(slug: string): Promise<PaymentCard | null> {
  const cleanSlug = slug.toLowerCase().trim();
  
  // 1. Intento por backend
  try {
    const response = await fetch(`${API_BASE}/cards/${encodeURIComponent(cleanSlug)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const card = await response.json();
      if (card && card.slug) {
        return card;
      }
    }
  } catch (err) {
    console.warn('Error buscando en servidor remoto, buscando en caché local:', err);
  }

  // 2. Búsqueda en almacenamiento local
  const localCards = getLocalCards();
  const match = localCards.find(c => c.slug.toLowerCase() === cleanSlug);
  return match || null;
}

/**
 * Guarda o actualiza una tarjeta en el backend y en local
 */
export async function saveCard(card: PaymentCard): Promise<{ success: boolean; card: PaymentCard; message?: string }> {
  // Asegurar timestamps
  const now = new Date().toISOString();
  const preparedCard: PaymentCard = {
    ...card,
    updatedAt: now,
    publishedAt: card.status === 'published' ? (card.publishedAt || now) : undefined
  };

  // Guardar en local primero para cero latencia
  const localCards = getLocalCards();
  const existingIdx = localCards.findIndex(c => c.id === preparedCard.id);
  let updatedList: PaymentCard[];
  if (existingIdx >= 0) {
    updatedList = [...localCards];
    updatedList[existingIdx] = preparedCard;
  } else {
    updatedList = [preparedCard, ...localCards];
  }
  saveLocalCards(updatedList);

  // Guardar en backend (Express en dev / PHP en Hostinger)
  try {
    const response = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(preparedCard)
    });

    if (response.ok) {
      const serverResult = await response.json();
      return {
        success: true,
        card: serverResult.card || preparedCard,
        message: 'Tarjeta guardada y sincronizada correctamente en el servidor.'
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        success: true,
        card: preparedCard,
        message: `Guardado en almacenamiento local persistente (aviso del servidor: ${errData.error || 'código ' + response.status})`
      };
    }
  } catch (err: any) {
    console.warn('No se pudo conectar con el endpoint /api/cards, guardado en almacenamiento local:', err);
    return {
      success: true,
      card: preparedCard,
      message: 'Guardado correctamente en almacenamiento local del dispositivo.'
    };
  }
}

/**
 * Elimina una tarjeta
 */
export async function deleteCard(id: string): Promise<{ success: boolean }> {
  const localCards = getLocalCards();
  const filtered = localCards.filter(c => c.id !== id);
  saveLocalCards(filtered);

  try {
    await fetch(`${API_BASE}/cards/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Error llamando a delete en servidor:', err);
  }
  return { success: true };
}

/**
 * Duplica una tarjeta existente
 */
export async function duplicateCard(id: string): Promise<PaymentCard> {
  const localCards = getLocalCards();
  const source = localCards.find(c => c.id === id) || INITIAL_DEMO_CARD;
  
  const now = new Date().toISOString();
  const uniqueSuffix = Math.random().toString(36).substring(2, 6);
  const duplicated: PaymentCard = {
    ...JSON.parse(JSON.stringify(source)),
    id: `card_${Date.now()}_${uniqueSuffix}`,
    slug: `${source.slug}-copia-${uniqueSuffix}`,
    businessName: `${source.businessName} (Copia)`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    publishedAt: undefined
  };

  await saveCard(duplicated);
  return duplicated;
}

/**
 * Verifica si un slug está disponible
 */
export function isSlugAvailable(slug: string, currentCardId: string, allCards: PaymentCard[]): boolean {
  const clean = slug.toLowerCase().trim();
  if (!clean) return false;
  return !allCards.some(c => c.id !== currentCardId && c.slug.toLowerCase() === clean);
}

/**
 * Sube un archivo de logotipo al servidor o lo convierte a Base64 optimizado
 */
export async function uploadLogo(file: File): Promise<{ url: string }> {
  // Validación de seguridad de archivo
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Formato no soportado. Por favor utiliza PNG, JPG, WebP o SVG.');
  }

  // Límite de 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo supera el límite de 5MB.');
  }

  // Intenta subir vía FormData al backend
  const formData = new FormData();
  formData.append('logo', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return { url: data.url };
      }
    }
  } catch (err) {
    console.warn('Endpoint de subida no respondió, codificando a Data URL local optimizada:', err);
  }

  // Fallback seguro a Data URL en base64 para persistir sin fallar
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => reject(new Error('Error al procesar el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Genera la URL pública completa de la tarjeta
 */
export function getCardPublicUrl(slug: string, overrideBaseUrl?: string): string {
  const settings = getHostingerSettings();
  const configuredBase = overrideBaseUrl || settings.baseUrl || window.location.origin;
  const currentOrigin = window.location.origin;

  // En producción, todas las tarjetas deben abrir directamente la vista pública,
  // nunca la raíz de administración ni una URL guardada anteriormente en el navegador.
  let publicBase = configuredBase;
  if (currentOrigin.includes('lavdigitalagency.com')) {
    publicBase = `${currentOrigin}/Tarjetas-transferencias/`;
  } else if (configuredBase.includes('lavdigitalagency.com')) {
    publicBase = 'https://lavdigitalagency.com/Tarjetas-transferencias/';
  }

  const cleanBase = publicBase.endsWith('/') ? publicBase : `${publicBase}/`;
  if (publicBase.includes('/Tarjetas-transferencias') || publicBase.includes('lavdigitalagency.com')) {
    return `${cleanBase}t/${encodeURIComponent(slug)}`;
  }

  // En AI Studio o preview local:
  return `${currentOrigin}/?card=${encodeURIComponent(slug)}`;
}

/**
 * Prueba la conexión con el servidor
 */
export async function testServerConnection(): Promise<{
  connected: boolean;
  driver: string;
  status: string;
  timestamp: string;
  message: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        driver: data.driver || 'Express (AI Studio Dev Engine)',
        status: data.status || 'OK',
        timestamp: data.timestamp || new Date().toISOString(),
        message: data.message || 'Servidor backend activo y respondiendo correctamente.'
      };
    }
  } catch (err) {
    //
  }

  return {
    connected: false,
    driver: 'Almacenamiento Local (Sin conexión al backend)',
    status: 'OFFLINE_FALLBACK',
    timestamp: new Date().toISOString(),
    message: 'No se detecta respuesta del endpoint /api/health. La aplicación opera con persistencia local en el navegador.'
  };
}
