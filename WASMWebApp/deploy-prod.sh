#!/bin/bash

echo "Stopping services..."
docker-compose down

echo "Cleaning and rebuilding backend..."
cd backend
mvn clean package -DskipTests
cd ..

echo "Ensuring database is running..."
docker-compose up -d postgresdb

echo "Waiting for database to be ready..."
sleep 5

echo "Restarting services..."
docker-compose up --build -d backend frontend

echo "Pruning dangling images"
docker image prune -f

echo "Deployment complete!"