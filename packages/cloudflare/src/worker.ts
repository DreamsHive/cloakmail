import { apiApp } from "./api";
import { handleEmail } from "./email";
import { deleteExpired } from "./store";
import type { Env } from "./types";

/**
 * Cloudflare Worker entry point. Exposes:
 *   - `fetch`: HTTPS handler delegated to the Hono API app
 *   - `email`: inbound MIME handler for Cloudflare Email Routing
 *   - `scheduled`: cron handler that sweeps expired rows from D1+R2
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return apiApp.fetch(request, env, ctx);
  },

  async email(
    message: ForwardableEmailMessage,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    await handleEmail(message, env, ctx);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    // The cron sweep runs daily; let it finish even after the scheduled
    // callback returns so we don't drop work mid-batch.
    ctx.waitUntil(
      (async () => {
        const result = await deleteExpired(env);
        console.log(`[scheduled] swept ${result.deleted} expired rows`);
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
