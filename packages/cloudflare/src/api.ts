import { Hono } from "hono";
import type { Env } from "./types";
import {
  deleteEmail,
  deleteInbox,
  getEmail,
  getInbox,
  isHealthy,
} from "./store";

/**
 * Captured at module load (per-isolate) so we can report a Worker uptime
 * that's compatible with the Docker server's `process.uptime()` field.
 * The number resets per cold start, which is the closest analog Workers
 * can offer.
 */
const BOOT_TIME_MS = Date.now();

/**
 * The Hono app exposes the same five routes as the Elysia API in
 * `packages/server/src/api.ts`. Path, method, params, query, and response
 * shapes match 1:1 so the existing OpenAPI types in
 * `packages/web/src/lib/types/api.d.ts` keep working without regeneration.
 */
export function createApiApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

  app.get("/api/inbox/:address", async (c) => {
    const address = c.req.param("address");
    const page = Number(c.req.query("page")) || 1;
    const limit = Math.min(Number(c.req.query("limit")) || 10, 50);
    const result = await getInbox(c.env, address, page, limit);
    return c.json(result);
  });

  app.get("/api/email/:id", async (c) => {
    const id = c.req.param("id");
    const email = await getEmail(c.env, id);
    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }
    return c.json(email);
  });

  app.delete("/api/inbox/:address", async (c) => {
    const address = c.req.param("address");
    const result = await deleteInbox(c.env, address);
    return c.json(result);
  });

  app.delete("/api/email/:id", async (c) => {
    const id = c.req.param("id");
    const result = await deleteEmail(c.env, id);
    return c.json(result);
  });

  app.get("/api/health", async (c) => {
    // Workers don't have a long-lived SMTP server or `process.uptime()`,
    // so we shim those fields:
    //   - smtp: true — having an `email` export means Email Routing is
    //     hooked up; from the wire's perspective that's "SMTP running".
    //   - redis: storage backend (D1 + R2) reachable. Field name preserved
    //     for compatibility with the Docker server's wire format.
    //   - uptime: seconds since this isolate booted.
    const storageOk = await isHealthy(c.env);
    return c.json({
      status: "ok",
      smtp: true,
      redis: storageOk,
      uptime: (Date.now() - BOOT_TIME_MS) / 1000,
    });
  });

  return app;
}

/**
 * A pre-built default instance for `worker.ts` to delegate to. Tests can
 * still call `createApiApp()` directly to get a fresh instance per test.
 */
export const apiApp = createApiApp();
