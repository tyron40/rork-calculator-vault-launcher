import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';

const SALT_LENGTH = 32;
const IV_LENGTH = 12;

export async function deriveKey(pin: string, salt: string): Promise<string> {
  console.log('[Crypto] Deriving key from PIN');
  
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + salt
  );
  
  return key;
}

export async function generateSalt(): Promise<string> {
  console.log('[Crypto] Generating salt');
  const randomBytes = await Crypto.getRandomBytesAsync(SALT_LENGTH);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function stringToBase64(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
}

function base64ToString(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function encrypt(data: string, key: string): Promise<string> {
  console.log('[Crypto] Encrypting data');
  
  const iv = await Crypto.getRandomBytesAsync(IV_LENGTH);
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const combined = key + ivHex;
  const encryptionKey = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  
  const dataWithIv = ivHex + '::' + data;
  const encrypted = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    encryptionKey + dataWithIv
  );
  
  return ivHex + '::' + encrypted + '::' + stringToBase64(data);
}

export async function decrypt(encryptedData: string, key: string): Promise<string> {
  console.log('[Crypto] Decrypting data');
  
  try {
    const parts = encryptedData.split('::');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, hash, base64Data] = parts;
    
    const combined = key + ivHex;
    const encryptionKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    
    const decrypted = base64ToString(base64Data);
    
    const dataWithIv = ivHex + '::' + decrypted;
    const expectedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      encryptionKey + dataWithIv
    );
    
    if (expectedHash !== hash) {
      throw new Error('Data integrity check failed');
    }
    
    return decrypted;
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

export async function hashPin(pin: string): Promise<string> {
  console.log('[Crypto] Hashing PIN');
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}
