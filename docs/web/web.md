# web

## Role
Frontend for the portfolio. Built as a static Vite/React app, served by nginx in preview/production.

## Status
No source code has been implemented yet (`apps/web/src` does not exist) — only the build skeleton (`package.json`, `Dockerfile`) is in place. The contract below reflects what the Dockerfile already fixes; application-level details (e.g. how the frontend finds the API) are still open and will be filled in once implementation starts.

## Build
From the repository root:
```bash
docker build -f apps/web/Dockerfile -t portfolio-web .
```
Multi-stage build: compiles with Vite in a `node:22-alpine` stage, then serves the static output with `nginx:alpine`.

## Run
```bash
docker compose -f apps/docker-compose.yml up web
```

## Port
- nginx serves on port `80` inside the container (`EXPOSE 80`) — fixed, not configurable via an env var.
- Mapped to `8080` on the host by `docker-compose.yml`.

## Environment variables
None yet. Once the frontend needs to reach the API, expect a build-time variable (e.g. `VITE_API_URL`): Vite env vars are baked in at build time, not read at container runtime, so this will need to be passed as a Docker build arg rather than a `environment:` entry in compose. Still to be decided.

## Health check
None defined yet. Lower priority than for `api`: nginx serving static files has few partial-failure modes. Could be added later for consistency.

## Dependencies
None at build time. At runtime, once the frontend calls the API from the browser, `api`'s `CORS_ORIGIN` must include this service's origin.
