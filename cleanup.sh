#!/bin/bash
echo "Down Docker..."
docker-compose down

# Pruning Docker networks
echo "Pruning Docker networks..."
docker network prune -f

# Removing Docker images
echo "Removing Docker images..."
docker image prune -a -f

# Removing Docker volumes
echo "Removing Docker volumes..."
docker volume prune -f

# Removing specific directories and files
echo "Removing backend/core, backend/transcendence, and backend/manage.py..."
sudo rm -rf backend/core backend/transcendence backend/manage.py

echo "All tasks completed."
