FROM oven/bun:1-alpine AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

FROM base AS dev

EXPOSE 8002
CMD ["bun", "run", "start:dev"]

FROM base AS build

RUN bun run build

FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json /app/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated

EXPOSE 8002

CMD ["bun", "run", "dist/main/main"]