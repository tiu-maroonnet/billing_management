#!/bin/bash

echo "🔍 Maroon-NET BCMS Health Check"
echo "================================"

# Check Docker containers
echo "1. Checking Docker containers..."
docker-compose ps

# Check database connection
echo "2. Testing database connection..."
docker-compose exec postgres pg_isready -U maroonnet_admin

# Check Redis connection
echo "3. Testing Redis connection..."
docker-compose exec redis redis-cli ping

# Check backend API
echo "4. Testing backend API..."
curl -f http://localhost:8000/api/auth/me -H "Authorization: Bearer test" || echo "API check failed"

# Check disk space
echo "5. Checking disk space..."
df -h /var/www/maroonnet

# Check logs for errors
echo "6. Checking recent errors..."
docker-compose logs --tail=50 | grep -i error | tail -10

echo "✅ Health check completed!"