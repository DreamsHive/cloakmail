# Contributing to CloakMail

Thanks for your interest in contributing to CloakMail! This guide will help you get started.

## Prerequisites

- [Bun](https://bun.sh/) v1.3 or later
- [Docker](https://docs.docker.com/get-docker/) (for the `server` package's local Redis)
- [Git](https://git-scm.com/)

## Setup

1. Fork and clone the repository:

   ```bash
   git clone git@github.com:YOUR_USERNAME/cloakmail.git
   cd cloakmail
   ```

2. Install dependencies for each package you plan to work on:

   ```bash
   cd packages/server   && bun install
   cd ../web            && bun install
   cd ../cloudflare     && bun install
   ```

3. Verify everything works:

   ```bash
   # In packages/server (needs Redis on :6379)
   bun test

   # In packages/web
   bun run test
   bun run build

   # In packages/cloudflare
   bun run test
   ```

## Project Structure

```
cloakmail/
├── packages/
│   ├── server/         # Bun + Elysia API + smtp-server (Docker / VPS deployment)
│   ├── web/            # SvelteKit UI (works with both adapter-node and adapter-cloudflare)
│   └── cloudflare/     # Cloudflare Workers + D1 + R2 + Email Routing (serverless deployment)
├── docker-compose.yml             # local dev (Redis + server + web)
├── docker-compose.production.yml  # production Docker stack
└── .github/workflows/             # CI, Docker publish, npm publish, Cloudflare deploy
```

The two deployment paths (Docker via `packages/server` and Cloudflare via `packages/cloudflare`) share the SvelteKit UI in `packages/web` and a small amount of duplicated code (`spam.ts`, `types.ts`) — but each has its own storage backend (Redis vs D1+R2).

## Development Workflow

### Server (Docker path)

```bash
cd packages/server
bun run dev          # auto-reload on src/ changes
bun test             # unit + integration tests (requires Redis)
```

### Web

```bash
cd packages/web
bun run dev                  # SvelteKit dev server (adapter-node by default)
ADAPTER=cloudflare bun run build   # build for Cloudflare Workers
bun run test                 # vitest
```

### Cloudflare

```bash
cd packages/cloudflare
bun run dev                  # wrangler dev with miniflare D1+R2
bun run test                 # vitest via @cloudflare/vitest-pool-workers
```

For end-to-end Cloudflare deployment from a fork, use the [`cloakmail-cli`](https://github.com/DreamsHive/cloakmail-cli) wizard with `--from /path/to/your/fork` so it skips the GitHub tarball fetch and uses your local checkout.

## Making Changes

1. Create a branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and ensure:
   - Tests pass in any package you touched
   - The Docker `bun run build` in `packages/web` still produces a working `build/` directory (regression check for the Node adapter path)
   - The Cloudflare adapter still builds: `cd packages/web && ADAPTER=cloudflare bun run build`

3. Write tests for new features or bug fixes.

4. Submit a pull request against `main`. Reference any related issues in the description.

## Commit Messages

We follow [conventional commits](https://www.conventionalcommits.org/):

```
feat(cloudflare): add R2 spillover for emails > 100KB
fix(server): handle malformed MIME headers without crashing
refactor(web): consolidate same-origin fetch logic
docs: document the cloakmail-cli wizard flow
test(cloudflare): cover the smart-split threshold
chore: bump dependencies
```

The scope (in parentheses) is optional but encouraged when a change is package-specific.

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Include tests for new functionality
- Update documentation if user-visible behavior changes
- Make sure CI passes before requesting review
- Both deployment paths (Docker and Cloudflare) should remain working — don't accidentally break one to fix the other

## Reporting Bugs

Open an issue using the bug report template with:

- Clear description of the problem
- Minimal reproduction steps
- Expected vs actual behavior
- Deployment path: Docker (which compose file?) or Cloudflare (Workers + D1 + R2)
- Bun version (`bun --version`) and OS

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
