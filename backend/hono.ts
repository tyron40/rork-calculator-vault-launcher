import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

app.get("/", (c) => {
  console.log('[Backend] Health check');
  return c.json({ status: "ok", message: "API is running", timestamp: new Date().toISOString() });
});

app.onError((err, c) => {
  console.error('[Backend] Unhandled error:', err);
  return c.json({ error: err.message }, 500);
});

export default app;
