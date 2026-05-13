#!/bin/bash
# =============================================================================
# 01-roles.sh — Création des rôles applicatifs (app_user + migrator)
# =============================================================================
# Exécuté automatiquement par le conteneur Postgres à la première création
# du volume (docker-entrypoint-initdb.d).
#
# Les mots de passe sont lus depuis Docker secrets (/run/secrets/).
# Ce script tourne en local socket en tant que superuser (catalogue_admin),
# donc pas besoin de mot de passe ici.

set -e

APP_USER_PASSWORD=$(cat /run/secrets/app_user_password)
MIGRATOR_PASSWORD=$(cat /run/secrets/migrator_password)

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

  -- =========================================================================
  -- app_user : utilisé par l'API NestJS en runtime (CRUD uniquement)
  -- =========================================================================
  CREATE USER app_user WITH
    PASSWORD '$APP_USER_PASSWORD'
    CONNECTION LIMIT 30;

  -- Timeout de 15s pour les requêtes (aucune requête API ne devrait durer plus)
  ALTER USER app_user SET statement_timeout = '15s';

  -- Droits minimaux : connexion + lecture/écriture sur les tables existantes
  GRANT CONNECT ON DATABASE $POSTGRES_DB TO app_user;
  GRANT USAGE ON SCHEMA public TO app_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

  -- Droits par défaut pour les futures tables (créées par migrator)
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO app_user;

  -- =========================================================================
  -- migrator : utilisé par Prisma pour les migrations (DDL complet)
  -- =========================================================================
  CREATE USER migrator WITH
    PASSWORD '$MIGRATOR_PASSWORD'
    CONNECTION LIMIT 5;

  -- Droits complets sur le schéma public (CREATE, ALTER, DROP)
  GRANT CONNECT ON DATABASE $POSTGRES_DB TO migrator;
  GRANT ALL PRIVILEGES ON SCHEMA public TO migrator;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO migrator;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO migrator;

  -- Droits par défaut pour les futures tables
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO migrator;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO migrator;

EOSQL
