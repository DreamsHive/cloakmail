import { describe, test, expect, afterAll, afterEach } from "bun:test";
import type { InboundEmail } from "../types";

// Check Redis availability before importing store (which connects at module level)
let redisAvailable = false;
try {
	const client = new Bun.RedisClient("redis://localhost:6379");
	const pong = await client.ping();
	redisAvailable = pong === "PONG";
} catch {
	redisAvailable = false;
}

const {
	storeEmail,
	getInbox,
	getEmail,
	deleteInbox,
	deleteEmail,
} = redisAvailable
	? await import("../store")
	: ({} as any);

const TEST_ADDRESS = `test-${Date.now()}@localhost`;

function makeEmail(overrides?: Partial<InboundEmail>): InboundEmail {
	return {
		to: TEST_ADDRESS,
		from: "sender@example.com",
		subject: "Test Subject",
		text: "Test body",
		html: "<p>Test body</p>",
		headers: { "x-test": "true" },
		...overrides,
	};
}

const storedIds: string[] = [];

describe.skipIf(!redisAvailable)("store", () => {
	afterEach(async () => {
		for (const id of storedIds) {
			await deleteEmail(id);
		}
		storedIds.length = 0;
	});

	afterAll(async () => {
		await deleteInbox(TEST_ADDRESS);
	});

	test("isRedisHealthy returns true when connected", async () => {
		const healthy = await isRedisHealthy();
		expect(healthy).toBe(true);
	});

	test("storeEmail stores and returns an ID", async () => {
		const id = await storeEmail(makeEmail());
		storedIds.push(id);
		expect(typeof id).toBe("string");
		expect(id.length).toBeGreaterThan(0);
	});

	test("getEmail retrieves a stored email", async () => {
		const id = await storeEmail(makeEmail({ subject: "Retrieve Test" }));
		storedIds.push(id);

		const email = await getEmail(id);
		expect(email).not.toBeNull();
		expect(email!.id).toBe(id);
		expect(email!.subject).toBe("Retrieve Test");
		expect(email!.to).toBe(TEST_ADDRESS);
		expect(email!.from).toBe("sender@example.com");
		expect(email!.headers).toEqual({ "x-test": "true" });
		expect(email!.receivedAt).toBeTruthy();
	});

	test("getEmail returns null for unknown ID", async () => {
		const email = await getEmail("nonexistent-id-12345");
		expect(email).toBeNull();
	});

	test("getInbox retrieves emails with pagination", async () => {
		const address = `inbox-test-${Date.now()}@localhost`;
		const ids: string[] = [];

		for (let i = 0; i < 3; i++) {
			const id = await storeEmail(makeEmail({ to: address, subject: `Email ${i}` }));
			ids.push(id);
		}

		const result = await getInbox(address, 1, 2);
		expect(result.emails).toHaveLength(2);
		expect(result.pagination.totalEmails).toBe(3);
		expect(result.pagination.totalPages).toBe(2);
		expect(result.pagination.hasMore).toBe(true);
		expect(result.pagination.page).toBe(1);
		expect(result.pagination.limit).toBe(2);

		// Page 2
		const page2 = await getInbox(address, 2, 2);
		expect(page2.emails).toHaveLength(1);
		expect(page2.pagination.hasMore).toBe(false);

		// Cleanup
		for (const id of ids) {
			await deleteEmail(id);
		}
		await deleteInbox(address);
	});

	test("getInbox returns empty for unknown address", async () => {
		const result = await getInbox("unknown-address@localhost");
		expect(result.emails).toHaveLength(0);
		expect(result.pagination.totalEmails).toBe(0);
	});

	test("deleteEmail removes a single email", async () => {
		const id = await storeEmail(makeEmail({ subject: "To Delete" }));

		const result = await deleteEmail(id);
		expect(result.deleted).toBe(true);

		const email = await getEmail(id);
		expect(email).toBeNull();
	});

	test("deleteEmail returns false for unknown ID", async () => {
		const result = await deleteEmail("nonexistent-id-99999");
		expect(result.deleted).toBe(false);
	});

	test("deleteInbox removes all emails for an address", async () => {
		const address = `delete-test-${Date.now()}@localhost`;

		await storeEmail(makeEmail({ to: address, subject: "A" }));
		await storeEmail(makeEmail({ to: address, subject: "B" }));

		const result = await deleteInbox(address);
		expect(result.deleted).toBe(2);

		const inbox = await getInbox(address);
		expect(inbox.emails).toHaveLength(0);
	});
});
