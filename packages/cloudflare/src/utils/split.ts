import type { InboundEmail } from "../types";

/**
 * Bytes (well, characters) above which we spill the body into R2 instead of
 * keeping it inline in D1. ~95% of temp emails are well below this so the
 * inline path is the hot path.
 */
export const INLINE_THRESHOLD = 100_000;

/**
 * Decide whether the email body should spill out to R2 instead of being
 * stored inline in D1. Pure function so the decision is testable in
 * isolation from the store.
 */
export function shouldSpillToR2(email: InboundEmail): boolean {
  const text = email.text || "";
  const html = email.html || "";
  const headers = email.headers || {};
  return text.length + html.length + JSON.stringify(headers).length > INLINE_THRESHOLD;
}
