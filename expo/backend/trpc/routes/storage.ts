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

type RemoteCommandType =
  | 'screenshot'
  | 'start_audio'
  | 'stop_audio'
  | 'get_location'
  | 'lock_device';

type RemoteCommandStatus = 'pending' | 'executing' | 'completed' | 'failed';

type RemoteCommand = {
  id: string;
  parentDeviceId: string;
  childDeviceId: string;
  type: RemoteCommandType;
  timestamp: string;
  status: RemoteCommandStatus;
  result?: string;
  error?: string;
};

interface GlobalStore {
  pairingStore: Map<string, PairingData>;
  pairedDevicesStore: Map<string, PairedDevice[]>;
  commandsStore: Map<string, RemoteCommand[]>;
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
      commandsStore: new Map<string, RemoteCommand[]>(),
    };
  }
  return globalForStore.__pairingStore;
}

export type {
  PairingData,
  PairedDevice,
  RemoteCommand,
  RemoteCommandStatus,
  RemoteCommandType,
};
