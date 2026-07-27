# Ommidraai
verken saam

## Overview
lorem ipsum

## Setup
1. Set up docker on your system
2. Create the environment variables:
```bash
cp backend/.env.example backend/.env
```
5. (Optional) Change any values in .env
4. Set up the container
```bash
docker compose build
```

## Development
Run from project root:
### Linux
1. Build First:
```bash
docker compose \
    -f docker-compose.yml \
    -f docker-compose.linux.dev.yml \
    up --build
```
2. Without rebuilding:
```bash
docker compose \
    -f docker-compose.yml \
    -f docker-compose.linux.dev.yml \
    up
```
3. Run in the background:
```bash
docker compose \
    -f docker-compose.yml \
    -f docker-compose.linux.dev.yml \
    up -d
```
4. Rebuild single services:
```bash
docker compose build backend
```
or
```bash
docker compose build frontend
```
5. Stop containers
```bash
docker compose down
```
### Windows
1. Build First:
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml up --build --watch
```
2. Without rebuilding:
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml up --watch
```
3. Run in the background:
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml up -d
```
then enable watch (Optional)
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml watch
```
4. Rebuild single services:
```bash
docker compose build backend
```
or
```bash
docker compose build frontend
```
5. Stop containers
```bash
docker compose down
```

## Production
Run from project root:
1. Start production stack:
```bash
docker compose up -d
```
2. Stop the production stack:
```bash
docker compose down
```

## Database (Alembic)
Run from project root:
1. Create a new migration:
```bash
docker compose exec backend alembic revision --autogenerate -m "<migration-description>"
```
2. Apply all pending migrations:
```bash
docker compose exec backend alembic upgrade head
```
3. Rollback the latest migration:
```bash
docker compose exec backend alembic downgrade -1
```
4. Show the current migration:
```bash
docker compose exec backend alembic current
```
5. Show migration history
```bash
docker compose exec backend alembic history
```