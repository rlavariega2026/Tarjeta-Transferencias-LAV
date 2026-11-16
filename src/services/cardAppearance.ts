import type { CardEffects, DesignShadow, LogoAppearance, PaymentCard } from '../types/paymentCard';

const logoSizes = { sm: [108, 68], md: [164, 96], lg: [196, 120], xl: [232, 144] };
const defaultShadow: DesignShadow = { enabled: false, color: '#201236', opacity: 45, blur: 28, x: 0, y: 10 };

export function getLogoAppearance(card: PaymentCard): LogoAppearance {
  const [width, height] = logoSizes[card.logoSize] || logoSizes.md;
  return card.logoAppearance || {
    width, height, fit: 'contain', zoom: 1, x: 50, y: 50, background: false, shadow: defaultShadow,
  };
}

export function getCardEffects(card: PaymentCard): CardEffects {
  return card.theme.effects || {
    shadow: defaultShadow,
    border: { style: 'template', radius: 24, width: 2, color: '#a78bfa', accent: '#f5dca0' },
    beam: { enabled: false, color: '#e9d5ff', intensity: 85, seconds: 6 },
  };
}

export function shadowStyle(shadow: DesignShadow): string {
  if (!shadow.enabled) return 'none';
  const alpha = Math.round(shadow.opacity * 2.55).toString(16).padStart(2, '0');
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}${alpha}`;
}
