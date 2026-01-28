import { describe, test, expect } from "bun:test";
import { isSpam } from "../spam";

describe("isSpam", () => {
	test("rejects emails with .exe attachments", async () => {
		const parsed = {
			attachments: [{ filename: "malware.exe" }],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(true);
		expect(result.reason).toContain("executable");
	});

	test("rejects emails with .bat attachments", async () => {
		const parsed = {
			attachments: [{ filename: "script.bat" }],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(true);
	});

	test("rejects emails with .ps1 attachments", async () => {
		const parsed = {
			attachments: [{ filename: "payload.ps1" }],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(true);
	});

	test("rejects case-insensitive executable extensions", async () => {
		const parsed = {
			attachments: [{ filename: "VIRUS.EXE" }],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(true);
	});

	test("allows emails without attachments", async () => {
		const parsed = {
			attachments: [],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(false);
		expect(result.reason).toBeNull();
	});

	test("allows emails with safe attachments", async () => {
		const parsed = {
			attachments: [
				{ filename: "document.pdf" },
				{ filename: "photo.png" },
			],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(false);
	});

	test("handles missing attachments field", async () => {
		const parsed = {};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(false);
	});

	test("handles missing filename on attachment", async () => {
		const parsed = {
			attachments: [{}],
		};
		const result = await isSpam(parsed);
		expect(result.isSpam).toBe(false);
	});
});
