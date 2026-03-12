import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost && Platform.OS !== "web") {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:8081`;
  }

  if (Platform.OS === "web") {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:8081';
  }

  return 'http://localhost:8081';
};

const BASE_URL = getBaseUrl();

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[API] Request timeout or aborted');
      throw new Error('Request timeout');
    }
    console.error('[API] Fetch error:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  pairing: {
    generateCode: async (parentDeviceId: string, deviceName?: string) => {
      return apiCall<{
        code: string;
        parentDeviceId: string;
        deviceName: string;
        expiresAt: string;
        createdAt: string;
      }>('/api/trpc/pairing.generateCode', {
        method: 'POST',
        body: JSON.stringify({
          json: { parentDeviceId, deviceName },
        }),
      });
    },

    verifyCode: async (code: string, parentDeviceId: string) => {
      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              childDeviceId: string;
              childName: string;
              pairedAt: string;
            };
          };
        };
      }>('/api/trpc/pairing.verifyCode', {
        method: 'POST',
        body: JSON.stringify({
          json: { code, parentDeviceId },
        }),
      });
    },

    getPairedDevices: async (parentDeviceId: string) => {
      const params = new URLSearchParams({
        input: JSON.stringify({ json: { parentDeviceId } }),
      });
      return apiCall<{
        result: {
          data: {
            json: {
              devices: {
                id: string;
                parentDeviceId: string;
                childDeviceId: string;
                childName: string;
                deviceName: string;
                pairedAt: string;
                lastSeen: string;
                isOnline: boolean;
              }[];
              total: number;
            };
          };
        };
      }>(`/api/trpc/pairing.getPairedDevices?${params}`);
    },

    pairDevice: async (code: string, childDeviceId: string, childName: string) => {
      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              parentDeviceId: string;
              parentDeviceName: string;
              timestamp: string;
            };
          };
        };
      }>('/api/trpc/pairing.pairDevice', {
        method: 'POST',
        body: JSON.stringify({
          json: { code, childDeviceId, childName },
        }),
      });
    },

    storePairingCode: async (
      code: string,
      deviceId: string,
      deviceName: string,
      deviceType: 'parent' | 'child'
    ) => {
      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              code: string;
              expiresAt: string;
            };
          };
        };
      }>('/api/trpc/pairing.storePairingCode', {
        method: 'POST',
        body: JSON.stringify({
          json: { code, deviceId, deviceName, deviceType },
        }),
      });
    },

    heartbeat: async (childDeviceId: string) => {
      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              childDeviceId: string;
              lastSeen: string;
            };
          };
        };
      }>('/api/trpc/pairing.heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          json: { childDeviceId },
        }),
      });
    },
  },

  commands: {
    create: async (
      parentDeviceId: string,
      childDeviceId: string,
      type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device'
    ) => {
      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              command: {
                id: string;
                parentDeviceId: string;
                childDeviceId: string;
                type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device';
                timestamp: string;
                status: 'pending' | 'executing' | 'completed' | 'failed';
                result?: string;
                error?: string;
              };
            };
          };
        };
      }>('/api/trpc/commands.create', {
        method: 'POST',
        body: JSON.stringify({
          json: { parentDeviceId, childDeviceId, type },
        }),
      });
    },

    getChildCommands: async (childDeviceId: string, since?: string) => {
      const params = new URLSearchParams({
        input: JSON.stringify({ json: { childDeviceId, since } }),
      });

      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              commands: {
                id: string;
                parentDeviceId: string;
                childDeviceId: string;
                type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device';
                timestamp: string;
                status: 'pending' | 'executing' | 'completed' | 'failed';
                result?: string;
                error?: string;
              }[];
            };
          };
        };
      }>(`/api/trpc/commands.getChildCommands?${params}`);
    },

    updateStatus: async (
      childDeviceId: string,
      commandId: string,
      status: 'pending' | 'executing' | 'completed' | 'failed',
      result?: string,
      error?: string
    ) => {
      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              command: {
                id: string;
                parentDeviceId: string;
                childDeviceId: string;
                type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device';
                timestamp: string;
                status: 'pending' | 'executing' | 'completed' | 'failed';
                result?: string;
                error?: string;
              };
            };
          };
        };
      }>('/api/trpc/commands.updateStatus', {
        method: 'POST',
        body: JSON.stringify({
          json: { childDeviceId, commandId, status, result, error },
        }),
      });
    },

    getParentHistory: async (parentDeviceId: string) => {
      const params = new URLSearchParams({
        input: JSON.stringify({ json: { parentDeviceId } }),
      });

      return apiCall<{
        result: {
          data: {
            json: {
              success: boolean;
              commands: {
                id: string;
                parentDeviceId: string;
                childDeviceId: string;
                type: 'screenshot' | 'start_audio' | 'stop_audio' | 'get_location' | 'lock_device';
                timestamp: string;
                status: 'pending' | 'executing' | 'completed' | 'failed';
                result?: string;
                error?: string;
              }[];
            };
          };
        };
      }>(`/api/trpc/commands.getParentHistory?${params}`);
    },
  },
};

console.log('[API] Client initialized with base URL:', BASE_URL);
