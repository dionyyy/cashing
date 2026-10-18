import type { StateStorage } from "zustand/middleware";

/**
 * Non-sensitive key-value storage for UI preferences.
 *
 * Prefers react-native-mmkv (fast, synchronous native storage). MMKV ships
 * native code, so it only works in a development/production build — not the
 * stock Expo Go sandbox or Node test runner. We detect that at runtime and
 * fall back to an in-memory map so the app and tests never crash.
 *
 * NOTE: This is for preferences only. Secrets go through SecureStore
 * (see lib/secure.ts), and financial records live in SQLite.
 */

let backend: StateStorage;

try {
  // Lazy require so bundlers/tests without the native module don't explode.
  // react-native-mmkv v4 (Nitro) uses createMMKV() instead of `new MMKV()`.
  const { createMMKV } =
    require("react-native-mmkv") as typeof import("react-native-mmkv");
  const mmkv = createMMKV({ id: "cashing-prefs" });
  backend = {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => {
      mmkv.remove(name);
    },
  };
} catch {
  const memory = new Map<string, string>();
  backend = {
    getItem: (name) => memory.get(name) ?? null,
    setItem: (name, value) => {
      memory.set(name, value);
    },
    removeItem: (name) => {
      memory.delete(name);
    },
  };
}

export const preferenceStorage: StateStorage = backend;
