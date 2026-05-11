FROM oven/bun:1-alpine AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate
RUN bun run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/package.json /app/bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile --production

COPY --from=base /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main/main"]
