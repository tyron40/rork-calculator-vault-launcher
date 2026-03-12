import { serve } from '@hono/node-server';
import app from './backend/hono';

const port = Number(process.env.PORT || 3000);

if (!app || typeof app.fetch !== 'function') {
  throw new Error(
    '[Server] Failed to load Hono app. Expected exported app with fetch() in ./backend/hono.ts'
  );
}

console.log(`🚀 Starting Calculator Vault Launcher Backend Server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running at http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
console.log(`🏥 Health check: http://localhost:${port}/health`);
