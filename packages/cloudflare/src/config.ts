import type { Env } from "./types";

export interface CloudflareConfig {
  domain: string;
  emailTtlSeconds: number;
  maxEmailSizeMb: number;
}

/**
 * Build the runtime config for the Worker from its bindings.
 *
 * Defaults intentionally match `packages/server/src/config.ts` so the same
 * environment variables produce identical behavior on Docker and Cloudflare.
 */
export function getConfig(env: Env): CloudflareConfig {
  return {
    domain: env.DOMAIN || "localhost",
    emailTtlSeconds: Number(env.EMAIL_TTL_SECONDS) || 86400,
    maxEmailSizeMb: Number(env.MAX_EMAIL_SIZE_MB) || 10,
  };
}
