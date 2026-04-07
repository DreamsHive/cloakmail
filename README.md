<p align="center">
  <img src="https://res.cloudinary.com/deo6w3xib/image/upload/q_100/v1769594451/cloakmail_sq5pfe.webp" alt="CloakMail Logo" width="120" height="120" />
</p>

<h1 align="center">CloakMail</h1>

<p align="center">
  <strong>Self-hosted disposable email service.</strong><br />
  Generate temporary email addresses instantly. No sign-up. No tracking. Auto-expiring.
</p>

<p align="center">
  <a href="https://docs.cloakmail.dev">Documentation</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#quick-start">Quick Start</a> &middot;
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://github.com/DreamsHive/cloakmail/actions/workflows/ci.yml"><img src="https://github.com/DreamsHive/cloakmail/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/DreamsHive/cloakmail/releases/latest"><img src="https://img.shields.io/github/v/release/DreamsHive/cloakmail" alt="Release" /></a>
  <a href="https://github.com/DreamsHive/cloakmail/pkgs/container/cloakmail"><img src="https://img.shields.io/badge/ghcr.io-cloakmail-blue?logo=docker" alt="GHCR" /></a>
  <a href="https://github.com/DreamsHive/cloakmail/blob/main/LICENSE"><img src="https://img.shields.io/github/license/DreamsHive/cloakmail" alt="License" /></a>
  <a href="https://github.com/DreamsHive/cloakmail/stargazers"><img src="https://img.shields.io/github/stars/DreamsHive/cloakmail?style=social" alt="Stars" /></a>
</p>

---

## Features

- **No authentication required** — generate an inbox instantly, no sign-up or login
- **Auto-expiring** — all emails and addresses are automatically deleted after a configurable TTL
- **Zero tracking** — no cookies, no analytics, no IP logging
- **Built-in SMTP server** — receives emails directly, no third-party email provider needed
- **Self-hosted** — run on your own infrastructure with full control over your data
- **REST API** — fully documented OpenAPI spec with typed endpoints
- **Web UI** — Accessible web interface built with SvelteKit and Tailwind CSS
- **Docker-ready** — single `docker compose up` to run the entire stack
- **Serverless on Cloudflare** — deploy to Workers + D1 + R2 + Email Routing on the free tier with a single command, no servers to manage

## Quick Start

CloakMail ships with two deployment paths. Pick the one that fits your situation:

| Deployment | Good for | Cost |
|---|---|---|
| **Docker / VPS** | Full control, self-hosted servers, on-prem | Your server costs |
| **Cloudflare Workers** | Zero servers to manage, global edge, free tier | $0 on the free tier (up to ~100k emails/day) |

### Option 1 — Docker / VPS

Pull and run directly from GitHub Container Registry:

```bash
# Create a docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/DreamsHive/cloakmail/main/docker-compose.yml -o docker-compose.yml

# Set your domain
export DOMAIN=yourdomain.com

# Start all services
docker compose up -d
```

Or use the GHCR images directly:

```bash
docker pull ghcr.io/dreamshive/cloakmail-server:latest
docker pull ghcr.io/dreamshive/cloakmail-web:latest
```

The web UI will be available at `http://localhost:5173` and the API at `http://localhost:3000`.

#### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DOMAIN` | `localhost` | Email domain for receiving mail |
| `APP_NAME` | `CloakMail` | App name displayed in the UI |
| `EMAIL_TTL_SECONDS` | `86400` | Time before emails auto-delete |
| `SMTP_PORT` | `25` | SMTP server port |
| `API_PORT` | `3000` | REST API port |
| `API_URL` | `http://server:3000` | Overrides `PUBLIC_API_URL` for the web container — useful for split deployments or reverse-proxy setups |

See [.env.example](.env.example) for all available options.

### Option 2 — Cloudflare Workers

Run CloakMail entirely on Cloudflare's free tier — no servers, no Docker, no `ssh`. One command from any directory on your machine:

```bash
bunx cloakmail-cli setup
```

The [`cloakmail-cli`](https://github.com/DreamsHive/cloakmail-cli) wizard handles the entire deployment end-to-end: it fetches this repo's release tarball, prompts for your Cloudflare API token + domain + hostname, provisions D1 and R2, deploys both Workers, configures Email Routing, binds your custom domain, and verifies the whole thing — in about two minutes.

**Prerequisites:**

- A Cloudflare account (free tier is fine)
- A domain already added to Cloudflare DNS
- [Bun](https://bun.sh/) installed locally (for `bunx`)

**What you get:**

- A web UI at whatever hostname you pick (e.g. `https://inbox.yourdomain.com`)
- Catch-all email routing on your domain — any address `*@yourdomain.com` lands in a disposable inbox
- Automatic TLS via Cloudflare
- ~100k emails/day on the free tier (D1 + R2 smart-split storage)

The Docker and Cloudflare paths are fully independent — pick whichever fits your setup, or even run both for different domains.

## Documentation

For full setup guides, API reference, and deployment instructions, visit the official documentation at [docs.cloakmail.dev](https://docs.cloakmail.dev).

## License

This project is licensed under the [MIT License](LICENSE).
