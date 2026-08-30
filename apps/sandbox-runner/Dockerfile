FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/sandbox-runner/package.json apps/sandbox-runner/package.json
RUN pnpm install --filter sandbox-runner --frozen-lockfile

COPY apps/sandbox-runner apps/sandbox-runner
RUN pnpm --filter sandbox-runner build

CMD ["node", "apps/sandbox-runner/dist/main.js"]