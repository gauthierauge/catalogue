# Restauration des backups PostgreSQL

Ce document décrit comment restaurer un backup de la base de données `catalogue`.

Les backups sont au format **custom** (`-Fc`) de `pg_dump`, ce qui signifie qu'ils sont compressés et qu'on utilise `pg_restore` (pas `psql`) pour les restaurer.

> **Important** : La version majeure de PostgreSQL utilisée pour la restauration doit correspondre à celle utilisée pour le backup (PostgreSQL 17). Un backup fait avec Postgres 17 ne peut pas être restauré sur Postgres 15, par exemple.

---

## Lister les backups disponibles

Les backups sont stockés dans `docker/bdd/backups/`, organisés par type de rétention :

```bash
# Voir tous les backups disponibles
ls -lhR docker/bdd/backups/

# Structure typique :
# docker/bdd/backups/daily/   -> 7 derniers jours
# docker/bdd/backups/weekly/  -> 4 dernières semaines
# docker/bdd/backups/monthly/ -> 6 derniers mois
```

Le backup le plus récent (quotidien) :

```bash
ls -lt docker/bdd/backups/daily/ | head -5
```

---

## Restauration dans une BDD de test (sans impact sur la prod)

Cette méthode crée une base de données temporaire pour vérifier le contenu du backup. La base de production n'est pas touchée.

```bash
# 1. Choisir le backup à restaurer (exemple : le plus récent)
BACKUP_FILE=$(ls -t docker/bdd/backups/daily/*.dump 2>/dev/null | head -1)
echo "Backup sélectionné : $BACKUP_FILE"

# 2. Copier le backup dans le conteneur postgres
docker cp "$BACKUP_FILE" catalogue-postgres:/tmp/backup.dump

# 3. Créer une BDD temporaire et restaurer
docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  createdb -U "$POSTGRES_USER" catalogue_restore_test'

docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  pg_restore -U "$POSTGRES_USER" -d catalogue_restore_test --no-owner --no-privileges /tmp/backup.dump'

# 4. Vérifier le contenu (exemples)
docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  psql -U "$POSTGRES_USER" -d catalogue_restore_test \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema = '\''public'\'' ORDER BY table_name;"'

# 5. Nettoyer
docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  dropdb -U "$POSTGRES_USER" catalogue_restore_test'

docker exec catalogue-postgres rm /tmp/backup.dump
```

---

## Restauration en remplacement de la BDD actuelle

> **ATTENTION** : Cette procédure **supprime toutes les données actuelles** de la base `catalogue` et les remplace par le contenu du backup. Toutes les données écrites depuis le backup seront perdues.

```bash
# 1. Stopper le backend pour couper les connexions à la BDD
cd docker
docker compose stop backend

# 2. Choisir le backup
BACKUP_FILE=$(ls -t bdd/backups/daily/*.dump 2>/dev/null | head -1)
echo "Backup sélectionné : $BACKUP_FILE"

# 3. Copier le backup dans le conteneur postgres
docker cp "$BACKUP_FILE" catalogue-postgres:/tmp/backup.dump

# 4. Supprimer et recréer la BDD
docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  psql -U "$POSTGRES_USER" -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\''catalogue'\'' AND pid <> pg_backend_pid();"'

docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  dropdb -U "$POSTGRES_USER" catalogue'

docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  createdb -U "$POSTGRES_USER" catalogue'

# 5. Restaurer le backup
docker exec catalogue-postgres sh -c '\
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  pg_restore -U "$POSTGRES_USER" -d catalogue --no-owner --no-privileges /tmp/backup.dump'

# 6. Recréer le user applicatif (ses permissions sont dans le init script)
docker exec catalogue-postgres sh -c '\
  APP_USER_PASSWORD=$(cat /run/secrets/app_user_password) && \
  PGPASSWORD=$(cat /run/secrets/postgres_password) \
  psql -U "$POSTGRES_USER" -d catalogue -c "
    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '\''app_user'\'') THEN
        CREATE USER app_user WITH PASSWORD '\''${APP_USER_PASSWORD}'\'';
      END IF;
    END \$\$;
    GRANT CONNECT ON DATABASE catalogue TO app_user;
    GRANT USAGE ON SCHEMA public TO app_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
  "'

# 7. Nettoyer et redémarrer
docker exec catalogue-postgres rm /tmp/backup.dump
docker compose start backend

# 8. Vérifier que tout fonctionne
docker compose logs --tail=20 backend
curl -s http://localhost:3000 | head -5
```

---

## Restauration depuis le hors site (Backblaze B2)

En cas de perte totale des backups locaux (panne disque, suppression accidentelle), les dumps sont aussi stockés chiffrés sur Backblaze B2 via restic.

> **CRITIQUE** : Le mot de passe restic (`RESTIC_PASSWORD`) est **indispensable** pour déchiffrer les backups. Sans lui, les données sont irrécupérables. Stocke-le dans un password manager (Bitwarden, 1Password...) **en dehors** du serveur de production.

### Prérequis

Tu as besoin de 4 variables d'environnement. Tu peux les exporter dans ton shell ou créer un fichier `.env` temporaire :

```bash
export B2_ACCOUNT_ID="ton-account-id"
export B2_ACCOUNT_KEY="ta-clé"
export RESTIC_REPOSITORY="b2:nom-du-bucket"
export RESTIC_PASSWORD="ton-mot-de-passe-restic"
```

### Lister les snapshots disponibles

```bash
# Depuis le conteneur (si la stack tourne)
docker exec catalogue-db-backup-offsite restic snapshots

# Ou en local (si restic est installé)
restic snapshots
```

### Récupérer un snapshot dans un dossier local

```bash
# 1. Créer un dossier temporaire pour la restauration
mkdir -p /tmp/restic-restore

# 2. Lister les snapshots pour trouver l'ID voulu
docker exec catalogue-db-backup-offsite restic snapshots

# 3. Restaurer le snapshot (remplacer SNAPSHOT_ID par l'ID ou "latest")
docker exec catalogue-db-backup-offsite restic restore latest --target /tmp/restic-restore

# 4. Copier les dumps restaurés hors du conteneur
docker cp catalogue-db-backup-offsite:/tmp/restic-restore/data/daily/ ./restored-backups/

# 5. Puis suivre la procédure pg_restore classique (section précédente)
#    en pointant BACKUP_FILE vers le .dump récupéré :
BACKUP_FILE=$(ls -t ./restored-backups/*.dump 2>/dev/null | head -1)
docker cp "$BACKUP_FILE" catalogue-postgres:/tmp/backup.dump
# ... suite identique à "Restauration dans une BDD de test" ou "en remplacement"
```

### Restauration en local (sans la stack Docker)

Si le serveur est complètement perdu, tu peux restaurer depuis n'importe quelle machine avec restic installé :

```bash
# Installer restic (macOS)
brew install restic

# Ou Linux
apt install restic  # Debian/Ubuntu

# Exporter les credentials (voir section Prérequis ci-dessus)
# Puis restaurer
restic restore latest --target /tmp/restic-restore

# Les dumps sont dans /tmp/restic-restore/data/daily/
# Restaurer avec pg_restore sur une instance PostgreSQL 17
pg_restore -U catalogue -d catalogue --no-owner --no-privileges /tmp/restic-restore/data/daily/FICHIER.dump
```

---

## Automatiser le test de restauration

Un script `scripts/test-restore.sh` est fourni pour vérifier automatiquement qu'un backup est restaurable :

```bash
./scripts/test-restore.sh
```

Ce script restaure le dernier backup dans une BDD temporaire, vérifie la présence des tables, puis nettoie. Il est idempotent et peut être lancé à tout moment.

---

## Recréer les rôles après restauration

`pg_dump` ne sauvegarde pas les rôles (users). Après une restauration, les rôles `app_user` et `migrator` n'existent plus. Il faut les recréer manuellement :

```bash
# Recréer les rôles (depuis le conteneur postgres)
docker exec catalogue-postgres sh -c '
  APP_USER_PASSWORD=$(cat /run/secrets/app_user_password)
  MIGRATOR_PASSWORD=$(cat /run/secrets/migrator_password)
  psql -U "$POSTGRES_USER" -d catalogue <<-SQL
    CREATE USER app_user WITH PASSWORD '"'"'${APP_USER_PASSWORD}'"'"' CONNECTION LIMIT 30;
    ALTER USER app_user SET statement_timeout = '"'"'15s'"'"';
    GRANT CONNECT ON DATABASE catalogue TO app_user;
    GRANT USAGE ON SCHEMA public TO app_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

    CREATE USER migrator WITH PASSWORD '"'"'${MIGRATOR_PASSWORD}'"'"' CONNECTION LIMIT 5;
    GRANT CONNECT ON DATABASE catalogue TO migrator;
    GRANT ALL PRIVILEGES ON SCHEMA public TO migrator;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO migrator;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO migrator;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO migrator;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO migrator;
SQL
'
```

> **Alternative** : si tu fais `docker compose down -v && docker compose up -d`, les init scripts (`01-roles.sh`) recréent automatiquement les rôles. Mais cela recrée aussi le volume Postgres (données vierges), donc il faut restaurer le backup ensuite.

---

## Notes

- **Rétention GFS** : 7 quotidiens + 4 hebdomadaires + 6 mensuels. Les backups plus anciens sont supprimés automatiquement.
- **Format** : Custom (`-Fc`), compressé. Utiliser `pg_restore`, pas `psql`.
- **Compatibilité** : Les backups sont faits avec PostgreSQL 17. La restauration doit se faire sur la même version majeure (17.x).
- **Permissions** : Le dossier `docker/bdd/backups/` est en `chmod 700`. Les dumps contiennent toutes les données de la BDD.
- **Rôles** : Les rôles `app_user` et `migrator` ne sont PAS inclus dans les dumps `pg_dump`. Ils doivent être recréés après restauration (voir section ci-dessus).
