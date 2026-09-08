# api

## Role
NestJS REST API for the portfolio backend. Serves the `projects` and `contact` resources, persists data in Postgres via TypeORM, and exposes a health check for orchestration/preview tooling.

## Build
From the repository root:
```bash
docker build -f apps/api/Dockerfile -t portfolio-api .
```
The build context must be the repository root (not `apps/api/`) — the Dockerfile copies the workspace-level `pnpm-workspace.yaml`, `package.json` and `pnpm-lock.yaml` before installing only the `api` package.

## Run
Via docker compose (recommended — also starts Postgres):
```bash
docker compose -f apps/docker-compose.yml up api
```
Standalone: `DATABASE_URL` must point to an address reachable from inside the container — not `localhost`, unless the container runs with `--network host`.
```bash
docker run -p 3001:3001 --env-file apps/api/.env portfolio-api
```

## Port
- The app listens on the port set by `PORT` (default `3001`).
- Exposed in the Dockerfile as `EXPOSE 3001`.

## Environment variables
| Name | Required | Type | Default | Example |
|---|---|---|---|---|
| `NODE_ENV` | no | `development` \| `production` \| `test` | `development` | `production` |
| `PORT` | no | number | `3001` | `3001` |
| `DATABASE_URL` | yes | URI string | — | `postgres://user:password@localhost:5432/portfolio` |
| `CORS_ORIGIN` | yes | string | — | `http://localhost:5173` |

Validated at boot by [`env.validation.ts`](../../apps/api/src/config/env.validation.ts) — startup fails immediately if a required variable is missing or malformed.

## Health check
- `GET /health`
- `200` when the process is up and the Postgres connection responds (checked via a TypeORM ping).
- `503` when the database is unreachable.
- Backed by `@nestjs/terminus`, wired in [`health.module.ts`](../../apps/api/src/health/health.module.ts).
- Declared as a Docker `HEALTHCHECK` in the Dockerfile (`wget --spider` against `/health`).

## Dependencies
- Requires a reachable Postgres instance at `DATABASE_URL` (the `db` service in `docker-compose.yml`).
- Schema: `synchronize` runs automatically outside `production` (auto-creates tables from entities). In `production`-like environments it's disabled, and migrations under `src/migrations/` must be run explicitly — no npm script wraps this yet. See [DOC_GLOBAL.md](../DOC_GLOBAL.md) for details.
