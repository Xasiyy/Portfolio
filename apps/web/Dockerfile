FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter web --frozen-lockfile

COPY apps/web apps/web
RUN pnpm --filter web build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/apps/web/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
