DOCKER_COMPOSE = docker compose -f docker/docker-compose.yaml --env-file docker/.env

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
	cd backend && npm install

dev: ## Start backend in dev mode (local, no Docker)
	cd backend && npm run start:dev

build: ## Build backend
	cd backend && npm run build

lint: ## Lint backend code
	cd backend && npm run lint

lint-fix: ## Lint and auto-fix backend code
	cd backend && npm run format

## ——— Tests ————————————————————————————————————————

test: ## Run unit tests
	cd backend && npm test

test-watch: ## Run unit tests in watch mode
	cd backend && npm run test:watch

test-cov: ## Run unit tests with coverage
	cd backend && npm run test:cov

test-e2e: ## Run e2e tests
	cd backend && npm run test:e2e

test-smoke: ## Run smoke tests
	cd backend && npm run test:smoke

## ——— Prisma ———————————————————————————————————————

prisma-generate: ## Generate Prisma client
	cd backend && npx prisma generate

prisma-migrate: ## Create and apply a migration (usage: make prisma-migrate name=init)
	cd backend && npx prisma migrate dev --name $(name)

prisma-studio: ## Open Prisma Studio
	cd backend && npx prisma studio

prisma-seed: ## Seed the database
	cd backend && npx prisma db seed

## ——— Help —————————————————————————————————————————

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
.PHONY: up up-build down down-v logs logs-backend ps restart install dev build lint lint-fix test test-watch test-cov test-e2e test-smoke prisma-generate prisma-migrate prisma-studio prisma-seed help
