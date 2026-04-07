import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkersConfig({
  test: {
    include: ["test/**/*.test.ts"],
    poolOptions: {
      workers: {
        singleWorker: true,
        isolatedStorage: true,
        main: path.resolve(__dirname, "src/worker.ts"),
        miniflare: {
          compatibilityDate: "2025-01-01",
          compatibilityFlags: ["nodejs_compat"],
          d1Databases: ["DB"],
          r2Buckets: ["R2"],
          bindings: {
            DOMAIN: "test.local",
            EMAIL_TTL_SECONDS: "86400",
            MAX_EMAIL_SIZE_MB: "10",
          },
        },
      },
    },
  },
});
