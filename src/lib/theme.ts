// ============================================
// BADGER - Theme System
// ============================================

import type { AppMode, Theme } from '@/types';

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  border: string;
}

export const themes: Record<AppMode, Record<Theme, ThemeColors>> = {
  simple: {
    light: {
      primary: '#ADEBB3',      // Mint green - primary color
      accent: '#D3AF37',       // Gold - accent color
      background: '#F6FBF8',
      card: '#FFFFFF',
      textPrimary: '#1A1F1E',
      textSecondary: '#6B7280',
      divider: '#E5E7EB',
      border: '#E5E7EB',
    },
    dark: {
      primary: '#7FC8A9',      // Brighter mint for dark mode
      accent: '#E8C468',       // Brighter gold for dark mode
      background: '#0A0F0D',
      card: '#1A1F1E',
      textPrimary: '#E6F0EC',
      textSecondary: '#A5B5AF',
      divider: '#2A3331',
      border: '#2A3331',
    }
  },
  advanced: {
    light: {
      primary: '#D3AF37',      // Gold - INVERTED to primary
      accent: '#ADEBB3',       // Mint - INVERTED to accent
      background: '#FFFEF9',   // Slightly warm background
      card: '#FFFFFF',
      textPrimary: '#1A1F1E',
      textSecondary: '#6B7280',
      divider: '#E5E7EB',
      border: '#E5E7EB',
    },
    dark: {
      primary: '#E8C468',      // Brighter gold for dark mode - INVERTED
      accent: '#7FC8A9',       // Brighter mint for dark mode - INVERTED
      background: '#0F0D08',   // Slightly warm dark background
      card: '#1A1F1E',
      textPrimary: '#E6F0EC',
      textSecondary: '#A5B5AF',
      divider: '#2A3331',
      border: '#2A3331',
    }
  }
};

export function getThemeColors(appMode: AppMode, theme: Theme): ThemeColors {
  return themes[appMode][theme];
}

export function applyTheme(appMode: AppMode, theme: Theme): void {
  const colors = getThemeColors(appMode, theme);
  const root = document.documentElement;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-card', colors.card);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-divider', colors.divider);
  root.style.setProperty('--color-border', colors.border);

  // Set data attributes for CSS targeting
  root.setAttribute('data-mode', appMode);
  root.setAttribute('data-theme', theme);

  // Adjust font size and spacing for Simple Mode
  if (appMode === 'simple') {
    root.style.setProperty('--base-font-size', '16px');
    root.style.setProperty('--spacing-base', '1.5rem');
  } else {
    root.style.setProperty('--base-font-size', '14px');
    root.style.setProperty('--spacing-base', '1rem');
  }
}
