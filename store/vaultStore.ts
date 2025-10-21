import { create } from 'zustand';
import { InstalledApp } from '@/services/apps';

export interface MonitoringSettings {
  audioMonitoringEnabled: boolean;
  screenMonitoringEnabled: boolean;
  activityLoggingEnabled: boolean;
  lastMonitoringCheck: number;
}

export interface VaultState {
  isLocked: boolean;
  isDecoyMode: boolean;
  currentPin: string | null;
  installedApps: InstalledApp[];
  hiddenApps: string[];
  lastActivityTime: number;
  monitoringSettings: MonitoringSettings;
  
  setLocked: (locked: boolean) => void;
  setDecoyMode: (isDecoy: boolean) => void;
  setCurrentPin: (pin: string | null) => void;
  setInstalledApps: (apps: InstalledApp[]) => void;
  setHiddenApps: (apps: string[]) => void;
  updateLastActivity: () => void;
  addHiddenApp: (packageName: string) => void;
  removeHiddenApp: (packageName: string) => void;
  updateMonitoringSettings: (settings: Partial<MonitoringSettings>) => void;
  reset: () => void;
}

const initialState = {
  isLocked: true,
  isDecoyMode: false,
  currentPin: null,
  installedApps: [],
  hiddenApps: [],
  lastActivityTime: Date.now(),
  monitoringSettings: {
    audioMonitoringEnabled: false,
    screenMonitoringEnabled: false,
    activityLoggingEnabled: false,
    lastMonitoringCheck: Date.now(),
  },
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
  
  reset: () => {
    console.log('[VaultStore] Resetting store');
    set(initialState);
  },
}));
