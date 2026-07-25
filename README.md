# Ommidraai
verken saam

## Overview
lorem ipsum

## Setup
1. Set up docker on your system
2. Run from the project root:
```bash
docker compose build
```

## Development
Run from project root:
```bash
docker compose \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    up --build
```

## Deployment
Run from project root:
```bash
docker compose up
```