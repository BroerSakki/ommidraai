# Ommidraai
verken saam

## Overview
lorem ipsum

## Setup
1. Set up docker on your system
2. Create the environment variables (Start Docker Desktop on Windows):
```bash
cp backend/.env.example backend/.env
```
4. (Optional) Change any values in .env
5. Set up the container
```bash
docker compose build
```
6. Start container (See Development or Production)
7. Set up database:
```bash
docker compose exec backend alembic upgrade head
```

## Development
Run from project root:
### Linux
Build First
```bash
docker compose -f docker-compose.yml -f docker-compose.linux.dev.yml up --build
```
Without rebuilding
```bash
docker compose -f docker-compose.yml -f docker-compose.linux.dev.yml up
```
Run in the background
```bash
docker compose -f docker-compose.yml -f docker-compose.linux.dev.yml up -d
```
Rebuild backend
```bash
docker compose build backend
```
Rebuild frontend
```bash
docker compose build frontend
```
Stop containers
```bash
docker compose down
```
### Windows
Build First
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml up --build --watch
```
Without rebuilding
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml up --watch
```
Run in the background
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml up -d
```
then enable watch (Optional)
```bash
docker compose -f docker-compose.yml -f docker-compose.windows.dev.yml watch
```
Rebuild backend
```bash
docker compose build backend
```
Rebuild frontend
```bash
docker compose build frontend
```
Stop containers
```bash
docker compose down
```

## Production
Start production stack
```bash
docker compose up -d
```
Stop the production stack
```bash
docker compose down
```

## Database (Alembic)
Create a new migration
```bash
docker compose exec backend alembic revision --autogenerate -m "<migration-description>"
```
Apply all pending migrations
```bash
docker compose exec backend alembic upgrade head
```
Rollback the latest migration
```bash
docker compose exec backend alembic downgrade -1
```
Show the current migration
```bash
docker compose exec backend alembic current
```
Show migration history
```bash
docker compose exec backend alembic history
```

# OSRM Setup

## Create the local OSRM folders
From the project root, create the two static folders that hold the raw extract and generated routing files:
```bash
mkdir -p ./osrm/data ./osrm/processed
```

## Setup
### Setup for Linux
If you are using Git Bash or another Unix-like shell on Windows, the equivalent Linux-style command is:
```bash
bash ./scripts/setup-osrm.sh "https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf"
```
Replace the url with the desired map data city

### Setup for Windows
From the project root, run the fully Windows-compatible setup script:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-osrm.ps1 -Url "https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf"
```
Replace the url with the desired map data city