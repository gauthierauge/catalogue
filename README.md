# Catalogue

API de gestion de catalogue produits, construite avec NestJS, Prisma et PostgreSQL.

## Stack technique

- **Runtime** : Node.js 20
- **Framework** : NestJS 11
- **ORM** : Prisma 7 (PostgreSQL)
- **Tests** : Vitest + Supertest
- **Linting** : oxlint
- **Infra** : Docker Compose

## Structure du projet

```
catalogue/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── prisma/       # Module Prisma (service + module)
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test/
│   │   ├── e2e/          # Tests end-to-end
│   │   └── smoke/        # Smoke tests
│   └── prisma/
│       └── schema.prisma
├── docker/
│   ├── backend/Dockerfile
│   └── docker-compose.yaml
└── Makefile
```

## Prérequis

- Node.js >= 20
- Docker & Docker Compose

## Installation

```bash
# Copier les fichiers d'environnement
cp docker/.env.example docker/.env
cp backend/.env.example backend/.env

# Installer les dépendances
make install

# Lancer PostgreSQL
make up

# Générer le client Prisma
make prisma-generate

# Appliquer les migrations
make prisma-migrate name=init
```

## Lancement

```bash
# Dev local (sans Docker)
make dev

# Avec Docker (backend + PostgreSQL)
make up-build
```

L'API est accessible sur `http://localhost:3000`.

## Tests

```bash
make test          # Tests unitaires
make test-e2e      # Tests end-to-end
make test-smoke    # Smoke tests
make test-cov      # Tests unitaires avec couverture
```

## Commandes disponibles

```bash
make help
```

| Commande | Description |
|---|---|
| `make up` | Lancer les conteneurs |
| `make up-build` | Build + lancer les conteneurs |
| `make down` | Stopper les conteneurs |
| `make down-v` | Stopper + supprimer les volumes |
| `make logs` | Logs de tous les conteneurs |
| `make dev` | Lancer le backend en mode dev |
| `make build` | Build le backend |
| `make lint` | Linter le code |
| `make test` | Tests unitaires |
| `make test-e2e` | Tests E2E |
| `make test-smoke` | Smoke tests |
| `make prisma-generate` | Générer le client Prisma |
| `make prisma-migrate` | Créer/appliquer une migration |
| `make prisma-studio` | Ouvrir Prisma Studio |

## Variables d'environnement

### `docker/.env`

| Variable | Description | Défaut |
|---|---|---|
| `POSTGRES_USER` | Utilisateur PostgreSQL | `catalogue` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `changeme` |
| `POSTGRES_DB` | Nom de la base | `catalogue` |
| `POSTGRES_PORT` | Port exposé | `5432` |

### `backend/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
