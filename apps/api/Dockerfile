FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter api --frozen-lockfile

COPY apps/api apps/api
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]