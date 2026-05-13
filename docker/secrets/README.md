# Docker Secrets

Les mots de passe sont gérés via Docker Secrets et montés en lecture seule dans `/run/secrets/` à l'intérieur des conteneurs.

## Setup

Copier les fichiers exemples et remplacer les valeurs :

```bash
cd docker/secrets
for f in *.example; do cp "$f" "${f%.example}"; done
```

Ou générer des mots de passe aléatoires :

```bash
cd docker/secrets
openssl rand -hex 32 > postgres_password.txt
openssl rand -hex 32 > app_user_password.txt
```

> **Important** : utiliser uniquement des caractères alphanumériques (hex, base32...) pour éviter les problèmes d'encodage dans les URLs de connexion PostgreSQL.

## Fichiers

| Fichier | Utilisé par | Description |
|---------|-------------|-------------|
| `postgres_password.txt` | PostgreSQL | Mot de passe du superuser |
| `app_user_password.txt` | Backend + PostgreSQL | Mot de passe du rôle `app_user` (CRUD) |

## Sécurité

- Les fichiers `*.txt` sont ignorés par git (voir `.gitignore`)
- Seuls les fichiers `*.example` sont versionnés
- Ne jamais commit de vrais mots de passe
