import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {
  getInbox,
  getEmail,
  deleteInbox,
  deleteEmail,
  isRedisHealthy,
} from "./store";
import { isSMTPRunning } from "./smtp";
import { config } from "./config";

const StoredEmailSchema = t.Object({
  id: t.String(),
  to: t.String(),
  from: t.String(),
  subject: t.String(),
  text: t.String(),
  html: t.String(),
  headers: t.Record(t.String(), t.String()),
  receivedAt: t.String(),
});

const PaginationSchema = t.Object({
  page: t.Number(),
  limit: t.Number(),
  totalEmails: t.Number(),
  totalPages: t.Number(),
  hasMore: t.Boolean(),
});

const InboxResponseSchema = t.Object({
  emails: t.Array(StoredEmailSchema),
  pagination: PaginationSchema,
});

export function startAPI(port = config.apiPort) {
  const app = new Elysia()
    .use(
      swagger({
        documentation: {
          info: {
            title: "CloakMail API",
            description: "Disposable email service REST API",
            version: "1.0.0",
          },
        },
      }),
    )
    .get(
      "/api/inbox/:address",
      async ({ params, query }) => {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 10, 50);
        return getInbox(params.address, page, limit);
      },
      {
        params: t.Object({ address: t.String() }),
        query: t.Object({
          page: t.Optional(t.String()),
          limit: t.Optional(t.String()),
        }),
        response: InboxResponseSchema,
      },
    )
    .get(
      "/api/email/:id",
      async ({ params, set }) => {
        const email = await getEmail(params.id);
        if (!email) {
          set.status = 404;
          return { error: "Email not found" };
        }
        return email;
      },
      {
        params: t.Object({ id: t.String() }),
        response: {
          200: StoredEmailSchema,
          404: t.Object({ error: t.String() }),
        },
      },
    )
    .delete(
      "/api/inbox/:address",
      async ({ params }) => {
        return deleteInbox(params.address);
      },
      {
        params: t.Object({ address: t.String() }),
        response: t.Object({ deleted: t.Number() }),
      },
    )
    .delete(
      "/api/email/:id",
      async ({ params }) => {
        return deleteEmail(params.id);
      },
      {
        params: t.Object({ id: t.String() }),
        response: t.Object({ deleted: t.Boolean() }),
      },
    )
    .get("/api/health", async () => ({
      status: "ok",
      smtp: isSMTPRunning(),
      redis: await isRedisHealthy(),
      uptime: process.uptime(),
    }), {
      response: t.Object({
        status: t.String(),
        smtp: t.Boolean(),
        redis: t.Boolean(),
        uptime: t.Number(),
      }),
    })
    .listen(port);

  console.log(`[api] Listening on port ${port}`);

  return app;
}
