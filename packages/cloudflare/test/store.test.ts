import { describe, test, expect, beforeAll, beforeEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import {
  storeEmail,
  getInbox,
  getEmail,
  deleteInbox,
  deleteEmail,
  deleteExpired,
  isHealthy,
} from "../src/store";
import type { InboundEmail } from "../src/types";
import { INLINE_THRESHOLD } from "../src/utils/split";

const MIGRATIONS = [
  {
    name: "0001_init",
    queries: [
      `CREATE TABLE IF NOT EXISTS emails (
        id              TEXT PRIMARY KEY,
        address         TEXT NOT NULL,
        from_addr       TEXT NOT NULL,
        subject         TEXT NOT NULL,
        text_body       TEXT NOT NULL DEFAULT '',
        html_body       TEXT NOT NULL DEFAULT '',
        text_preview    TEXT NOT NULL DEFAULT '',
        html_preview    TEXT NOT NULL DEFAULT '',
        headers_json    TEXT NOT NULL DEFAULT '{}',
        received_at_ms  INTEGER NOT NULL,
        received_at_iso TEXT NOT NULL,
        expires_at_ms   INTEGER NOT NULL,
        has_r2          INTEGER NOT NULL DEFAULT 0,
        r2_key          TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS idx_emails_address_received ON emails(address, received_at_ms DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_emails_expires ON emails(expires_at_ms)`,
    ],
  },
];

function makeEmail(overrides: Partial<InboundEmail> = {}): InboundEmail {
  return {
    to: "user@example.com",
    from: "sender@example.com",
    subject: "Test Subject",
    text: "Test body",
    html: "<p>Test body</p>",
    headers: { "x-test": "true" },
    ...overrides,
  };
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, MIGRATIONS);
});

beforeEach(async () => {
  // isolatedStorage rolls back D1+R2 between tests, but we still need
  // the migrated schema to exist on each fresh storage instance.
  await applyD1Migrations(env.DB, MIGRATIONS);
});

describe("store: storeEmail (inline path)", () => {
  test("returns a 20-character ID", async () => {
    const id = await storeEmail(env, makeEmail());
    expect(typeof id).toBe("string");
    expect(id).toHaveLength(20);
  });

  test("persists row in D1 with has_r2 = 0", async () => {
    const id = await storeEmail(env, makeEmail({ subject: "Inline Path" }));
    const row = await env.DB.prepare(`SELECT * FROM emails WHERE id = ?`)
      .bind(id)
      .first<any>();
    expect(row).toBeTruthy();
    expect(row.has_r2).toBe(0);
    expect(row.r2_key).toBeNull();
    expect(row.text_body).toBe("Test body");
    expect(row.html_body).toBe("<p>Test body</p>");
  });

  test("normalizes address to lowercase on write", async () => {
    const id = await storeEmail(env, makeEmail({ to: "MixedCase@EXAMPLE.com" }));
    const row = await env.DB.prepare(`SELECT address FROM emails WHERE id = ?`)
      .bind(id)
      .first<{ address: string }>();
    expect(row?.address).toBe("mixedcase@example.com");
  });
});

describe("store: storeEmail (spill path)", () => {
  test("spills oversized bodies to R2", async () => {
    const text = "x".repeat(INLINE_THRESHOLD + 10);
    const html = "<p>" + "y".repeat(INLINE_THRESHOLD) + "</p>";
    const id = await storeEmail(env, makeEmail({ text, html }));

    const row = await env.DB.prepare(`SELECT * FROM emails WHERE id = ?`)
      .bind(id)
      .first<any>();
    expect(row.has_r2).toBe(1);
    expect(row.r2_key).toBe(`bodies/${id}.json`);
    // Inline columns are empty when spilled
    expect(row.text_body).toBe("");
    expect(row.html_body).toBe("");
    // Previews populated
    expect(row.text_preview.length).toBe(512);
    expect(row.html_preview.length).toBe(1024);

    // R2 object exists with the full body
    const obj = await env.R2.get(`bodies/${id}.json`);
    expect(obj).toBeTruthy();
    const body = (await obj!.json()) as { text: string; html: string };
    expect(body.text).toBe(text);
    expect(body.html).toBe(html);
  });
});

describe("store: getEmail", () => {
  test("returns null for unknown id", async () => {
    const result = await getEmail(env, "does-not-exist");
    expect(result).toBeNull();
  });

  test("hydrates inline emails", async () => {
    const id = await storeEmail(
      env,
      makeEmail({ subject: "Hydrate Inline", text: "abc", html: "<p>abc</p>" }),
    );
    const stored = await getEmail(env, id);
    expect(stored).not.toBeNull();
    expect(stored!.id).toBe(id);
    expect(stored!.subject).toBe("Hydrate Inline");
    expect(stored!.text).toBe("abc");
    expect(stored!.html).toBe("<p>abc</p>");
    expect(stored!.headers).toEqual({ "x-test": "true" });
    expect(stored!.receivedAt).toBeTruthy();
  });

  test("hydrates spilled emails from R2", async () => {
    const text = "z".repeat(INLINE_THRESHOLD + 100);
    const id = await storeEmail(env, makeEmail({ text, html: "" }));
    const stored = await getEmail(env, id);
    expect(stored).not.toBeNull();
    expect(stored!.text).toBe(text);
  });

  test("returns null for expired emails", async () => {
    const id = await storeEmail(env, makeEmail());
    // Force expire the row
    await env.DB.prepare(`UPDATE emails SET expires_at_ms = ? WHERE id = ?`)
      .bind(Date.now() - 1000, id)
      .run();
    const result = await getEmail(env, id);
    expect(result).toBeNull();
  });
});

describe("store: getInbox", () => {
  test("returns empty for unknown address", async () => {
    const result = await getInbox(env, "noone@example.com");
    expect(result.emails).toHaveLength(0);
    expect(result.pagination.totalEmails).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasMore).toBe(false);
  });

  test("paginates by received_at desc", async () => {
    const address = "paginate@example.com";
    for (let i = 0; i < 3; i++) {
      await storeEmail(env, makeEmail({ to: address, subject: `Email ${i}` }));
      // Force monotonic timestamps so the sort is deterministic
      await env.DB.prepare(`UPDATE emails SET received_at_ms = ? WHERE subject = ?`)
        .bind(1_000_000 + i, `Email ${i}`)
        .run();
    }

    const page1 = await getInbox(env, address, 1, 2);
    expect(page1.emails).toHaveLength(2);
    expect(page1.pagination.totalEmails).toBe(3);
    expect(page1.pagination.totalPages).toBe(2);
    expect(page1.pagination.hasMore).toBe(true);
    expect(page1.emails[0].subject).toBe("Email 2");
    expect(page1.emails[1].subject).toBe("Email 1");

    const page2 = await getInbox(env, address, 2, 2);
    expect(page2.emails).toHaveLength(1);
    expect(page2.pagination.hasMore).toBe(false);
    expect(page2.emails[0].subject).toBe("Email 0");
  });

  test("filters expired rows out of inbox listing", async () => {
    const address = "expiry@example.com";
    const idLive = await storeEmail(env, makeEmail({ to: address, subject: "Live" }));
    const idExpired = await storeEmail(env, makeEmail({ to: address, subject: "Expired" }));
    await env.DB.prepare(`UPDATE emails SET expires_at_ms = ? WHERE id = ?`)
      .bind(Date.now() - 1, idExpired)
      .run();

    const result = await getInbox(env, address);
    expect(result.emails).toHaveLength(1);
    expect(result.emails[0].id).toBe(idLive);
    expect(result.pagination.totalEmails).toBe(1);
  });

  test("address lookup is case-insensitive", async () => {
    const id = await storeEmail(env, makeEmail({ to: "Casey@Example.com" }));
    const result = await getInbox(env, "casey@example.com");
    expect(result.emails.map((e) => e.id)).toContain(id);
  });
});

describe("store: deleteEmail", () => {
  test("deletes inline rows", async () => {
    const id = await storeEmail(env, makeEmail({ subject: "Delete me" }));
    const result = await deleteEmail(env, id);
    expect(result.deleted).toBe(true);
    expect(await getEmail(env, id)).toBeNull();
  });

  test("deletes spilled rows + R2 object", async () => {
    const text = "w".repeat(INLINE_THRESHOLD + 1);
    const id = await storeEmail(env, makeEmail({ text }));
    const key = `bodies/${id}.json`;
    expect(await env.R2.head(key)).toBeTruthy();

    await deleteEmail(env, id);
    expect(await env.R2.head(key)).toBeNull();
  });

  test("returns false for unknown id", async () => {
    const result = await deleteEmail(env, "no-such-id");
    expect(result.deleted).toBe(false);
  });
});

describe("store: deleteInbox", () => {
  test("removes every email for an address", async () => {
    const address = "delete-bulk@example.com";
    await storeEmail(env, makeEmail({ to: address, subject: "A" }));
    await storeEmail(env, makeEmail({ to: address, subject: "B" }));
    await storeEmail(env, makeEmail({ to: address, subject: "C" }));

    const result = await deleteInbox(env, address);
    expect(result.deleted).toBe(3);

    const inbox = await getInbox(env, address);
    expect(inbox.emails).toHaveLength(0);
  });

  test("removes spilled R2 objects too", async () => {
    const address = "delete-spilled@example.com";
    const text = "v".repeat(INLINE_THRESHOLD + 1);
    const id = await storeEmail(env, makeEmail({ to: address, text }));
    const key = `bodies/${id}.json`;
    expect(await env.R2.head(key)).toBeTruthy();

    await deleteInbox(env, address);
    expect(await env.R2.head(key)).toBeNull();
  });

  test("returns 0 for an empty inbox", async () => {
    const result = await deleteInbox(env, "ghost@example.com");
    expect(result.deleted).toBe(0);
  });
});

describe("store: deleteExpired (cron sweep)", () => {
  test("sweeps expired rows but leaves live ones", async () => {
    const address = "sweep@example.com";
    const idLive = await storeEmail(env, makeEmail({ to: address, subject: "Live" }));
    const idDead = await storeEmail(env, makeEmail({ to: address, subject: "Dead" }));
    await env.DB.prepare(`UPDATE emails SET expires_at_ms = ? WHERE id = ?`)
      .bind(Date.now() - 1, idDead)
      .run();

    const result = await deleteExpired(env);
    expect(result.deleted).toBe(1);

    // Live row still exists
    const row = await env.DB.prepare(`SELECT id FROM emails WHERE id = ?`)
      .bind(idLive)
      .first<{ id: string }>();
    expect(row?.id).toBe(idLive);

    // Dead row gone
    const dead = await env.DB.prepare(`SELECT id FROM emails WHERE id = ?`)
      .bind(idDead)
      .first<{ id: string }>();
    expect(dead).toBeNull();
  });

  test("cleans up R2 objects of spilled expired rows", async () => {
    const text = "u".repeat(INLINE_THRESHOLD + 1);
    const id = await storeEmail(env, makeEmail({ text }));
    const key = `bodies/${id}.json`;
    expect(await env.R2.head(key)).toBeTruthy();

    await env.DB.prepare(`UPDATE emails SET expires_at_ms = ? WHERE id = ?`)
      .bind(Date.now() - 1, id)
      .run();
    await deleteExpired(env);
    expect(await env.R2.head(key)).toBeNull();
  });

  test("is a no-op when nothing has expired", async () => {
    await storeEmail(env, makeEmail());
    const result = await deleteExpired(env);
    expect(result.deleted).toBe(0);
  });
});

describe("store: isHealthy", () => {
  test("returns true with working bindings", async () => {
    const ok = await isHealthy(env);
    expect(ok).toBe(true);
  });
});
