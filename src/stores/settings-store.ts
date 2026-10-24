import { create } from 'zustand';
import { StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/seed';
import { posRepository } from '../data/repositories/pos-repository';

interface SettingsState {
  settings: StoreSettings;
  language: 'en' | 'ta';
  theme: 'light' | 'dark';
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<StoreSettings>) => Promise<void>;
  setLanguage: (lang: 'en' | 'ta') => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: INITIAL_SETTINGS,
  language: 'en',
  theme: 'light',
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await posRepository.getSettings();
      set({
        settings: data,
        language: data.language || 'en',
        theme: data.theme || 'light',
        isLoading: false,
      });
      if (typeof document !== 'undefined') {
        if (data.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    set({ settings: updated });
    await posRepository.saveSettings(updated);
  },

  setLanguage: (lang) => {
    set({ language: lang });
    get().updateSettings({ language: lang });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    get().updateSettings({ theme: nextTheme });
  },
}));
