import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_CURRENCY } from "@/constants/currencies";
import { preferenceStorage } from "@/lib/storage";
import type { ThemePreference } from "@/types";

interface SettingsState {
  themePreference: ThemePreference;
  currency: string;
  /** Default monthly overall budget suggestion, in minor units (0 = unset). */
  defaultMonthlyBudget: number;
  hydrated: boolean;

  setThemePreference: (pref: ThemePreference) => void;
  setCurrency: (code: string) => void;
  setDefaultMonthlyBudget: (minor: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: "system",
      currency: DEFAULT_CURRENCY,
      defaultMonthlyBudget: 0,
      hydrated: false,

      setThemePreference: (themePreference) => set({ themePreference }),
      setCurrency: (currency) => set({ currency }),
      setDefaultMonthlyBudget: (defaultMonthlyBudget) =>
        set({ defaultMonthlyBudget }),
    }),
    {
      name: "cashing-settings",
      storage: createJSONStorage(() => preferenceStorage),
      partialize: ({ themePreference, currency, defaultMonthlyBudget }) => ({
        themePreference,
        currency,
        defaultMonthlyBudget,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
