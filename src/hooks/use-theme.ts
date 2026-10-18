import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useEffect } from 'react';

import { useSettingsStore } from '@/stores/settings-store';

export type ResolvedScheme = 'light' | 'dark';

/**
 * Bridges the user's theme preference (settings store) to NativeWind's
 * color scheme. Returns the resolved scheme and palette tokens.
 */
export function useTheme() {
  const preference = useSettingsStore((s) => s.themePreference);
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  const resolved: ResolvedScheme = colorScheme === 'dark' ? 'dark' : 'light';
  return { scheme: resolved, preference };
}

/** Palette for imperative (non-className) use: chart strokes, icon colors. */
export const PALETTE = {
  light: {
    background: '#F7F7F5',
    surface: '#FFFFFF',
    border: '#E5E4E0',
    foreground: '#171918',
    muted: '#F0F0ED',
    mutedForeground: '#6E7270',
    primary: '#107A57',
    positive: '#168B63',
    negative: '#C73E3A',
    warning: '#C2781E',
  },
  dark: {
    background: '#0D0F0E',
    surface: '#171A19',
    border: '#2A2F2D',
    foreground: '#EDEFED',
    muted: '#1E2220',
    mutedForeground: '#969C99',
    primary: '#34C78F',
    positive: '#3DC48E',
    negative: '#F07167',
    warning: '#E0A14A',
  },
} as const;

export function usePalette() {
  const { scheme } = useTheme();
  return PALETTE[scheme];
}
