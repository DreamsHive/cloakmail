/**
 * Generate a 20-character ID for an email row.
 *
 * Same format as `packages/server/src/store.ts:8` so server-stored and
 * Cloudflare-stored email IDs are indistinguishable.
 */
export function newEmailId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
