CREATE TABLE IF NOT EXISTS emails (
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
);
CREATE INDEX IF NOT EXISTS idx_emails_address_received ON emails(address, received_at_ms DESC);
CREATE INDEX IF NOT EXISTS idx_emails_expires ON emails(expires_at_ms);
