import { create } from 'zustand';
import { InstalledApp } from '@/services/apps';

export type UserRole = 'parent' | 'child' | null;

export interface ConnectedDevice {
  id: string;
  name: string;
  deviceId: string;
  childName: string;
  lastSeen: string;
  isOnline: boolean;
  monitoringActive: boolean;
}

export interface MonitoringSettings {
  audioMonitoringEnabled: boolean;
  cameraMonitoringEnabled: boolean;
  screenMonitoringEnabled: boolean;
  activityLoggingEnabled: boolean;
  remoteControlEnabled: boolean;
  locationTrackingEnabled: boolean;
  lastMonitoringCheck: number;
}

export interface VaultState {
  isLocked: boolean;
  isDecoyMode: boolean;
  currentPin: string | null;
  userRole: UserRole;
  installedApps: InstalledApp[];
  hiddenApps: string[];
  lastActivityTime: number;
  monitoringSettings: MonitoringSettings;
  connectedDevices: ConnectedDevice[];
  selectedDeviceId: string | null;
  parentDeviceId: string | null;
  
  setLocked: (locked: boolean) => void;
  setDecoyMode: (isDecoy: boolean) => void;
  setCurrentPin: (pin: string | null) => void;
  setUserRole: (role: UserRole) => void;
  setInstalledApps: (apps: InstalledApp[]) => void;
  setHiddenApps: (apps: string[]) => void;
  updateLastActivity: () => void;
  addHiddenApp: (packageName: string) => void;
  removeHiddenApp: (packageName: string) => void;
  updateMonitoringSettings: (settings: Partial<MonitoringSettings>) => void;
  addConnectedDevice: (device: ConnectedDevice) => void;
  removeConnectedDevice: (deviceId: string) => void;
  updateConnectedDevice: (deviceId: string, updates: Partial<ConnectedDevice>) => void;
  setSelectedDevice: (deviceId: string | null) => void;
  setParentDeviceId: (deviceId: string | null) => void;
  reset: () => void;
}

const initialState = {
  isLocked: true,
  isDecoyMode: false,
  currentPin: null,
  userRole: null as UserRole,
  installedApps: [],
  hiddenApps: [],
  lastActivityTime: Date.now(),
  monitoringSettings: {
    audioMonitoringEnabled: false,
    cameraMonitoringEnabled: false,
    screenMonitoringEnabled: false,
    activityLoggingEnabled: false,
    remoteControlEnabled: false,
    locationTrackingEnabled: false,
    lastMonitoringCheck: Date.now(),
  },
  connectedDevices: [],
  selectedDeviceId: null,
  parentDeviceId: null,
};

export const useVaultStore = create<VaultState>((set) => ({
  ...initialState,
  
  setLocked: (locked: boolean) => {
    console.log('[VaultStore] Setting locked:', locked);
    set({ isLocked: locked });
  },
  
  setDecoyMode: (isDecoy: boolean) => {
    console.log('[VaultStore] Setting decoy mode:', isDecoy);
    set({ isDecoyMode: isDecoy });
  },
  
  setCurrentPin: (pin: string | null) => {
    console.log('[VaultStore] Setting current PIN:', pin ? '****' : null);
    set({ currentPin: pin });
  },
  
  setUserRole: (role: UserRole) => {
    console.log('[VaultStore] Setting user role:', role);
    set({ userRole: role });
  },
  
  setInstalledApps: (apps: InstalledApp[]) => {
    console.log('[VaultStore] Setting installed apps:', apps.length);
    set({ installedApps: apps });
  },
  
  setHiddenApps: (apps: string[]) => {
    console.log('[VaultStore] Setting hidden apps:', apps.length);
    set({ hiddenApps: apps });
  },
  
  updateLastActivity: () => {
    set({ lastActivityTime: Date.now() });
  },
  
  addHiddenApp: (packageName: string) => {
    console.log('[VaultStore] Adding hidden app:', packageName);
    set((state) => ({
      hiddenApps: [...state.hiddenApps, packageName],
    }));
  },
  
  removeHiddenApp: (packageName: string) => {
    console.log('[VaultStore] Removing hidden app:', packageName);
    set((state) => ({
      hiddenApps: state.hiddenApps.filter((pkg) => pkg !== packageName),
    }));
  },
  
  updateMonitoringSettings: (settings: Partial<MonitoringSettings>) => {
    console.log('[VaultStore] Updating monitoring settings:', settings);
    set((state) => ({
      monitoringSettings: {
        ...state.monitoringSettings,
        ...settings,
        lastMonitoringCheck: Date.now(),
      },
    }));
  },
  
  addConnectedDevice: (device: ConnectedDevice) => {
    console.log('[VaultStore] Adding connected device:', device.id);
    set((state) => {
      const exists = state.connectedDevices.some(d => d.id === device.id);
      if (exists) {
        console.log('[VaultStore] Device already exists, skipping:', device.id);
        return state;
      }
      return {
        connectedDevices: [...state.connectedDevices, device],
      };
    });
  },
  
  removeConnectedDevice: (deviceId: string) => {
    console.log('[VaultStore] Removing connected device:', deviceId);
    set((state) => ({
      connectedDevices: state.connectedDevices.filter(d => d.id !== deviceId),
      selectedDeviceId: state.selectedDeviceId === deviceId ? null : state.selectedDeviceId,
    }));
  },
  
  updateConnectedDevice: (deviceId: string, updates: Partial<ConnectedDevice>) => {
    console.log('[VaultStore] Updating connected device:', deviceId);
    set((state) => ({
      connectedDevices: state.connectedDevices.map(d => 
        d.id === deviceId ? { ...d, ...updates } : d
      ),
    }));
  },
  
  setSelectedDevice: (deviceId: string | null) => {
    console.log('[VaultStore] Setting selected device:', deviceId);
    set({ selectedDeviceId: deviceId });
  },
  
  setParentDeviceId: (deviceId: string | null) => {
    console.log('[VaultStore] Setting parent device ID:', deviceId);
    set({ parentDeviceId: deviceId });
  },
  
  reset: () => {
    console.log('[VaultStore] Resetting store');
    set(initialState);
  },
}));
