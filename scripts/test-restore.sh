#!/usr/bin/env bash
#
# test-restore.sh — Vérifie qu'un backup PostgreSQL est restaurable
#
# Ce script :
# 1. Trouve le backup quotidien le plus récent
# 2. Le restaure dans une BDD temporaire (catalogue_restore_test)
# 3. Lance des vérifications de base (tables existantes, nombre)
# 4. Supprime la BDD temporaire
#
# Usage : ./scripts/test-restore.sh
# Exit code : 0 = OK, 1 = KO
#
set -euo pipefail

CONTAINER="catalogue-postgres"
TEST_DB="catalogue_restore_test"
BACKUP_DIR="docker/bdd/backups/daily"
DUMP_FILE_CONTAINER="/tmp/restore_test.dump"

# --- Couleurs ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${YELLOW}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; }

# --- Nettoyage garanti en sortie ---
cleanup() {
    info "Nettoyage..."
    docker exec "$CONTAINER" sh -c "
        PGPASSWORD=\$(cat /run/secrets/postgres_password) \
        dropdb -U \"\$POSTGRES_USER\" --if-exists $TEST_DB 2>/dev/null
    " || true
    docker exec "$CONTAINER" rm -f "$DUMP_FILE_CONTAINER" 2>/dev/null || true
}
trap cleanup EXIT

# --- 1. Trouver le dernier backup ---
info "Recherche du dernier backup dans $BACKUP_DIR..."

BACKUP_FILE=$(find "$BACKUP_DIR" -name "*.dump" -type f 2>/dev/null | sort -r | head -1)

if [ -z "$BACKUP_FILE" ]; then
    # Essayer aussi le format sql.gz au cas où
    BACKUP_FILE=$(find "$BACKUP_DIR" -name "*.sql.gz" -o -name "*.dump" -o -name "*.custom" -type f 2>/dev/null | sort -r | head -1)
fi

if [ -z "$BACKUP_FILE" ]; then
    fail "Aucun backup trouvé dans $BACKUP_DIR"
    exit 1
fi

ok "Backup trouvé : $BACKUP_FILE"

# --- 2. Copier le backup dans le conteneur ---
info "Copie du backup dans le conteneur $CONTAINER..."
docker cp "$BACKUP_FILE" "$CONTAINER:$DUMP_FILE_CONTAINER"
ok "Backup copié"

# --- 3. Supprimer la BDD de test si elle existe (idempotence) ---
info "Suppression de la BDD de test si elle existe..."
docker exec "$CONTAINER" sh -c "
    PGPASSWORD=\$(cat /run/secrets/postgres_password) \
    dropdb -U \"\$POSTGRES_USER\" --if-exists $TEST_DB
"

# --- 4. Créer la BDD de test ---
info "Création de la BDD temporaire '$TEST_DB'..."
docker exec "$CONTAINER" sh -c "
    PGPASSWORD=\$(cat /run/secrets/postgres_password) \
    createdb -U \"\$POSTGRES_USER\" $TEST_DB
"
ok "BDD temporaire créée"

# --- 5. Restaurer le backup ---
info "Restauration du backup (pg_restore)..."
docker exec "$CONTAINER" sh -c "
    PGPASSWORD=\$(cat /run/secrets/postgres_password) \
    pg_restore -U \"\$POSTGRES_USER\" -d $TEST_DB --no-owner --no-privileges $DUMP_FILE_CONTAINER
"
ok "Restauration terminée"

# --- 6. Vérifications ---
info "Vérifications de cohérence..."

# Compter les tables dans le schéma public
TABLE_COUNT=$(docker exec "$CONTAINER" sh -c "
    PGPASSWORD=\$(cat /run/secrets/postgres_password) \
    psql -U \"\$POSTGRES_USER\" -d $TEST_DB -t -A \
    -c \"SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';\"
")

TABLE_COUNT=$(echo "$TABLE_COUNT" | tr -d '[:space:]')

if [ "$TABLE_COUNT" -gt 0 ] 2>/dev/null; then
    ok "Nombre de tables trouvées : $TABLE_COUNT"
else
    fail "Aucune table trouvée dans le backup restauré (count=$TABLE_COUNT)"
    exit 1
fi

# Lister les tables
info "Tables présentes :"
docker exec "$CONTAINER" sh -c "
    PGPASSWORD=\$(cat /run/secrets/postgres_password) \
    psql -U \"\$POSTGRES_USER\" -d $TEST_DB -t -A \
    -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;\"
" | while read -r table; do
    echo "         - $table"
done

# Vérifier que _prisma_migrations existe (signe que Prisma a initialisé la BDD)
HAS_MIGRATIONS=$(docker exec "$CONTAINER" sh -c "
    PGPASSWORD=\$(cat /run/secrets/postgres_password) \
    psql -U \"\$POSTGRES_USER\" -d $TEST_DB -t -A \
    -c \"SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations');\"
")

HAS_MIGRATIONS=$(echo "$HAS_MIGRATIONS" | tr -d '[:space:]')

if [ "$HAS_MIGRATIONS" = "t" ]; then
    ok "Table _prisma_migrations présente (Prisma OK)"
else
    info "Table _prisma_migrations absente (la BDD n'a peut-être pas encore de migrations)"
fi

# --- Résultat ---
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  RESTORE TEST : OK${NC}"
echo -e "${GREEN}  Backup : $BACKUP_FILE${NC}"
echo -e "${GREEN}  Tables restaurées : $TABLE_COUNT${NC}"
echo -e "${GREEN}========================================${NC}"
exit 0
