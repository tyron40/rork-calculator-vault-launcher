import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    console.log('[tRPC] Using EXPO_PUBLIC_RORK_API_BASE_URL:', baseUrl);
    return baseUrl;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('[tRPC] Using window origin:', origin);
    return origin;
  }

  const url = 'http://localhost:8081';
  console.log('[tRPC] Using localhost URL:', url);
  return url;
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch(url, options) {
        console.log('[tRPC] Fetching:', url);
        return fetch(url, options).then(async (res) => {
          if (!res.ok) {
            console.error('[tRPC] Response not OK:', res.status, res.statusText);
            const text = await res.text();
            console.error('[tRPC] Response body:', text.substring(0, 500));
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res;
        });
      },
    }),
  ],
});
