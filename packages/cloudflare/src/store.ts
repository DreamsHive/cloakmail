import type { Env, InboundEmail, InboxResponse, StoredEmail } from "./types";
import { getConfig } from "./config";
import { newEmailId } from "./utils/id";
import { shouldSpillToR2 } from "./utils/split";

/**
 * Maximum lengths of the inline previews kept in D1 when the body is spilled
 * to R2. Reads of the inbox listing return these previews so we never have to
 * round-trip to R2 just to render the inbox.
 */
const TEXT_PREVIEW_LIMIT = 512;
const HTML_PREVIEW_LIMIT = 1024;

/**
 * R2 key for the spilled body of an email.
 *
 * Body objects live under `bodies/{id}.json` and are deleted alongside the
 * row in `deleteEmail`, `deleteInbox`, and the cron `deleteExpired` sweep.
 */
function bodyKey(id: string): string {
  return `bodies/${id}.json`;
}

/**
 * Address normalization on the WRITE path: D1 stores everything lowercased
 * so the indexes are predictable. Reads also lowercase so a user looking at
 * `Foo@Bar.com` sees the same inbox as `foo@bar.com`.
 */
function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

interface EmailRow {
  id: string;
  address: string;
  from_addr: string;
  subject: string;
  text_body: string;
  html_body: string;
  text_preview: string;
  html_preview: string;
  headers_json: string;
  received_at_ms: number;
  received_at_iso: string;
  expires_at_ms: number;
  has_r2: number;
  r2_key: string | null;
}

/**
 * Hydrate a `StoredEmail` from a D1 row, fetching the spilled body from R2
 * when needed. R2 fetches are skipped when the caller only wants the inbox
 * preview shape (we still return the previews as `text`/`html` so the wire
 * format stays compatible with the existing OpenAPI types).
 */
async function rowToStoredEmail(
  row: EmailRow,
  env: Env,
  hydrate: boolean,
): Promise<StoredEmail> {
  let text = row.text_body || "";
  let html = row.html_body || "";

  if (row.has_r2 === 1 && row.r2_key) {
    if (hydrate) {
      const obj = await env.R2.get(row.r2_key);
      if (obj) {
        try {
          const body = (await obj.json()) as { text?: string; html?: string };
          text = body.text ?? "";
          html = body.html ?? "";
        } catch {
          // Fall back to the inline previews if the R2 object is corrupt.
          text = row.text_preview || "";
          html = row.html_preview || "";
        }
      } else {
        text = row.text_preview || "";
        html = row.html_preview || "";
      }
    } else {
      text = row.text_preview || "";
      html = row.html_preview || "";
    }
  }

  let headers: Record<string, string> = {};
  try {
    headers = JSON.parse(row.headers_json || "{}");
  } catch {
    headers = {};
  }

  return {
    id: row.id,
    to: row.address,
    from: row.from_addr,
    subject: row.subject,
    text,
    html,
    headers,
    receivedAt: row.received_at_iso,
  };
}

/**
 * Persist an inbound email. Hot path: <100KB → single D1 INSERT, no R2 write.
 * Spill path: D1 INSERT (with previews) + 1 R2 PUT.
 */
export async function storeEmail(env: Env, email: InboundEmail): Promise<string> {
  const cfg = getConfig(env);
  const id = newEmailId();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expiresAtMs = nowMs + cfg.emailTtlSeconds * 1000;
  const address = normalizeAddress(email.to);
  const headersJson = JSON.stringify(email.headers || {});
  const text = email.text || "";
  const html = email.html || "";

  const spill = shouldSpillToR2({
    to: email.to,
    from: email.from,
    subject: email.subject,
    text,
    html,
    headers: email.headers || {},
  });

  if (spill) {
    const key = bodyKey(id);
    const payload = JSON.stringify({ text, html });
    await env.R2.put(key, payload, {
      httpMetadata: { contentType: "application/json" },
    });
    await env.DB.prepare(
      `INSERT INTO emails (
        id, address, from_addr, subject,
        text_body, html_body, text_preview, html_preview,
        headers_json, received_at_ms, received_at_iso, expires_at_ms,
        has_r2, r2_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        address,
        email.from,
        email.subject,
        "",
        "",
        text.slice(0, TEXT_PREVIEW_LIMIT),
        html.slice(0, HTML_PREVIEW_LIMIT),
        headersJson,
        nowMs,
        nowIso,
        expiresAtMs,
        1,
        key,
      )
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO emails (
        id, address, from_addr, subject,
        text_body, html_body, text_preview, html_preview,
        headers_json, received_at_ms, received_at_iso, expires_at_ms,
        has_r2, r2_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        address,
        email.from,
        email.subject,
        text,
        html,
        "",
        "",
        headersJson,
        nowMs,
        nowIso,
        expiresAtMs,
        0,
        null,
      )
      .run();
  }

  return id;
}

/**
 * Paginated inbox listing. Filters out expired rows so users never see
 * mail that the cron sweep is about to remove.
 */
export async function getInbox(
  env: Env,
  address: string,
  page = 1,
  limit = 10,
): Promise<InboxResponse> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const normalized = normalizeAddress(address);
  const offset = (safePage - 1) * safeLimit;
  const nowMs = Date.now();

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM emails WHERE address = ? AND expires_at_ms > ?`,
  )
    .bind(normalized, nowMs)
    .first<{ c: number }>();
  const total = totalRow?.c ?? 0;

  const rowsResult = await env.DB.prepare(
    `SELECT * FROM emails
     WHERE address = ? AND expires_at_ms > ?
     ORDER BY received_at_ms DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(normalized, nowMs, safeLimit, offset)
    .all<EmailRow>();

  const rows = rowsResult.results ?? [];
  const emails: StoredEmail[] = [];
  for (const row of rows) {
    emails.push(await rowToStoredEmail(row, env, false));
  }

  return {
    emails,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalEmails: total,
      totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
      hasMore: safePage * safeLimit < total,
    },
  };
}

/**
 * Fetch a single email by ID. Hydrates the body from R2 if it spilled.
 * Returns null for unknown or expired rows.
 */
export async function getEmail(env: Env, id: string): Promise<StoredEmail | null> {
  const nowMs = Date.now();
  const row = await env.DB.prepare(
    `SELECT * FROM emails WHERE id = ? AND expires_at_ms > ?`,
  )
    .bind(id, nowMs)
    .first<EmailRow>();
  if (!row) return null;
  return rowToStoredEmail(row, env, true);
}

/**
 * Delete every email for an address. Returns the number of D1 rows removed
 * (matches the server contract). R2 spilled bodies are deleted alongside.
 */
export async function deleteInbox(
  env: Env,
  address: string,
): Promise<{ deleted: number }> {
  const normalized = normalizeAddress(address);
  const rowsResult = await env.DB.prepare(
    `SELECT id, r2_key, has_r2 FROM emails WHERE address = ?`,
  )
    .bind(normalized)
    .all<{ id: string; r2_key: string | null; has_r2: number }>();

  const rows = rowsResult.results ?? [];
  if (rows.length === 0) return { deleted: 0 };

  const r2Keys = rows
    .filter((r) => r.has_r2 === 1 && r.r2_key)
    .map((r) => r.r2_key as string);
  if (r2Keys.length > 0) {
    await env.R2.delete(r2Keys);
  }

  await env.DB.prepare(`DELETE FROM emails WHERE address = ?`)
    .bind(normalized)
    .run();

  return { deleted: rows.length };
}

/**
 * Delete a single email. Returns `{ deleted: false }` for unknown IDs to
 * match the server contract.
 */
export async function deleteEmail(
  env: Env,
  id: string,
): Promise<{ deleted: boolean }> {
  const row = await env.DB.prepare(
    `SELECT id, r2_key, has_r2 FROM emails WHERE id = ?`,
  )
    .bind(id)
    .first<{ id: string; r2_key: string | null; has_r2: number }>();
  if (!row) return { deleted: false };

  if (row.has_r2 === 1 && row.r2_key) {
    await env.R2.delete(row.r2_key);
  }
  await env.DB.prepare(`DELETE FROM emails WHERE id = ?`).bind(id).run();
  return { deleted: true };
}

/**
 * Cron sweep: drop every expired row plus its R2 body. Idempotent.
 */
export async function deleteExpired(env: Env): Promise<{ deleted: number }> {
  const nowMs = Date.now();
  const rowsResult = await env.DB.prepare(
    `SELECT id, r2_key, has_r2 FROM emails WHERE expires_at_ms <= ?`,
  )
    .bind(nowMs)
    .all<{ id: string; r2_key: string | null; has_r2: number }>();

  const rows = rowsResult.results ?? [];
  if (rows.length === 0) return { deleted: 0 };

  const r2Keys = rows
    .filter((r) => r.has_r2 === 1 && r.r2_key)
    .map((r) => r.r2_key as string);
  if (r2Keys.length > 0) {
    await env.R2.delete(r2Keys);
  }

  await env.DB.prepare(`DELETE FROM emails WHERE expires_at_ms <= ?`)
    .bind(nowMs)
    .run();

  return { deleted: rows.length };
}

/**
 * Health check used by `/api/health`. Verifies that both D1 and R2 are
 * reachable; the API uses this to populate the `redis` boolean in the
 * health response (the field name is preserved for wire compatibility
 * with the Docker server even though there is no Redis here).
 */
export async function isHealthy(env: Env): Promise<boolean> {
  try {
    await env.DB.prepare(`SELECT 1`).first();
    await env.R2.head("__healthcheck__");
    return true;
  } catch {
    return false;
  }
}
