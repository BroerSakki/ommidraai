# Ommidraai
verken saam

## Overview
lorem ipsum

## Setup
1. Set up docker on your system
2. Create the environment variables (Open Docker Desktop on Windows):
```bash
cp backend/.env.example backend/.env
```
4. (Optional) Change any values in .env
5. Set up the container
```bash
docker compose build
```
6. Run the container (See Development or Production)
7. Set up database:
```bash
docker compose exec backend alembic upgrade head
```

## Development
Build First:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
Without rebuilding:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```
Run in the background:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```
Rebuild only backend
```bash
docker compose build backend
```
Rebuild only frontend
```bash
docker compose build frontend
```
Stop containers
```bash
docker compose down
```

## Production
Start production stack:
```bash
docker compose up
```
Start production stack in background:
```bash
docker compose up -d
```
Stop the production stack:
```bash
docker compose down
```

## Database (Alembic)
Create a new migration:
```bash
docker compose exec backend alembic revision --autogenerate -m "<migration-description>"
```
Apply all pending migrations:
```bash
docker compose exec backend alembic upgrade head
```
Rollback the latest migration:
```bash
docker compose exec backend alembic downgrade -1
```
Show the current migration:
```bash
docker compose exec backend alembic current
```
Show migration history
```bash
docker compose exec backend alembic history
```