import { describe, test, expect, beforeAll, beforeEach } from "vitest";
import { env, applyD1Migrations, createExecutionContext } from "cloudflare:test";
import { handleEmail } from "../src/email";

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

beforeAll(async () => {
  await applyD1Migrations(env.DB, MIGRATIONS);
});

beforeEach(async () => {
  await applyD1Migrations(env.DB, MIGRATIONS);
});

/**
 * Build a stream of bytes from a UTF-8 string for the `raw` body of a fake
 * `ForwardableEmailMessage`. The Workers API exposes `raw` as a
 * ReadableStream<Uint8Array>, which is exactly what `new Response(...)` will
 * accept.
 */
function streamFrom(str: string): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(str);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

function makeFakeMessage(opts: {
  to: string;
  from: string;
  raw: string;
}): ForwardableEmailMessage {
  return {
    from: opts.from,
    to: opts.to,
    raw: streamFrom(opts.raw),
    rawSize: opts.raw.length,
    headers: new Headers(),
    setReject: () => {},
    forward: async () => {},
    reply: async () => {},
  } as unknown as ForwardableEmailMessage;
}

const SAMPLE_MIME = [
  "From: Test Sender <sender@example.com>",
  "To: alice@cloakmail.test",
  "Subject: Hello from MIME",
  "Content-Type: text/plain; charset=utf-8",
  "Message-ID: <abc@example.com>",
  "",
  "This is the plain-text body.",
].join("\r\n");

describe("handleEmail", () => {
  test("parses MIME and stores a row in D1", async () => {
    const ctx = createExecutionContext();
    const message = makeFakeMessage({
      to: "alice@cloakmail.test",
      from: "sender@example.com",
      raw: SAMPLE_MIME,
    });

    await handleEmail(message, env, ctx);

    const row = await env.DB.prepare(
      `SELECT * FROM emails WHERE address = ? ORDER BY received_at_ms DESC LIMIT 1`,
    )
      .bind("alice@cloakmail.test")
      .first<any>();

    expect(row).toBeTruthy();
    expect(row.from_addr).toBe("sender@example.com");
    expect(row.subject).toBe("Hello from MIME");
    expect(row.text_body).toContain("plain-text body");
    expect(row.has_r2).toBe(0);
  });

  test("uses envelope address (message.to), not parsed To header", async () => {
    // The envelope says alice@... but the From/To headers in the MIME body
    // claim something different. The store should record the envelope.
    const mismatched = [
      "From: Header-From <header@example.com>",
      "To: header-to@example.com",
      "Subject: Envelope wins",
      "",
      "body",
    ].join("\r\n");

    const ctx = createExecutionContext();
    const message = makeFakeMessage({
      to: "envelope@cloakmail.test",
      from: "envelope-sender@example.com",
      raw: mismatched,
    });
    await handleEmail(message, env, ctx);

    const row = await env.DB.prepare(
      `SELECT address, from_addr FROM emails WHERE subject = ?`,
    )
      .bind("Envelope wins")
      .first<{ address: string; from_addr: string }>();
    expect(row?.address).toBe("envelope@cloakmail.test");
    expect(row?.from_addr).toBe("envelope-sender@example.com");
  });

  test("drops messages flagged as spam (executable attachments)", async () => {
    // Multipart MIME with a .exe attachment.
    const boundary = "===boundary===";
    const mime = [
      "From: bad@example.com",
      "To: target@cloakmail.test",
      "Subject: Spam attempt",
      `Content-Type: multipart/mixed; boundary=${boundary}`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain",
      "",
      "Click here for free stuff",
      `--${boundary}`,
      "Content-Type: application/octet-stream",
      'Content-Disposition: attachment; filename="payload.exe"',
      "Content-Transfer-Encoding: base64",
      "",
      "AAAA",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const ctx = createExecutionContext();
    const message = makeFakeMessage({
      to: "target@cloakmail.test",
      from: "bad@example.com",
      raw: mime,
    });
    await handleEmail(message, env, ctx);

    const row = await env.DB.prepare(
      `SELECT id FROM emails WHERE subject = ?`,
    )
      .bind("Spam attempt")
      .first<{ id: string }>();
    expect(row).toBeNull();
  });
});
