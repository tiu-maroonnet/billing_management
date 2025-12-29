#!/bin/bash

BACKUP_DIR="/var/www/maroonnet/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

echo "Starting backup process..."

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
echo "Backing up database..."
docker-compose exec postgres pg_dump -U maroonnet_admin maroonnet_bcms > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup uploaded files
echo "Backing up uploaded files..."
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C /var/www/maroonnet/billing_management/apps/backend/storage/app/public .

# Backup configuration files
echo "Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" \
    /var/www/maroonnet/billing_management/apps/backend/.env \
    /var/www/maroonnet/billing_management/docker/apache/ssl/ \
    /var/www/maroonnet/billing_management/docker-compose.yml

# Create complete backup
echo "Creating complete backup archive..."
tar -czf $BACKUP_FILE \
    "$BACKUP_DIR/db_backup_$DATE.sql" \
    "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" \
    "$BACKUP_DIR/config_backup_$DATE.tar.gz"

# Remove temporary files
rm -f "$BACKUP_DIR/db_backup_$DATE.sql" \
      "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" \
      "$BACKUP_DIR/config_backup_$DATE.tar.gz"

# Keep only last 7 backups
echo "Cleaning up old backups..."
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed: $BACKUP_FILE"
echo "Backup size: $(du -h $BACKUP_FILE | cut -f1)"