.PHONY: help build up down restart logs clean dev dev-up dev-down prod prod-up prod-down

# Default target
help:
	@echo "Available commands:"
	@echo "  make build       - Build all Docker images"
	@echo "  make up          - Start all services (production)"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make clean       - Remove all containers, volumes, and images"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start services in development mode"
	@echo "  make dev-up      - Start development services in detached mode"
	@echo "  make dev-down    - Stop development services"
	@echo "  make dev-logs    - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod        - Start services in production mode"
	@echo "  make prod-up     - Start production services in detached mode"
	@echo "  make prod-down   - Stop production services"
	@echo "  make prod-logs   - View production logs"

# Production commands
build:
	docker-compose build

up:
	docker-compose up

prod:
	docker-compose up --build

prod-up:
	docker-compose up -d --build

prod-down:
	docker-compose down

prod-logs:
	docker-compose logs -f

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up --build

dev-up:
	docker-compose -f docker-compose.dev.yml up -d --build

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Common commands
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all

# Database commands
db-migrate:
	docker exec -it nestjs-backend npx prisma migrate dev

db-studio:
	docker exec -it nestjs-backend npx prisma studio

db-seed:
	docker exec -it nestjs-backend npx prisma db seed

# Container access
backend-shell:
	docker exec -it nestjs-backend sh

frontend-shell:
	docker exec -it react-frontend sh

mysql-shell:
	docker exec -it mysql-db mysql -u root -proot react_nest_app

