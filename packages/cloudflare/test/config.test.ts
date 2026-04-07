import { describe, test, expect } from "vitest";
import { getConfig } from "../src/config";
import type { Env } from "../src/types";

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: {} as D1Database,
    R2: {} as R2Bucket,
    DOMAIN: "example.com",
    EMAIL_TTL_SECONDS: "86400",
    MAX_EMAIL_SIZE_MB: "10",
    ...overrides,
  };
}

describe("getConfig", () => {
  test("returns domain from env", () => {
    const cfg = getConfig(makeEnv({ DOMAIN: "cloak.example.com" }));
    expect(cfg.domain).toBe("cloak.example.com");
  });

  test("falls back to localhost when DOMAIN is empty", () => {
    const cfg = getConfig(makeEnv({ DOMAIN: "" }));
    expect(cfg.domain).toBe("localhost");
  });

  test("parses emailTtlSeconds as a number", () => {
    const cfg = getConfig(makeEnv({ EMAIL_TTL_SECONDS: "3600" }));
    expect(typeof cfg.emailTtlSeconds).toBe("number");
    expect(cfg.emailTtlSeconds).toBe(3600);
  });

  test("falls back to 86400 when EMAIL_TTL_SECONDS missing or invalid", () => {
    expect(getConfig(makeEnv({ EMAIL_TTL_SECONDS: "" })).emailTtlSeconds).toBe(86400);
    expect(getConfig(makeEnv({ EMAIL_TTL_SECONDS: "not-a-number" })).emailTtlSeconds).toBe(86400);
  });

  test("parses maxEmailSizeMb as a number", () => {
    const cfg = getConfig(makeEnv({ MAX_EMAIL_SIZE_MB: "25" }));
    expect(typeof cfg.maxEmailSizeMb).toBe("number");
    expect(cfg.maxEmailSizeMb).toBe(25);
  });

  test("falls back to 10 when MAX_EMAIL_SIZE_MB missing or invalid", () => {
    expect(getConfig(makeEnv({ MAX_EMAIL_SIZE_MB: "" })).maxEmailSizeMb).toBe(10);
    expect(getConfig(makeEnv({ MAX_EMAIL_SIZE_MB: "junk" })).maxEmailSizeMb).toBe(10);
  });
});
