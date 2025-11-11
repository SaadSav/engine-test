.PHONY: help up down restart logs build clean ps health

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE := docker-compose
COMPOSE_DEV := $(COMPOSE) -f docker-compose.yml -f docker-compose.override.yml
COMPOSE_PROD := $(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services in development mode
	$(COMPOSE_DEV) up -d

down: ## Stop and remove all containers
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

logs: ## Tail logs from all services
	$(COMPOSE) logs -f

build: ## Build all Docker images
	$(COMPOSE) build --no-cache

clean: ## Remove all containers, volumes, and images
	$(COMPOSE) down -v --rmi all

ps: ## Show status of all services
	$(COMPOSE) ps

health: ## Check health status of all services
	@echo "=== Service Health Status ==="
	@$(COMPOSE) ps | grep -E "(Up|healthy|unhealthy)" || echo "No services running"

prod-up: ## Start services in production mode
	$(COMPOSE_PROD) up -d

prod-down: ## Stop production services
	$(COMPOSE_PROD) down

prod-logs: ## Tail production logs
	$(COMPOSE_PROD) logs -f

shell-app: ## Open shell in app container
	$(COMPOSE) exec app sh

shell-postgres: ## Open psql shell in postgres container
	$(COMPOSE) exec postgres psql -U postgres -d engine_test

shell-redis: ## Open redis-cli in redis container
	$(COMPOSE) exec redis redis-cli

migrate: ## Run database migrations
	$(COMPOSE) exec app npm run migrate

seed: ## Seed database with initial data
	$(COMPOSE) exec app npm run seed

test: ## Run tests
	$(COMPOSE) exec app npm test

lint: ## Run linter
	$(COMPOSE) exec app npm run lint
