import { config } from "./config";
import type { InboundEmail, StoredEmail, InboxResponse } from "./types";

const redis = new Bun.RedisClient(config.redisUrl);
const TTL = config.emailTtlSeconds;

export async function storeEmail(email: InboundEmail): Promise<string> {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  const now = new Date().toISOString();

  const key = `email:${id}`;
  await redis.hset(key, {
    id,
    to: email.to,
    from: email.from,
    subject: email.subject,
    text: email.text,
    html: email.html,
    headers: JSON.stringify(email.headers),
    receivedAt: now,
  });
  await redis.expire(key, TTL);

  const inboxKey = `inbox:${email.to}`;
  await redis.zadd(inboxKey, Date.now(), id);
  await redis.expire(inboxKey, TTL);

  return id;
}

export async function getInbox(
  address: string,
  page = 1,
  limit = 10,
): Promise<InboxResponse> {
  const inboxKey = `inbox:${address}`;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const ids = await redis.zrevrange(inboxKey, start, end);
  const total = await redis.zcard(inboxKey);

  const emails: StoredEmail[] = [];
  for (const id of ids) {
    const data = await redis.hgetall(`email:${id}`);
    if (data && data.id) {
      emails.push({
        id: data.id,
        to: data.to,
        from: data.from,
        subject: data.subject,
        text: data.text,
        html: data.html,
        headers: JSON.parse(data.headers || "{}"),
        receivedAt: data.receivedAt,
      });
    }
  }

  return {
    emails,
    pagination: {
      page,
      limit,
      totalEmails: total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getEmail(id: string): Promise<StoredEmail | null> {
  const data = await redis.hgetall(`email:${id}`);
  if (!data || !data.id) return null;

  return {
    id: data.id,
    to: data.to,
    from: data.from,
    subject: data.subject,
    text: data.text,
    html: data.html,
    headers: JSON.parse(data.headers || "{}"),
    receivedAt: data.receivedAt,
  };
}

export async function deleteInbox(
  address: string,
): Promise<{ deleted: number }> {
  const inboxKey = `inbox:${address}`;
  const ids = await redis.zrange(inboxKey, 0, -1);

  for (const id of ids) {
    await redis.del(`email:${id}`);
  }
  await redis.del(inboxKey);

  return { deleted: ids.length };
}

export async function deleteEmail(
  id: string,
): Promise<{ deleted: boolean }> {
  const data = await redis.hgetall(`email:${id}`);
  if (!data || !data.id) return { deleted: false };

  const address = data.to;
  await redis.del(`email:${id}`);
  await redis.zrem(`inbox:${address}`, id);

  return { deleted: true };
}

export async function isRedisHealthy(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}
