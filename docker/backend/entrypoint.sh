#!/bin/sh
set -e

# Read secrets from Docker secrets files
if [ -f /run/secrets/app_user_password ]; then
  APP_USER_PASSWORD=$(cat /run/secrets/app_user_password)
fi

if [ -f /run/secrets/migrator_password ]; then
  MIGRATOR_PASSWORD=$(cat /run/secrets/migrator_password)
fi

# DATABASE_URL : utilisé par Prisma Client en runtime (app_user = CRUD uniquement)
export DATABASE_URL="postgresql://app_user:${APP_USER_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

# DIRECT_URL : utilisé par Prisma Migrate (migrator = DDL complet)
export DIRECT_URL="postgresql://migrator:${MIGRATOR_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

exec "$@"
