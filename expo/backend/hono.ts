import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { getGlobalStore } from "./trpc/routes/storage";

const app = new Hono();

const allowedExactOrigins = new Set([
  "https://rork-calculator-vault-launcher.vercel.app",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (allowedExactOrigins.has(origin)) return true;

  const normalized = origin.toLowerCase().trim();
  const hostMatch = normalized.match(/^https?:\/\/([^/:?#]+)/);
  const host = hostMatch?.[1];

  if (!host) return false;
  if (host.endsWith(".exp.direct")) return true;
  if (host.endsWith(".exp.host")) return true;
  if (host.endsWith(".vercel.app")) return true;

  return false;
}

app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  const allowOrigin = isAllowedOrigin(origin) ? origin ?? "*" : "null";

  return cors({
    origin: allowOrigin,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-trpc-source",
      "x-trpc-batch-mode",
    ],
    exposeHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 86400,
  })(c, next);
});

const trpcMiddleware = trpcServer({
  router: appRouter,
  createContext,
  onError: ({ error, path }) => {
    console.error(`[tRPC] Error on ${path}:`, error);
  },
});

app.use("/trpc/*", trpcMiddleware);
app.use("/api/trpc/*", trpcMiddleware);

function healthResponse() {
  return {
    status: "ok",
    message: "healthz",
    timestamp: new Date().toISOString(),
  };
}

app.get("/healthz", (c) => c.json(healthResponse()));
app.get("/api/healthz", (c) => c.json(healthResponse()));

app.get("/", (c) => {
  const store = getGlobalStore();
  return c.json({ 
    status: "ok", 
    message: "API is running",
    debug: {
      pairingCodesCount: store.pairingStore.size,
      pairedDevicesCount: Array.from(store.pairedDevicesStore.values()).reduce((sum, devices) => sum + devices.length, 0),
      timestamp: new Date().toISOString(),
    }
  });
});

app.get("/debug/codes", (c) => {
  const store = getGlobalStore();
  const codes = Array.from(store.pairingStore.entries()).map(([code, data]) => ({
    code,
    deviceType: data.deviceType,
    deviceName: data.deviceName,
    expiresAt: new Date(data.expiresAt).toISOString(),
    isExpired: Date.now() > data.expiresAt,
  }));
  return c.json({ codes, total: codes.length });
});

app.get("/debug/devices/:parentId", (c) => {
  const parentId = c.req.param('parentId');
  const store = getGlobalStore();
  const devices = store.pairedDevicesStore.get(parentId) || [];
  return c.json({ parentId, devices, total: devices.length });
});

export default app;
