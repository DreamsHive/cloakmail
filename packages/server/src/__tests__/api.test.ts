import { describe, test, expect, beforeAll, afterAll } from "bun:test";

// Check Redis availability before importing modules that connect at load time
let redisAvailable = false;
try {
	const client = new Bun.RedisClient("redis://localhost:6379");
	const pong = await client.ping();
	redisAvailable = pong === "PONG";
} catch {
	redisAvailable = false;
}

const { startAPI } = redisAvailable ? await import("../api") : ({} as any);
const { storeEmail, deleteInbox } = redisAvailable
	? await import("../store")
	: ({} as any);

const TEST_PORT = 9876;
const BASE = `http://localhost:${TEST_PORT}`;
const TEST_ADDRESS = `api-test-${Date.now()}@localhost`;

let app: any;

describe.skipIf(!redisAvailable)("API endpoints", () => {
	beforeAll(async () => {
		app = startAPI(TEST_PORT);
	});

	afterAll(async () => {
		await deleteInbox(TEST_ADDRESS);
		app.stop();
	});

	test("GET /api/health returns status ok", async () => {
		const res = await fetch(`${BASE}/api/health`);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.status).toBe("ok");
		expect(typeof data.smtp).toBe("boolean");
		expect(typeof data.redis).toBe("boolean");
		expect(typeof data.uptime).toBe("number");
	});

	test("GET /api/inbox/:address returns empty inbox", async () => {
		const res = await fetch(`${BASE}/api/inbox/empty-${Date.now()}@localhost`);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.emails).toEqual([]);
		expect(data.pagination.totalEmails).toBe(0);
	});

	test("GET /api/inbox/:address returns emails after storing", async () => {
		await storeEmail({
			to: TEST_ADDRESS,
			from: "test@example.com",
			subject: "API Test",
			text: "Hello",
			html: "<p>Hello</p>",
			headers: {},
		});

		const res = await fetch(`${BASE}/api/inbox/${TEST_ADDRESS}`);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.emails.length).toBeGreaterThanOrEqual(1);
		expect(data.emails[0].subject).toBe("API Test");
		expect(data.pagination.totalEmails).toBeGreaterThanOrEqual(1);
	});

	test("GET /api/inbox/:address respects pagination params", async () => {
		const res = await fetch(`${BASE}/api/inbox/${TEST_ADDRESS}?page=1&limit=1`);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.emails.length).toBeLessThanOrEqual(1);
		expect(data.pagination.limit).toBe(1);
	});

	test("GET /api/email/:id returns a stored email", async () => {
		const id = await storeEmail({
			to: TEST_ADDRESS,
			from: "sender@example.com",
			subject: "Single Email Test",
			text: "body",
			html: "",
			headers: {},
		});

		const res = await fetch(`${BASE}/api/email/${id}`);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.id).toBe(id);
		expect(data.subject).toBe("Single Email Test");
	});

	test("GET /api/email/:id returns 404 for unknown ID", async () => {
		const res = await fetch(`${BASE}/api/email/nonexistent-id`);
		expect(res.status).toBe(404);

		const data = await res.json();
		expect(data.error).toBeTruthy();
	});

	test("DELETE /api/email/:id deletes an email", async () => {
		const id = await storeEmail({
			to: TEST_ADDRESS,
			from: "sender@example.com",
			subject: "To Delete",
			text: "",
			html: "",
			headers: {},
		});

		const res = await fetch(`${BASE}/api/email/${id}`, { method: "DELETE" });
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.deleted).toBe(true);

		const check = await fetch(`${BASE}/api/email/${id}`);
		expect(check.status).toBe(404);
	});

	test("DELETE /api/inbox/:address deletes all emails", async () => {
		const address = `delete-api-${Date.now()}@localhost`;
		await storeEmail({
			to: address,
			from: "sender@example.com",
			subject: "Bulk Delete",
			text: "",
			html: "",
			headers: {},
		});

		const res = await fetch(`${BASE}/api/inbox/${address}`, { method: "DELETE" });
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.deleted).toBeGreaterThanOrEqual(1);
	});
});
