import { NativeModules, Platform } from 'react-native';

export interface InstalledApp {
  label: string;
  packageName: string;
  iconBase64: string;
  launchable: boolean;
}

interface AppManagerModule {
  getInstalledApps(): Promise<InstalledApp[]>;
  launchApp(packageName: string): Promise<void>;
  openLauncherSettings(): Promise<void>;
}

const AppManager: AppManagerModule | null = Platform.OS === 'android' 
  ? NativeModules.AppManager 
  : null;

export async function getInstalledApps(): Promise<InstalledApp[]> {
  if (Platform.OS === 'ios') {
    console.log('[Apps] iOS platform detected, returning iOS mock apps');
    return getIOSMockApps();
  }
  
  if (Platform.OS !== 'android' || !AppManager) {
    console.log('[Apps] Not on Android or AppManager not available, returning mock data');
    return getMockApps();
  }

  try {
    const apps = await AppManager.getInstalledApps();
    console.log(`[Apps] Retrieved ${apps.length} installed apps`);
    return apps;
  } catch (error) {
    console.error('[Apps] Error getting installed apps:', error);
    return getMockApps();
  }
}

export async function launchApp(packageName: string): Promise<void> {
  if (Platform.OS === 'ios') {
    console.log('[Apps] iOS does not support launching other apps, simulating:', packageName);
    return;
  }
  
  if (Platform.OS !== 'android' || !AppManager) {
    console.log('[Apps] Not on Android, simulating app launch:', packageName);
    return;
  }

  try {
    console.log('[Apps] Launching app:', packageName);
    await AppManager.launchApp(packageName);
  } catch (error) {
    console.error('[Apps] Error launching app:', error);
    throw error;
  }
}

export async function openLauncherSettings(): Promise<void> {
  if (Platform.OS !== 'android' || !AppManager) {
    console.log('[Apps] Not on Android, cannot open launcher settings');
    return;
  }

  try {
    console.log('[Apps] Opening launcher settings');
    await AppManager.openLauncherSettings();
  } catch (error) {
    console.error('[Apps] Error opening launcher settings:', error);
    throw error;
  }
}

function getMockApps(): InstalledApp[] {
  return [
    {
      label: 'Chrome',
      packageName: 'com.android.chrome',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Gmail',
      packageName: 'com.google.android.gm',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Photos',
      packageName: 'com.google.android.apps.photos',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Maps',
      packageName: 'com.google.android.apps.maps',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'YouTube',
      packageName: 'com.google.android.youtube',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'WhatsApp',
      packageName: 'com.whatsapp',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Instagram',
      packageName: 'com.instagram.android',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Spotify',
      packageName: 'com.spotify.music',
      iconBase64: '',
      launchable: true,
    },
  ];
}

function getIOSMockApps(): InstalledApp[] {
  return [
    {
      label: 'Safari',
      packageName: 'com.apple.mobilesafari',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Mail',
      packageName: 'com.apple.mobilemail',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Photos',
      packageName: 'com.apple.mobileslideshow',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Maps',
      packageName: 'com.apple.Maps',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Messages',
      packageName: 'com.apple.MobileSMS',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Calendar',
      packageName: 'com.apple.mobilecal',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Notes',
      packageName: 'com.apple.mobilenotes',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Settings',
      packageName: 'com.apple.Preferences',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Music',
      packageName: 'com.apple.Music',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'App Store',
      packageName: 'com.apple.AppStore',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'WhatsApp',
      packageName: 'net.whatsapp.WhatsApp',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Instagram',
      packageName: 'com.burbn.instagram',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'Spotify',
      packageName: 'com.spotify.client',
      iconBase64: '',
      launchable: true,
    },
    {
      label: 'YouTube',
      packageName: 'com.google.ios.youtube',
      iconBase64: '',
      launchable: true,
    },
  ];
}
