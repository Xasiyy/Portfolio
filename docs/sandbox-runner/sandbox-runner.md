# sandbox-runner

## Role
Node/Express service using `dockerode` to manage Docker containers from within a container (mounts the host's Docker socket), and `http-proxy-middleware` to proxy requests — responsible for spinning up preview environments dynamically.

## Status
No source code has been implemented yet (`apps/sandbox-runner/src` does not exist) — only the build skeleton (`package.json`, `Dockerfile`) is in place. Environment variables, routes and health check are not yet defined in code; this file will be completed once implementation starts.

## Build
From the repository root:
```bash
docker build -f apps/sandbox-runner/Dockerfile -t portfolio-sandbox-runner .
```

## Run
```bash
docker compose -f apps/docker-compose.yml up sandbox-runner
```

## Port
- `EXPOSE 4000` in the Dockerfile; mapped to `4000` on the host in `docker-compose.yml`.
- Not yet read from a `PORT` env var (no source code exists yet) — should follow the same `PORT`-driven convention as `api` once implemented.

## Environment variables
None defined yet — no source code reads `process.env` at this point.

## Health check
None defined yet.

## Dependencies
- Depends on `api` being started (`depends_on: - api` in `docker-compose.yml`).
- Mounts `/var/run/docker.sock` from the host, granting effective control over the host's Docker daemon. This is a broader privilege than a non-root container `USER` can mitigate: anyone who can reach this service can, in practice, create and control containers on the host. Treat it as internal/trusted-only until a proper access boundary is added in front of it.
