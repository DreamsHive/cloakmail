/// <reference types="@cloudflare/workers-types" />
/// <reference types="@cloudflare/vitest-pool-workers" />

import type { Env } from "../src/types";

declare module "cloudflare:test" {
  // Make `env` from `cloudflare:test` typed as the Worker's `Env`.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProvidedEnv extends Env {}
}
