#!/bin/bash
# deploy-prod.sh
# Script untuk deployment production Maroon-NET BCMS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT="production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/maroonnet/production/${TIMESTAMP}"
LOG_FILE="/var/log/maroonnet/deploy_${TIMESTAMP}.log"

# Log function
log() {
    local level=$1
    local message=$2
    local color=$NC
    
    case $level in
        "INFO") color=$BLUE ;;
        "SUCCESS") color=$GREEN ;;
        "WARNING") color=$YELLOW ;;
        "ERROR") color=$RED ;;
    esac
    
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${level}: ${message}${NC}" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error_exit "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error_exit "Docker Compose is not installed"
    fi
    
    # Check disk space
    local free_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$free_space" -lt 5242880 ]; then
        error_exit "Insufficient disk space (need at least 5GB free)"
    fi
    
    # Check memory
    local total_mem=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$total_mem" -lt 4096 ]; then
        log "WARNING" "Low memory detected (${total_mem}MB), recommended 8GB+ for production"
    fi
    
    log "SUCCESS" "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "INFO" "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    log "INFO" "Backing up database..."
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U maroon_admin maroon_net_bcms | gzip > "${BACKUP_DIR}/db_backup.sql.gz"
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Database backup created: ${BACKUP_DIR}/db_backup.sql.gz"
    else
        error_exit "Database backup failed"
    fi
    
    # Backup application files
    log "INFO" "Backing up application files..."
    tar -czf "${BACKUP_DIR}/app_backup.tar.gz" \
        --exclude=node_modules \
        --exclude=vendor \
        --exclude=.git \
        --exclude=storage/logs \
        .
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Application backup created: ${BACKUP_DIR}/app_backup.tar.gz"
    else
        error_exit "Application backup failed"
    fi
    
    # Backup environment files
    cp backend/.env "${BACKUP_DIR}/backend.env"
    cp frontend/.env "${BACKUP_DIR}/frontend.env"
    cp docker-compose.prod.yml "${BACKUP_DIR}/docker-compose.prod.yml"
    
    log "SUCCESS" "Backup completed successfully"
}

# Pull latest changes
pull_changes() {
    log "INFO" "Pulling latest changes..."
    
    git fetch origin main
    if [ $? -ne 0 ]; then
        error_exit "Failed to fetch from git"
    fi
    
    git checkout main
    git pull origin main
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Latest changes pulled successfully"
    else
        error_exit "Failed to pull latest changes"
    fi
}

# Update environment files
update_environment() {
    log "INFO" "Updating environment files..."
    
    # Update backend .env
    if [ -f "backend/.env.production" ]; then
        cp backend/.env.production backend/.env
        log "INFO" "Using production environment for backend"
    fi
    
    # Update frontend .env
    if [ -f "frontend/.env.production" ]; then
        cp frontend/.env.production frontend/.env
        log "INFO" "Using production environment for frontend"
    fi
    
    # Set production mode
    sed -i 's/APP_ENV=.*/APP_ENV=production/' backend/.env
    sed -i 's/APP_DEBUG=.*/APP_DEBUG=false/' backend/.env
    
    log "SUCCESS" "Environment files updated"
}

# Build and deploy
build_and_deploy() {
    log "INFO" "Building and deploying services..."
    
    # Stop existing services
    log "INFO" "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Build images
    log "INFO" "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache --pull
    
    if [ $? -ne 0 ]; then
        error_exit "Docker build failed"
    fi
    
    # Start services
    log "INFO" "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Services started successfully"
    else
        error_exit "Failed to start services"
    fi
    
    # Wait for services to be ready
    log "INFO" "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    log "INFO" "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend php artisan migrate --force
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Database migrations completed"
    else
        error_exit "Database migration failed"
    fi
    
    # Clear cache
    log "INFO" "Clearing cache..."
    docker-compose -f docker-compose.prod.yml exec -T backend php artisan config:cache
    docker-compose -f docker-compose.prod.yml exec -T backend php artisan route:cache
    docker-compose -f docker-compose.prod.yml exec -T backend php artisan view:cache
    
    # Restart queue workers
    log "INFO" "Restarting queue workers..."
    docker-compose -f docker-compose.prod.yml exec -T backend php artisan queue:restart
    
    log "SUCCESS" "Build and deployment completed"
}

# Health check
health_check() {
    log "INFO" "Performing health checks..."
    
    local max_retries=10
    local retry_count=0
    local health_check_url="https://billing.maroon-net.id/health"
    
    while [ $retry_count -lt $max_retries ]; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_check_url" || echo "000")
        
        if [ "$status_code" = "200" ]; then
            log "SUCCESS" "Health check passed: HTTP $status_code"
            return 0
        fi
        
        log "WARNING" "Health check failed (attempt $((retry_count + 1))/$max_retries): HTTP $status_code"
        retry_count=$((retry_count + 1))
        sleep 10
    done
    
    error_exit "Health check failed after $max_retries attempts"
}

# Cleanup
cleanup() {
    log "INFO" "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    find /backup/maroonnet/production -type f -mtime +7 -delete
    
    log "SUCCESS" "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    log "INFO" "Sending deployment notification..."
    
    # Send email notification
    if command -v mail &> /dev/null; then
        echo "Deployment Status: $status
        Environment: $ENVIRONMENT
        Timestamp: $(date)
        Message: $message
        Log: $LOG_FILE" | mail -s "Maroon-NET Deployment $status" admin@maroon-net.id
    fi
    
    # Send to monitoring system
    curl -X POST "https://api.maroon-net.id/api/deployments/log" \
        -H "Content-Type: application/json" \
        -d "{
            \"environment\": \"$ENVIRONMENT\",
            \"status\": \"$status\",
            \"timestamp\": \"$(date -Iseconds)\",
            \"message\": \"$message\"
        }" || true
}

# Main deployment process
main() {
    log "INFO" "Starting production deployment..."
    log "INFO" "Backup directory: $BACKUP_DIR"
    log "INFO" "Log file: $LOG_FILE"
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Create backup
    create_backup
    
    # Step 3: Pull changes
    pull_changes
    
    # Step 4: Update environment
    update_environment
    
    # Step 5: Build and deploy
    build_and_deploy
    
    # Step 6: Health check
    health_check
    
    # Step 7: Cleanup
    cleanup
    
    # Step 8: Send success notification
    send_notification "SUCCESS" "Deployment completed successfully"
    
    log "SUCCESS" "Production deployment completed successfully!"
    log "INFO" "Application URL: https://billing.maroon-net.id"
    log "INFO" "API URL: https://api.maroon-net.id"
    log "INFO" "Backup location: $BACKUP_DIR"
    
    exit 0
}

# Error handler
trap 'send_notification "FAILED" "Deployment failed with error"; error_exit "Deployment failed"' ERR

# Run main function
main