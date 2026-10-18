import * as SecureStore from 'expo-secure-store';

/**
 * Encrypted storage for small sensitive values (e.g. a future PIN or
 * sync token). Not used for financial records. Provided so secrets never
 * land in plain MMKV/AsyncStorage.
 */
export async function setSecret(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecret(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function deleteSecret(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
