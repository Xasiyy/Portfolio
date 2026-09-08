# Preview Contract — Global Overview

This document defines the "preview-able" contract for this repository: what any service needs (build, port, environment variables, health) to be run standalone or previewed by CI/tooling, without reading the application source.

Per-service details (role, build/run commands, port, environment variables, health check) live in their own doc folder:
- [api/api.md](./api/api.md)
- [web/web.md](./web/web.md)
- [sandbox-runner/sandbox-runner.md](./sandbox-runner/sandbox-runner.md)

This file covers what's shared across services: the stack, orchestration commands, the dependency graph, health check status, and cross-cutting decisions. Additional docs will be added under `docs/` as needed.

## Stack overview

- **Monorepo**: pnpm workspaces (`pnpm-workspace.yaml`), 3 apps under `apps/`.
- **api**: NestJS + TypeScript, TypeORM, Postgres.
- **web**: React + Vite + TypeScript (build skeleton only, no source yet), served by nginx.
- **sandbox-runner**: Node + Express + TypeScript, `dockerode` (controls the host's Docker daemon) + `http-proxy-middleware` (build skeleton only, no source yet).
- **Database**: Postgres 16 (`postgres:16-alpine`), one instance shared by the stack.
- **Orchestration**: Docker Compose (`apps/docker-compose.yml`) for local/preview; each app has its own Dockerfile.

## Running everything together

```bash
docker compose -f apps/docker-compose.yml up --build
```

```bash
docker compose -f apps/docker-compose.yml up db       # database only
docker compose -f apps/docker-compose.yml down         # stop everything
docker compose -f apps/docker-compose.yml logs -f api  # follow one service's logs
```

## Dependency graph

```
db (Postgres)
 └─ api               — waits for db to be healthy (pg_isready)
     ├─ web            — waits for api to be healthy (GET /health)
     └─ sandbox-runner — waits for api to start (no health check defined yet)
```

## Health checks

| Service | Health check | Docker `HEALTHCHECK` |
|---|---|---|
| `db` | `pg_isready -U postgres` | yes |
| `api` | `GET /health` (process + Postgres ping via Terminus) | yes |
| `web` | none yet | no |
| `sandbox-runner` | none yet | no |

## Environment variables — what exists and why

Full per-variable tables live in each service's doc (linked above). Summary of intent:

- **`api`** already validates its env vars at boot (`apps/api/src/config/env.validation.ts`): `NODE_ENV`, `PORT`, `DATABASE_URL` (required — how it reaches Postgres), `CORS_ORIGIN` (required — which frontend origin is allowed to call it).
- **`web`** takes none yet. Once it needs to call the API, it will need a build-time variable (e.g. `VITE_API_URL`) — not a runtime one, since Vite bakes env vars in at build time.
- **`sandbox-runner`** takes none yet — no source code exists to read them. Once implemented, it should follow the same `PORT`-driven convention as `api`, plus whatever it needs to talk to the Docker daemon and to `api`.

## Cross-cutting decisions

### Schema management: synchronize vs. migrations
`api` auto-creates its schema (`synchronize: true`) whenever `NODE_ENV !== 'production'`. In any environment run with `NODE_ENV=production` (including a "production-like" preview), `synchronize` is disabled and the database will **not** have tables unless migrations under `apps/api/src/migrations/` are run explicitly against `apps/api/src/data-source.ts`. There is currently no npm script wrapping this — it's a manual step until automated. Anyone previewing with `NODE_ENV=production` needs to know this before assuming the API is broken.

### Docker socket access (`sandbox-runner`)
`sandbox-runner` mounts the host's `/var/run/docker.sock`, giving it effective control over the host's Docker daemon. This is a broader privilege than container-level hardening (non-root user, etc.) can mitigate. Treat this service as internal/trusted-only in any preview environment — do not expose it publicly without a proper access boundary in front of it.
