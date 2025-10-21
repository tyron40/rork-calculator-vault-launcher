import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

const url = `${getBaseUrl()}/api/trpc`;

export const trpcReactClient = trpc.createClient({
  links: [
    httpBatchLink({
      url,
      transformer: superjson,
      headers: () => ({
        'Content-Type': 'application/json',
      }),
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url,
      transformer: superjson,
      headers: () => ({
        'Content-Type': 'application/json',
      }),
    }),
  ],
});
