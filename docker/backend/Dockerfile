FROM oven/bun:1-alpine AS base

WORKDIR /app

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/ .
RUN chmod +x entrypoint.sh && mv entrypoint.sh /usr/local/bin/

RUN bunx prisma generate

FROM base AS dev

EXPOSE 8002
ENTRYPOINT ["entrypoint.sh"]
CMD ["bun", "run", "start:dev"]

FROM base AS build

RUN bun run build

FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json /app/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
COPY --from=base /usr/local/bin/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 8002

ENTRYPOINT ["entrypoint.sh"]
CMD ["bun", "run", "dist/main/main"]
