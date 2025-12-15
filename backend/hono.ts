import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { getGlobalStore } from "./trpc/routes/storage";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

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
