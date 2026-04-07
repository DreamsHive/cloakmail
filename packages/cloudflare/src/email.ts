import PostalMime from "postal-mime";
import type { Env, InboundEmail } from "./types";
import { isSpam } from "./spam";
import { storeEmail } from "./store";

/**
 * Cloudflare Email Routing entrypoint. Configured via `wrangler.toml` and
 * the catch-all rule provisioned by `cloakmail-cli setup`. Reads the raw
 * MIME body off the inbound message, runs the spam filter, and persists
 * the result via the D1+R2 store.
 */
export async function handleEmail(
  message: ForwardableEmailMessage,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  // Read the raw stream into a buffer for postal-mime to parse.
  const rawArrayBuffer = await new Response(message.raw).arrayBuffer();
  const rawBytes = new Uint8Array(rawArrayBuffer);

  let parsed: any;
  try {
    parsed = await PostalMime.parse(rawBytes);
  } catch (err) {
    console.error("[email] failed to parse MIME:", err);
    return;
  }

  // Spam gate: drop executable attachments etc. We do this before storage
  // so spam never lands in D1.
  const spam = await isSpam(parsed);
  if (spam.isSpam) {
    console.log(`[email] dropped spam from ${message.from}: ${spam.reason}`);
    return;
  }

  // Use the SMTP envelope (`message.to` / `message.from`) as the source of
  // truth for the address pair. `parsed.to` / `parsed.from` come from
  // user-controlled headers and can be spoofed or missing entirely.
  const inbound: InboundEmail = {
    to: message.to,
    from: message.from,
    subject: typeof parsed.subject === "string" ? parsed.subject : "",
    text: typeof parsed.text === "string" ? parsed.text : "",
    html: typeof parsed.html === "string" ? parsed.html : "",
    headers: headersFromParsed(parsed),
  };

  await storeEmail(env, inbound);
}

/**
 * Flatten postal-mime's parsed header list into a plain `Record<string,string>`
 * so the wire shape matches what mailparser produces in `packages/server`.
 * Repeated headers are joined with `, ` (the same convention as Node's
 * built-in HTTP header collapsing) so we never lose information.
 */
function headersFromParsed(parsed: any): Record<string, string> {
  const out: Record<string, string> = {};
  const list = Array.isArray(parsed?.headers) ? parsed.headers : [];
  for (const h of list) {
    if (!h || typeof h.key !== "string") continue;
    const key = h.key.toLowerCase();
    const value = typeof h.value === "string" ? h.value : String(h.value ?? "");
    if (out[key]) {
      out[key] = `${out[key]}, ${value}`;
    } else {
      out[key] = value;
    }
  }
  return out;
}
