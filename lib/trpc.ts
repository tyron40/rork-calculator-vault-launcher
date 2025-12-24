import { createTRPCReact } from "@trpc/react-query";
import { httpLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

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

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        return fetch(url, {
          ...options,
          signal: options?.signal || controller.signal,
        }).catch((error) => {
          if (error.name === 'AbortError') {
            console.log('[tRPC] Request timeout or aborted');
            throw error;
          }
          console.error('[tRPC] Fetch error:', error);
          throw error;
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      },
    }),
  ],
});

console.log('[tRPC] Client initialized with base URL:', getBaseUrl());
