#!/bin/bash
# =============================================================================
# 02-monitoring-role.sh — Création du rôle monitoring (lecture métriques only)
# =============================================================================
# pg_monitor est un rôle prédéfini Postgres qui donne accès en lecture seule
# aux vues système (pg_stat_activity, pg_stat_database, etc.) sans aucun
# droit sur les données applicatives.

set -e

MONITORING_PASSWORD=$(cat /run/secrets/monitoring_password)

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER monitoring WITH
    PASSWORD '$MONITORING_PASSWORD'
    CONNECTION LIMIT 5;

  GRANT pg_monitor TO monitoring;
EOSQL
