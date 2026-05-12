#!/bin/sh
set -e

# Read secrets from Docker secrets files
if [ -f /run/secrets/postgres_password ]; then
  POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
fi

if [ -f /run/secrets/app_user_password ]; then
  APP_USER_PASSWORD=$(cat /run/secrets/app_user_password)
fi

# Build database URLs from secrets
export DATABASE_URL="postgresql://app_user:${APP_USER_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
export DIRECT_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"

exec "$@"
