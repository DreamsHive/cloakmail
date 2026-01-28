import { describe, test, expect } from "bun:test";
import { config } from "../config";

describe("config", () => {
	test("has default smtpPort as a number", () => {
		expect(typeof config.smtpPort).toBe("number");
	});

	test("has default apiPort as a number", () => {
		expect(typeof config.apiPort).toBe("number");
	});

	test("has default redisUrl as a string", () => {
		expect(typeof config.redisUrl).toBe("string");
		expect(config.redisUrl).toContain("redis://");
	});

	test("has default emailTtlSeconds as a number", () => {
		expect(typeof config.emailTtlSeconds).toBe("number");
		expect(config.emailTtlSeconds).toBeGreaterThan(0);
	});

	test("has default domain as a string", () => {
		expect(typeof config.domain).toBe("string");
	});

	test("has default maxEmailSizeMb as a number", () => {
		expect(typeof config.maxEmailSizeMb).toBe("number");
		expect(config.maxEmailSizeMb).toBeGreaterThan(0);
	});
});
