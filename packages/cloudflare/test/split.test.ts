import { describe, test, expect } from "vitest";
import { INLINE_THRESHOLD, shouldSpillToR2 } from "../src/utils/split";
import type { InboundEmail } from "../src/types";

function makeEmail(overrides: Partial<InboundEmail> = {}): InboundEmail {
  return {
    to: "to@example.com",
    from: "from@example.com",
    subject: "subject",
    text: "",
    html: "",
    headers: {},
    ...overrides,
  };
}

describe("shouldSpillToR2", () => {
  test("INLINE_THRESHOLD is 100k characters", () => {
    expect(INLINE_THRESHOLD).toBe(100_000);
  });

  test("returns false for tiny emails", () => {
    expect(shouldSpillToR2(makeEmail({ text: "hello", html: "<p>hi</p>" }))).toBe(false);
  });

  test("returns false at threshold boundary", () => {
    const text = "a".repeat(50_000);
    const html = "b".repeat(40_000);
    // headers add ~2 chars for "{}"
    expect(shouldSpillToR2(makeEmail({ text, html }))).toBe(false);
  });

  test("returns true when text alone exceeds threshold", () => {
    const text = "a".repeat(INLINE_THRESHOLD + 1);
    expect(shouldSpillToR2(makeEmail({ text }))).toBe(true);
  });

  test("returns true when html alone exceeds threshold", () => {
    const html = "b".repeat(INLINE_THRESHOLD + 1);
    expect(shouldSpillToR2(makeEmail({ html }))).toBe(true);
  });

  test("returns true when text + html together exceed threshold", () => {
    const text = "a".repeat(60_000);
    const html = "b".repeat(60_000);
    expect(shouldSpillToR2(makeEmail({ text, html }))).toBe(true);
  });

  test("counts header JSON length toward the threshold", () => {
    const headers: Record<string, string> = {};
    for (let i = 0; i < 2000; i++) {
      headers[`x-header-${i}`] = "x".repeat(60);
    }
    expect(shouldSpillToR2(makeEmail({ headers }))).toBe(true);
  });

  test("handles missing fields safely", () => {
    expect(
      shouldSpillToR2({
        to: "a@b.c",
        from: "c@d.e",
        subject: "",
        text: undefined as unknown as string,
        html: undefined as unknown as string,
        headers: undefined as unknown as Record<string, string>,
      }),
    ).toBe(false);
  });
});
