FROM node:22-alpine AS base
# Ensure bash and curl are available for devcontainer features (git-lfs, scripts that expect bash)
RUN apk add --no-cache git bash curl python3 make g++
WORKDIR /usr/src/app
RUN npm i -g pnpm

# ---- Prod Dependencies Stage ----
FROM base AS prod_dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---- Builder Stage ----
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ---- Development Stage ----
FROM base AS development
ENV PATH /usr/src/app/node_modules/.bin:$PATH
WORKDIR /usr/src/app
CMD ["tail", "-f", "/dev/null"]

# ---- Production Stage ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=prod_dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY package.json .

EXPOSE 3000

CMD ["node", "dist/main"]
