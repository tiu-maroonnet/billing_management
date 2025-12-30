#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/maroonnet"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/maroonnet/backup_$DATE.log"

# Create backup directory
mkdir -p $BACKUP_DIR
mkdir -p /var/log/maroonnet

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Start backup
log "Starting Maroon-NET backup..."

# Backup database
log "Backing up database..."
docker-compose exec -T postgres pg_dump -U maroon_admin maroon_net_bcms | gzip > $BACKUP_DIR/db_$DATE.sql.gz

if [ $? -eq 0 ]; then
    log "Database backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
else
    log "ERROR: Database backup failed!"
    exit 1
fi

# Backup application files
log "Backing up application files..."
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
    backend/app \
    backend/config \
    backend/database \
    backend/bootstrap \
    frontend/src \
    frontend/public \
    docker \
    scripts \
    --exclude=node_modules \
    --exclude=vendor \
    --exclude=storage/logs

if [ $? -eq 0 ]; then
    log "Application backup completed: $BACKUP_DIR/app_$DATE.tar.gz"
else
    log "ERROR: Application backup failed!"
    exit 1
fi

# Backup uploaded files
log "Backing up uploaded files..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend/storage/app/public

if [ $? -eq 0 ]; then
    log "Uploads backup completed: $BACKUP_DIR/uploads_$DATE.tar.gz"
else
    log "WARNING: Uploads backup failed or no uploads found"
fi

# Backup environment files
log "Backing up configuration..."
cp backend/.env $BACKUP_DIR/env_$DATE.backup
cp frontend/.env $BACKUP_DIR/frontend_env_$DATE.backup
cp docker-compose.yml $BACKUP_DIR/docker-compose_$DATE.backup

# Create restore script
cat > $BACKUP_DIR/restore_$DATE.sh << 'EOF'
#!/bin/bash
# Restore script for Maroon-NET backup

BACKUP_FILE=$1
BACKUP_DIR=$(dirname $BACKUP_FILE)
DATE=$(basename $BACKUP_FILE | cut -d'_' -f2)

echo "Starting restore from backup: $DATE"

# Extract application files
echo "Restoring application files..."
tar -xzf $BACKUP_DIR/app_$DATE.tar.gz -C /

# Restore database
echo "Restoring database..."
gunzip -c $BACKUP_DIR/db_$DATE.sql.gz | docker-compose exec -T postgres psql -U maroon_admin maroon_net_bcms

# Restore uploads
echo "Restoring uploaded files..."
tar -xzf $BACKUP_DIR/uploads_$DATE.tar.gz -C /

# Restore environment
echo "Restoring configuration..."
cp $BACKUP_DIR/env_$DATE.backup backend/.env
cp $BACKUP_DIR/frontend_env_$DATE.backup frontend/.env
cp $BACKUP_DIR/docker-compose_$DATE.backup docker-compose.yml

echo "Restore completed!"
echo "Please run: docker-compose up -d --build"
EOF

chmod +x $BACKUP_DIR/restore_$DATE.sh

# Rotate old backups (keep 30 days)
log "Rotating old backups..."
find $BACKUP_DIR -name "*.gz" -type f -mtime +30 -delete
find $BACKUP_DIR -name "*.backup" -type f -mtime +30 -delete
find $BACKUP_DIR -name "restore_*.sh" -type f -mtime +30 -delete

# Calculate backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
log "Backup completed successfully!"
log "Total backup size: $BACKUP_SIZE"
log "Backup location: $BACKUP_DIR"
log "Restore script: $BACKUP_DIR/restore_$DATE.sh"

# Send notification (optional)
if command -v mail &> /dev/null; then
    echo "Backup completed at $(date)
Size: $BACKUP_SIZE
Location: $BACKUP_DIR" | mail -s "Maroon-NET Backup Completed" admin@maroon-net.id
fi

exit 0