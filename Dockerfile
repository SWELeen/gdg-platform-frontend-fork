FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG API_PROXY_TARGET=https://api-gdguj.engshad.com
ARG NEXT_PUBLIC_USE_API=true
ENV API_PROXY_TARGET=$API_PROXY_TARGET
ENV NEXT_PUBLIC_USE_API=$NEXT_PUBLIC_USE_API
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["pnpm", "start"]
