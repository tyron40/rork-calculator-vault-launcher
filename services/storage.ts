import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { encrypt, decrypt, generateSalt, deriveKey, hashPin } from './crypto';

const STORAGE_KEYS = {
  PIN_HASH: 'vault_pin_hash',
  DECOY_PIN_HASH: 'vault_decoy_pin_hash',
  SALT: 'vault_salt',
  HIDDEN_APPS: 'vault_hidden_apps',
  DECOY_HIDDEN_APPS: 'vault_decoy_hidden_apps',
  SETTINGS: 'vault_settings',
  ONBOARDING_COMPLETE: 'vault_onboarding_complete',
} as const;

export interface VaultSettings {
  biometricEnabled: boolean;
  autoLockMinutes: number;
  decoyPinEnabled: boolean;
}

const DEFAULT_SETTINGS: VaultSettings = {
  biometricEnabled: false,
  autoLockMinutes: 3,
  decoyPinEnabled: false,
};

async function secureStoreSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureStoreGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function secureStoreDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function initializeVault(pin: string): Promise<void> {
  console.log('[Storage] Initializing vault');
  
  const salt = await generateSalt();
  const pinHash = await hashPin(pin);
  
  await secureStoreSet(STORAGE_KEYS.SALT, salt);
  await secureStoreSet(STORAGE_KEYS.PIN_HASH, pinHash);
  
  const key = await deriveKey(pin, salt);
  const emptyApps = JSON.stringify([]);
  const encryptedApps = await encrypt(emptyApps, key);
  
  await secureStoreSet(STORAGE_KEYS.HIDDEN_APPS, encryptedApps);
  
  const settingsJson = JSON.stringify(DEFAULT_SETTINGS);
  const encryptedSettings = await encrypt(settingsJson, key);
  await secureStoreSet(STORAGE_KEYS.SETTINGS, encryptedSettings);
  
  console.log('[Storage] Vault initialized successfully');
}

export async function verifyPin(pin: string, isDecoy: boolean = false): Promise<boolean> {
  console.log('[Storage] Verifying PIN', { isDecoy });
  
  const key = isDecoy ? STORAGE_KEYS.DECOY_PIN_HASH : STORAGE_KEYS.PIN_HASH;
  const storedHash = await secureStoreGet(key);
  
  if (!storedHash) {
    console.log('[Storage] No PIN hash found');
    return false;
  }
  
  const pinHash = await hashPin(pin);
  const isValid = pinHash === storedHash;
  
  console.log('[Storage] PIN verification result:', isValid);
  return isValid;
}

export async function isVaultInitialized(): Promise<boolean> {
  const pinHash = await secureStoreGet(STORAGE_KEYS.PIN_HASH);
  const salt = await secureStoreGet(STORAGE_KEYS.SALT);
  return !!(pinHash && salt);
}

export async function getHiddenApps(pin: string, isDecoy: boolean = false): Promise<string[]> {
  console.log('[Storage] Getting hidden apps', { isDecoy });
  
  const salt = await secureStoreGet(STORAGE_KEYS.SALT);
  if (!salt) {
    console.log('[Storage] No salt found');
    return [];
  }
  
  const key = await deriveKey(pin, salt);
  const storageKey = isDecoy ? STORAGE_KEYS.DECOY_HIDDEN_APPS : STORAGE_KEYS.HIDDEN_APPS;
  const encryptedApps = await secureStoreGet(storageKey);
  
  if (!encryptedApps) {
    console.log('[Storage] No hidden apps found');
    return [];
  }
  
  try {
    const decryptedApps = await decrypt(encryptedApps, key);
    const apps = JSON.parse(decryptedApps);
    console.log(`[Storage] Retrieved ${apps.length} hidden apps`);
    return apps;
  } catch (error) {
    console.error('[Storage] Error decrypting hidden apps:', error);
    return [];
  }
}

export async function saveHiddenApps(
  pin: string,
  apps: string[],
  isDecoy: boolean = false
): Promise<void> {
  console.log('[Storage] Saving hidden apps', { count: apps.length, isDecoy });
  
  const salt = await secureStoreGet(STORAGE_KEYS.SALT);
  if (!salt) {
    throw new Error('Vault not initialized');
  }
  
  const key = await deriveKey(pin, salt);
  const appsJson = JSON.stringify(apps);
  const encryptedApps = await encrypt(appsJson, key);
  
  const storageKey = isDecoy ? STORAGE_KEYS.DECOY_HIDDEN_APPS : STORAGE_KEYS.HIDDEN_APPS;
  await secureStoreSet(storageKey, encryptedApps);
  
  console.log('[Storage] Hidden apps saved successfully');
}

export async function getSettings(pin: string): Promise<VaultSettings> {
  console.log('[Storage] Getting settings');
  
  const salt = await secureStoreGet(STORAGE_KEYS.SALT);
  if (!salt) {
    console.log('[Storage] No salt found, returning default settings');
    return DEFAULT_SETTINGS;
  }
  
  const key = await deriveKey(pin, salt);
  const encryptedSettings = await secureStoreGet(STORAGE_KEYS.SETTINGS);
  
  if (!encryptedSettings) {
    console.log('[Storage] No settings found, returning default');
    return DEFAULT_SETTINGS;
  }
  
  try {
    const decryptedSettings = await decrypt(encryptedSettings, key);
    const settings = JSON.parse(decryptedSettings);
    console.log('[Storage] Retrieved settings');
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('[Storage] Error decrypting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(pin: string, settings: VaultSettings): Promise<void> {
  console.log('[Storage] Saving settings');
  
  const salt = await secureStoreGet(STORAGE_KEYS.SALT);
  if (!salt) {
    throw new Error('Vault not initialized');
  }
  
  const key = await deriveKey(pin, salt);
  const settingsJson = JSON.stringify(settings);
  const encryptedSettings = await encrypt(settingsJson, key);
  
  await secureStoreSet(STORAGE_KEYS.SETTINGS, encryptedSettings);
  
  console.log('[Storage] Settings saved successfully');
}

export async function setupDecoyPin(mainPin: string, decoyPin: string): Promise<void> {
  console.log('[Storage] Setting up decoy PIN');
  
  const decoyPinHash = await hashPin(decoyPin);
  await secureStoreSet(STORAGE_KEYS.DECOY_PIN_HASH, decoyPinHash);
  
  const salt = await secureStoreGet(STORAGE_KEYS.SALT);
  if (!salt) {
    throw new Error('Vault not initialized');
  }
  
  const key = await deriveKey(decoyPin, salt);
  const emptyApps = JSON.stringify([]);
  const encryptedApps = await encrypt(emptyApps, key);
  
  await secureStoreSet(STORAGE_KEYS.DECOY_HIDDEN_APPS, encryptedApps);
  
  console.log('[Storage] Decoy PIN setup successfully');
}

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await secureStoreGet(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return value === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await secureStoreSet(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
}

export async function resetVault(): Promise<void> {
  console.log('[Storage] Resetting vault');
  
  await secureStoreDelete(STORAGE_KEYS.PIN_HASH);
  await secureStoreDelete(STORAGE_KEYS.DECOY_PIN_HASH);
  await secureStoreDelete(STORAGE_KEYS.SALT);
  await secureStoreDelete(STORAGE_KEYS.HIDDEN_APPS);
  await secureStoreDelete(STORAGE_KEYS.DECOY_HIDDEN_APPS);
  await secureStoreDelete(STORAGE_KEYS.SETTINGS);
  await secureStoreDelete(STORAGE_KEYS.ONBOARDING_COMPLETE);
  
  console.log('[Storage] Vault reset successfully');
}
