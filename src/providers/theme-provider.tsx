import { PropsWithChildren, useEffect } from 'react';
import { Uniwind } from 'uniwind';
import { useAppStore } from '@/store/app-store';

export function ThemeProvider({ children }: PropsWithChildren) {
  const themePreference = useAppStore((state) => state.themePreference);

  useEffect(() => {
    Uniwind.setTheme(themePreference);
  }, [themePreference]);

  return children;
}
