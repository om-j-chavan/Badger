'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppMode, Theme, Language, Settings } from '@/types';
import { applyTheme } from '@/lib/theme';

interface AppContextType {
  appMode: AppMode;
  theme: Theme;
  language: Language;
  settings: Settings | null;
  isSimpleMode: boolean;
  isDarkMode: boolean;
  updateAppMode: (mode: AppMode) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);

      // Apply theme on load
      if (data) {
        applyTheme(data.appMode, data.theme);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateAppMode = async (mode: AppMode) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appMode: mode }),
      });
      const data = await res.json();
      setSettings(data);
      applyTheme(mode, data.theme);
    } catch (error) {
      console.error('Error updating app mode:', error);
    }
  };

  const updateTheme = async (theme: Theme) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      setSettings(data);
      applyTheme(data.appMode, theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const updateLanguage = async (language: Language) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      setSettings(data);
      // Language change takes effect immediately - no reload needed
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  if (loading || !settings) {
    return null; // Or loading spinner
  }

  const value: AppContextType = {
    appMode: settings.appMode,
    theme: settings.theme,
    language: settings.language,
    settings,
    isSimpleMode: settings.appMode === 'simple',
    isDarkMode: settings.theme === 'dark',
    updateAppMode,
    updateTheme,
    updateLanguage,
    refreshSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
