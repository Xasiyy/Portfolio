FROM node:22-alpine AS base
RUN corepack enable
RUN apk add --no-cache git
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/sandbox-runner/package.json apps/sandbox-runner/package.json
RUN pnpm install --filter sandbox-runner --frozen-lockfile

COPY apps/sandbox-runner apps/sandbox-runner
RUN pnpm --filter sandbox-runner build

EXPOSE 4000
HEALTHCHECK  --interval=10s --timeout=3s --start-period=10s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-4000}/health || exit 1
CMD ["node", "apps/sandbox-runner/dist/main.js"]