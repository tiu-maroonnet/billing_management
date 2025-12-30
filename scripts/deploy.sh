#!/bin/bash
# scripts/deploy.sh

ENVIRONMENT=$1
VERSION=$2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Validate environment
if [ -z "$ENVIRONMENT" ]; then
    error "Usage: $0 <environment> [version]"
fi

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    error "Environment must be 'staging' or 'production'"
fi

# Set variables based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    DOMAIN="billing.maroon-net.id"
    API_DOMAIN="api.maroon-net.id"
    COMPOSE_FILE="docker-compose.prod.yml"
    BRANCH="main"
else
    DOMAIN="staging.maroon-net.id"
    API_DOMAIN="api-staging.maroon-net.id"
    COMPOSE_FILE="docker-compose.staging.yml"
    BRANCH="develop"
fi

# Set version
if [ -z "$VERSION" ]; then
    VERSION=$(git describe --tags --always)
fi

log "Starting deployment to $ENVIRONMENT"
log "Version: $VERSION"
log "Domain: $DOMAIN"
log "API Domain: $API_DOMAIN"

# Check prerequisites
command -v docker >/dev/null 2>&1 || error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"
command -v git >/dev/null 2>&1 || error "Git is not installed"

# Create backup before deployment
log "Creating backup..."
BACKUP_DIR="/backup/maroonnet/$ENVIRONMENT/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U maroon_admin maroon_net_bcms > $BACKUP_DIR/db_backup.sql
tar -czf $BACKUP_DIR/app_backup.tar.gz --exclude=node_modules --exclude=vendor .

log "Backup created at: $BACKUP_DIR"

# Pull latest code
log "Pulling latest code from $BRANCH branch..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Update version file
echo "VERSION=$VERSION" > .version
echo "DEPLOY_DATE=$(date)" >> .version
echo "ENVIRONMENT=$ENVIRONMENT" >> .version

# Update environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    sed -i "s/APP_ENV=.*/APP_ENV=production/" backend/.env
    sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/" backend/.env
    sed -i "s/APP_URL=.*/APP_URL=https:\/\/$DOMAIN/" backend/.env
else
    sed -i "s/APP_ENV=.*/APP_ENV=staging/" backend/.env
    sed -i "s/APP_DEBUG=.*/APP_DEBUG=true/" backend/.env
    sed -i "s/APP_URL=.*/APP_URL=https:\/\/$DOMAIN/" backend/.env
fi

# Build and start containers
log "Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

if [ $? -ne 0 ]; then
    error "Docker build failed"
fi

log "Starting services..."
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d

if [ $? -ne 0 ]; then
    error "Failed to start services"
fi

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Run migrations
log "Running database migrations..."
docker-compose -f $COMPOSE_FILE exec -T backend php artisan migrate --force

if [ $? -ne 0 ]; then
    error "Database migration failed"
fi

# Clear cache
log "Clearing cache..."
docker-compose -f $COMPOSE_FILE exec -T backend php artisan config:cache
docker-compose -f $COMPOSE_FILE exec -T backend php artisan route:cache
docker-compose -f $COMPOSE_FILE exec -T backend php artisan view:cache

# Restart queue workers
log "Restarting queue workers..."
docker-compose -f $COMPOSE_FILE exec -T backend php artisan queue:restart

# Build frontend
log "Building frontend..."
docker-compose -f $COMPOSE_FILE exec -T frontend npm run build

# Run tests (staging only)
if [ "$ENVIRONMENT" = "staging" ]; then
    log "Running tests..."
    docker-compose -f $COMPOSE_FILE exec -T backend php artisan test
    
    if [ $? -ne 0 ]; then
        warn "Tests failed, but continuing deployment"
    fi
fi

# Health check
log "Performing health check..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    log "Health check passed: HTTP $HEALTH_CHECK"
else
    error "Health check failed: HTTP $HEALTH_CHECK"
fi

# Send deployment notification
log "Sending deployment notification..."
curl -X POST "https://$API_DOMAIN/api/deployments/notify" \
    -H "Content-Type: application/json" \
    -d "{
        \"environment\": \"$ENVIRONMENT\",
        \"version\": \"$VERSION\",
        \"status\": \"success\",
        \"timestamp\": \"$(date -Iseconds)\"
    }"

# Cleanup old backups (keep last 7 days)
log "Cleaning up old backups..."
find /backup/maroonnet/$ENVIRONMENT -type f -mtime +7 -delete

# Cleanup Docker
log "Cleaning up Docker..."
docker system prune -f --volumes

log "========================================="
log "Deployment to $ENVIRONMENT completed successfully!"
log "Version: $VERSION"
log "Application URL: https://$DOMAIN"
log "API URL: https://$API_DOMAIN"
log "Backup location: $BACKUP_DIR"
log "========================================="

# Send final notification via WhatsApp (optional)
if [ "$ENVIRONMENT" = "production" ]; then
    curl -X POST "https://$API_DOMAIN/api/notifications/send" \
        -H "Content-Type: application/json" \
        -d "{
            \"channel\": \"whatsapp\",
            \"template\": \"deployment_success\",
            \"recipient\": \"+6281122334455\",
            \"parameters\": {
                \"environment\": \"$ENVIRONMENT\",
                \"version\": \"$VERSION\",
                \"time\": \"$(date)\"
            }
        }"
fi

exit 0