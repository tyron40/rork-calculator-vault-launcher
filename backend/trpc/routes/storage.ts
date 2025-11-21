type PairingData = {
  code: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'parent' | 'child';
  timestamp: number;
  expiresAt: number;
};

type PairedDevice = {
  id: string;
  parentDeviceId: string;
  childDeviceId: string;
  childName: string;
  deviceName: string;
  pairedAt: string;
  lastSeen: string;
  isOnline: boolean;
};

interface GlobalStore {
  pairingStore: Map<string, PairingData>;
  pairedDevicesStore: Map<string, PairedDevice[]>;
}

const globalForStore = global as typeof globalThis & {
  __pairingStore?: GlobalStore;
};

export function getGlobalStore(): GlobalStore {
  if (!globalForStore.__pairingStore) {
    console.log('[Storage] Initializing new global store');
    globalForStore.__pairingStore = {
      pairingStore: new Map<string, PairingData>(),
      pairedDevicesStore: new Map<string, PairedDevice[]>(),
    };
  }
  return globalForStore.__pairingStore;
}

export type { PairingData, PairedDevice };
