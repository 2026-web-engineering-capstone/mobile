import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

type FontScale = 'md' | 'lg';

type AppState = {
  highContrast: boolean;
  fontScale: FontScale;
  themePreference: ThemePreference;
  toggleHighContrast: () => void;
  toggleFontScale: () => void;
  setThemePreference: (themePreference: ThemePreference) => void;
};

export const useAppStore = create<AppState>((set) => ({
  highContrast: false,
  fontScale: 'md',
  themePreference: 'system',
  toggleHighContrast: () =>
    set((state) => ({ highContrast: !state.highContrast })),
  toggleFontScale: () =>
    set((state) => ({ fontScale: state.fontScale === 'md' ? 'lg' : 'md' })),
  setThemePreference: (themePreference) => set({ themePreference }),
}));
