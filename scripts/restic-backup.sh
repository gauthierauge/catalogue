#!/bin/sh
#
# restic-backup.sh — Copie hors site chiffrée des backups vers Backblaze B2
#
# Attend les variables d'environnement suivantes :
#   RESTIC_REPOSITORY  (ex: b2:mon-bucket)
#   RESTIC_PASSWORD    (clé de chiffrement du repo)
#   B2_ACCOUNT_ID      (Backblaze account ID)
#   B2_ACCOUNT_KEY     (Backblaze application key)
#   HEALTHCHECK_URL    (optionnel, URL Healthchecks.io à ping)
#
# Usage : ce script est exécuté par le conteneur db-backup-offsite.
#         Il peut aussi être lancé manuellement :
#         docker exec catalogue-db-backup-offsite /scripts/restic-backup.sh
#
set -e

echo "=== Restic offsite backup — $(date -Iseconds) ==="

# --- Ping healthcheck /start si configuré ---
if [ -n "$HEALTHCHECK_URL" ]; then
    wget -q -O /dev/null "$HEALTHCHECK_URL/start" 2>/dev/null || true
fi

# --- Gestion d'erreur : ping /fail en cas de problème ---
on_failure() {
    echo "ERREUR : le backup offsite a échoué."
    if [ -n "$HEALTHCHECK_URL" ]; then
        wget -q -O /dev/null "$HEALTHCHECK_URL/fail" 2>/dev/null || true
    fi
}
trap on_failure ERR

# --- 1. Init du repo si nécessaire (idempotent) ---
echo "Vérification du repo restic..."
if ! restic snapshots --quiet > /dev/null 2>&1; then
    echo "Repo inexistant, initialisation..."
    restic init
    echo "Repo initialisé."
else
    echo "Repo existant, OK."
fi

# --- 2. Backup des dumps locaux ---
echo "Lancement du backup..."
restic backup /data --tag daily --verbose
echo "Backup terminé."

# --- 3. Rétention : purge des anciens snapshots ---
echo "Application de la politique de rétention..."
restic forget \
    --keep-daily 7 \
    --keep-weekly 4 \
    --keep-monthly 12 \
    --prune
echo "Rétention appliquée."

# --- 4. Vérification d'intégrité ---
echo "Vérification d'intégrité du repo..."
restic check
echo "Intégrité OK."

# --- 5. Ping healthcheck /success ---
if [ -n "$HEALTHCHECK_URL" ]; then
    wget -q -O /dev/null "$HEALTHCHECK_URL" 2>/dev/null || true
fi

echo "=== Backup offsite terminé avec succès — $(date -Iseconds) ==="
