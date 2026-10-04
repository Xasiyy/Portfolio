# Portfolio

**Live:** [asiyaad.tech](https://asiyaad.tech)

My personal portfolio, built as a pnpm monorepo. It goes further than a static showcase: each project can be **launched and tried live** in the browser, inside a temporary, isolated Docker sandbox. Visitors don't install anything. Depending on the project, they get either a graphical window (noVNC) or a terminal (ttyd).

<!-- TODO: add a screenshot / GIF of a running sandbox here -->

## Table of contents

- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started (local)](#getting-started-local)
- [Environment variables](#environment-variables)
- [Database: migrations & seed](#database-migrations--seed)
- [Deploying to production](#deploying-to-production)
- [Making a project "sandboxable"](#making-a-project-sandboxable)
- [API reference](#api-reference)
- [Security & limits](#security--limits)
- [Further documentation](#further-documentation)

## How it works

The stack is made of three services plus a database:

| Service | Role |
|---|---|
| **`web`** | Next.js app exported as static HTML, served by nginx. It shows the projects, the contact form and the sandbox viewer (an iframe). |
| **`api`** | NestJS + TypeORM + PostgreSQL. Holds the projects and contact messages, sends contact emails, and asks the runner to create sandboxes. |
| **`sandbox-runner`** | Express + dockerode. Clones a project's repo, builds and runs it as a container, then reverse-proxies HTTP **and WebSocket** traffic to it. |
| **`db`** | PostgreSQL 16. |

```mermaid
flowchart LR
    Visitor(("Visitor"))

    subgraph VPS
        Caddy["Caddy
        TLS + reverse proxy"]
        Web["web
        Next.js static export
        nginx :8080"]
        Api["api
        NestJS :3001"]
        Db[("PostgreSQL")]
        Runner["sandbox-runner
        Express :4000"]
        Sbx[("sandbox containers
        one per launch")]
    end

    Visitor -->|asiyaad.tech| Caddy --> Web
    Visitor -->|api.asiyaad.tech| Caddy --> Api
    Visitor -->|"sandbox.asiyaad.tech (iframe, WebSocket)"| Caddy --> Runner
    Api --> Db
    Api -->|"POST /sandboxes + x-runner-key"| Runner
    Runner -->|"docker.sock: build / run / remove"| Sbx
    Runner -->|"proxy /sandboxes/:id/*"| Sbx
```

### Lifecycle of a sandbox

1. The visitor clicks **Try it**. `web` calls `POST /projects/:id/sandbox` on the `api`.
2. The `api` looks up the project's `repoUrl` and calls `POST /sandboxes` on the runner, authenticated with a shared key (`x-runner-key`).
3. The runner runs `git clone --depth 1`, then `docker build`, then `docker run` (256 MB RAM, 1 CPU, port 3000 bound to a random port on `127.0.0.1`). It returns a `sandboxId`.
4. `web` opens an iframe on `https://sandbox.asiyaad.tech/sandboxes/<sandboxId>/…`. The runner proxies that traffic, WebSockets included, to the container.
5. The sandbox is destroyed after **30 minutes**: container, image and cloned files are all removed.

### Design decisions

- **The runner is isolated from the `api`.** It is the only service with access to `docker.sock`, which is close to root on the host. The database and the email credentials never live in the same process as the code that runs untrusted repos.
- **Creating a sandbox requires a key, viewing one doesn't.** Only the `api` holds `RUNNER_API_KEY`, so only the `api` can create or delete sandboxes, and it rate-limits that per IP. Viewing goes straight to the runner, because it is streaming traffic (VNC/terminal over WebSocket) and would gain nothing from an extra hop. Sandbox IDs are random UUIDs.
- **`web` is a static export.** No Node server to run: nginx serves plain files, which are easy to cache.
- **PostgreSQL is the source of truth.** Projects live in the database, not in the frontend code.

## Tech stack

- **Frontend:** Next.js 16 (`output: "export"`), React 19, Tailwind CSS 4, daisyUI, three.js / react-three-fiber (animated shader backgrounds), styled-components
- **Backend:** NestJS 10, TypeORM, PostgreSQL 16, Joi (env validation), class-validator, @nestjs/throttler, @nestjs/terminus, nodemailer
- **Sandbox runner:** Node 22, Express, dockerode, http-proxy-middleware
- **Infra:** Docker Compose, Caddy (automatic HTTPS), UFW, a single VPS

## Repository layout

```
.
├── apps/
│   ├── api/                  # NestJS API (projects, contact, sandbox, health)
│   │   └── src/migrations/   # TypeORM migrations
│   ├── web/                  # Next.js frontend (static export)
│   ├── sandbox-runner/       # Docker orchestration + proxy
│   ├── docker-compose.yml        # local stack
│   └── docker-compose.prod.yml   # production stack
├── docs/                     # per-service docs
└── pnpm-workspace.yaml
```

## Getting started (local)

### Prerequisites

- **Node.js 22** and **pnpm 11** (`corepack enable`)
- **Docker** with Compose v2
- **Linux** for the sandbox runner: it uses `network_mode: host`, which does not behave the same way on Docker Desktop (macOS/Windows)

### Option A: everything in Docker

```bash
git clone https://github.com/Xasiyy/Portfolio.git
cd Portfolio/apps
cp api/.env.example .env       # then edit it, see "Environment variables"
docker compose up --build
```

| URL | Service |
|---|---|
| http://localhost:8080 | web |
| http://localhost:3001 | api |
| http://localhost:4000 | sandbox-runner |

Then [run the migrations and the seed](#database-migrations--seed).

### Option B: services run separately (hot reload)

```bash
pnpm install
docker compose -f apps/docker-compose.yml up -d db   # Postgres only

pnpm dev:api       # NestJS on :3001   (reads apps/api/.env)
pnpm dev:sandbox   # runner on :4000   (reads apps/sandbox-runner/.env)
pnpm dev:web       # Next.js on :3000  (reads apps/web/.env.local)
```

## Environment variables

Generate the shared runner key once, and use **the same value** for the `api` and the `sandbox-runner` of a given machine:

```bash
openssl rand -hex 32
```

### `apps/.env` (read by Docker Compose)

| Variable | Used by | Description |
|---|---|---|
| `RUNNER_API_KEY` | api, sandbox-runner | Shared secret, at least 32 characters |
| `MAIL_USER` | api | Gmail address used to send contact emails |
| `MAIL_PASS` | api | Gmail **app password** (not your account password) |
| `MAIL_TO` | api | Where contact messages are delivered |
| `DB_PASSWORD` | db, api | Postgres password (**production only**) |

### `apps/api/.env` (local `pnpm dev:api`)

| Variable | Example |
|---|---|
| `NODE_ENV` | `development` |
| `PORT` | `3001` |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/portfolio` |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `SANDBOX_RUNNER_URL` | `http://localhost:4000` |
| `RUNNER_API_KEY`, `MAIL_USER`, `MAIL_PASS`, `MAIL_TO` | see above |

All of these are validated at boot (`apps/api/src/config/env.validation.ts`), and the API refuses to start if one is missing or invalid.

### `apps/sandbox-runner/.env` (local `pnpm dev:sandbox`)

| Variable | Default | Description |
|---|---|---|
| `RUNNER_API_KEY` | (required) | Same value as the api's key |
| `PORT` | `4000` | Listening port |
| `MAX_SANDBOXES` | `4` | Max sandboxes running or being built at the same time |

### `apps/web/.env.local` (local `pnpm dev:web`)

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_SANDBOX_RUNNER_URL` | `http://localhost:4000` |

> `NEXT_PUBLIC_*` values are **baked in at build time**. In Docker they are passed as build `args` in the compose file, so changing a domain means rebuilding `web`.

## Database: migrations & seed

`synchronize` is enabled only outside production. In production, the tables exist **only if the migrations have been run**.

```bash
cd apps/api

# apply the migrations
pnpm exec typeorm-ts-node-commonjs migration:run -d src/data-source.ts

# fill the projects table ( empties it first)
pnpm exec ts-node src/seed.ts
```

Same thing in production, inside the running container:

```bash
cd apps
docker compose -f docker-compose.prod.yml exec api sh -c \
  "cd apps/api && pnpm exec typeorm-ts-node-commonjs migration:run -d src/data-source.ts"
```

## Deploying to production

Production runs on a single VPS: `docker-compose.prod.yml` for the app, plus **Caddy** in front for HTTPS. Caddy is not part of this repo.

### 1. DNS

Three A records pointing to the VPS: `asiyaad.tech` (and `www`), `api.asiyaad.tech`, `sandbox.asiyaad.tech`.

### 2. Start the stack

```bash
cd apps
nano .env          # RUNNER_API_KEY, MAIL_*, DB_PASSWORD
docker compose -f docker-compose.prod.yml up -d --build
```

All app ports are bound to `127.0.0.1` and are not reachable from outside. Only Caddy is exposed.

### 3. Caddy

```caddy
asiyaad.tech {
    reverse_proxy 127.0.0.1:8080
}

www.asiyaad.tech {
    redir https://asiyaad.tech{uri} permanent
}

api.asiyaad.tech {
    reverse_proxy 127.0.0.1:3001
}

sandbox.asiyaad.tech {
    reverse_proxy 127.0.0.1:4000
}
```

Caddy gets the TLS certificates automatically and forwards WebSockets without any extra config, which noVNC and ttyd both need. If Caddy itself runs in Docker, reload it after any change:

```bash
docker exec <caddy-container> caddy reload --config /etc/caddy/Caddyfile
```

> Without the `sandbox.asiyaad.tech` block, sandboxes get created but the iframe fails with `SSL_ERROR_INTERNAL_ERROR_ALERT`.

### 4. Firewall

The runner uses `network_mode: host` and listens on port 4000 of the host. The `api` container reaches it through `host.docker.internal`, so that traffic must be allowed **from Docker networks only**:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 172.16.0.0/12 to any port 4000 proto tcp comment 'docker -> sandbox-runner'
```

Never open port 4000 to the internet.

### 5. Database

Run the migrations (and the seed on first deploy), see [above](#database-migrations--seed).

### Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| Modal shows "Impossible de lancer le sandbox" | api cannot reach the runner | `docker compose -f docker-compose.prod.yml exec api wget -qO- http://host.docker.internal:4000/health` |
| Runner answers `401 Unauthorized` | `RUNNER_API_KEY` differs or is empty | `docker compose -f docker-compose.prod.yml config \| grep RUNNER_API_KEY` |
| Iframe shows an SSL error | missing `sandbox.*` block in Caddy | `curl -I https://sandbox.asiyaad.tech/health` |
| `git clone` fails with "could not read Username" | the project repo is private | make it public |
| Build fails or gets killed | VPS out of RAM | `free -h`, `docker compose logs sandbox-runner` |

## Making a project "sandboxable"

The runner can launch any repo that respects this contract:

1. The repo is **public**. It is cloned without credentials.
2. It has a **`Dockerfile` at its root**.
3. The container **listens on port 3000**.
4. It exposes one of the two interfaces the frontend knows:

| Variant | What must be served on :3000 | URL opened by `web` |
|---|---|---|
| `graphical` | noVNC: `/vnc.html` + the `websockify` WebSocket | `/sandboxes/:id/vnc.html?autoconnect=true&resize=scale&path=sandboxes/:id/websockify` |
| `terminal` | ttyd at the root | `/sandboxes/:id/` |

Typical setups: a graphical C/MiniLibX project runs under Xvfb + x11vnc + noVNC, and a CLI project (a shell, push_swap…) runs under ttyd.

## API reference

### `api` (public, `https://api.asiyaad.tech`)

| Method | Route | Description | Rate limit |
|---|---|---|---|
| `GET` | `/projects` | List projects | — |
| `GET` | `/projects/:id` | Project details | — |
| `POST` | `/projects/:id/sandbox` | Launch a sandbox → `{ sandboxId, port }` | 3 / 10 min / IP |
| `POST` | `/contact` | `{ firstName, lastName, email, message }`, stored and emailed | 10 / hour / IP |
| `GET` | `/health` | Process + Postgres liveness | — |

### `sandbox-runner` (`https://sandbox.asiyaad.tech`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/sandboxes` | `x-runner-key` | `{ repoUrl }`: clone, build, run → `{ sandboxId, port }` |
| `DELETE` | `/sandboxes/:id` | `x-runner-key` | Destroy a sandbox |
| `ANY` | `/sandboxes/:id/*` | — | Proxy (HTTP + WebSocket) to the sandbox container |
| `GET` | `/health` | — | Liveness |

## Security & limits

| Measure | Value |
|---|---|
| Resources per sandbox | 256 MB RAM, 1 CPU |
| Sandbox lifetime | 30 min (cleanup runs every 5 min) |
| Concurrent sandboxes | 4, counting builds in progress (`MAX_SANDBOXES`); beyond that the runner answers `503` |
| Runner authentication | shared key, compared in constant time (`timingSafeEqual`) |
| Container ports | bound to `127.0.0.1` only, reachable only through the runner |
| Failed builds | clone directory and image removed |
| Shutdown (`SIGTERM`) | all running sandboxes are destroyed before the process exits |
| API input | global `ValidationPipe` (whitelist + forbid unknown fields), Joi-validated env |
| Contact form | rate-limited + honeypot field |

The runner mounts `/var/run/docker.sock`, so it effectively has root access to the host. Only list repositories you trust: a sandboxed project's Dockerfile is built on the host's Docker daemon.

## Further documentation

- [`docs/PREVIEW_CONTRACT.md`](docs/PREVIEW_CONTRACT.md): cross-service overview
- [`docs/api/api.md`](docs/api/api.md)
- [`docs/web/web.md`](docs/web/web.md)
- [`docs/sandbox-runner/sandbox-runner.md`](docs/sandbox-runner/sandbox-runner.md)

## Author

**Asiya**, [GitHub @Xasiyy](https://github.com/Xasiyy)
