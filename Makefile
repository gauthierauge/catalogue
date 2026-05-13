DOCKER_COMPOSE = docker compose -f docker/docker-compose.yaml --env-file docker/.env
DOCKER_COMPOSE_DEV = $(DOCKER_COMPOSE) -f docker/docker-compose.override.yaml

## ——— Docker ———————————————————————————————————————

up: ## Start all containers
	$(DOCKER_COMPOSE) up -d

up-build: ## Build and start all containers
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop all containers
	$(DOCKER_COMPOSE) down

down-v: ## Stop all containers and remove volumes
	$(DOCKER_COMPOSE) down -v

logs: ## Show container logs (follow)
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Show backend logs (follow)
	$(DOCKER_COMPOSE) logs -f backend

ps: ## List running containers
	$(DOCKER_COMPOSE) ps

restart: ## Restart all containers
	$(DOCKER_COMPOSE) restart

## ——— Backend ——————————————————————————————————————

install: ## Install backend dependencies
	cd backend && bun install

dev: ## Start containers in dev mode with hot reload
	$(DOCKER_COMPOSE) down && \
	$(DOCKER_COMPOSE_DEV) up -d --build

build: ## Build backend
	cd backend && bun run build

lint: ## Lint backend code
	cd backend && bun run lint

lint-fix: ## Lint and auto-fix backend code
	cd backend && bun run format

## ——— Tests ————————————————————————————————————————

test: ## Run unit tests
	cd backend && bun run test

test-watch: ## Run unit tests in watch mode
	cd backend && bun run test:watch

test-cov: ## Run unit tests with coverage
	cd backend && bun run test:cov

test-e2e: ## Run e2e tests
	cd backend && bun run test:e2e

test-smoke: ## Run smoke tests
	cd backend && bun run test:smoke

## ——— Prisma ———————————————————————————————————————

prisma-generate: ## Generate Prisma client
	cd backend && bunx prisma generate

prisma-migrate: ## Create and apply a migration (usage: make prisma-migrate name=init)
	cd backend && bunx prisma migrate dev --name $(name)

prisma-studio: ## Open Prisma Studio
	cd backend && bunx prisma studio

prisma-seed: ## Seed the database
	cd backend && bunx prisma db seed

## ——— Help —————————————————————————————————————————

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
.PHONY: up up-build down down-v logs logs-backend ps restart install dev build lint lint-fix test test-watch test-cov test-e2e test-smoke prisma-generate prisma-migrate prisma-studio prisma-seed help
