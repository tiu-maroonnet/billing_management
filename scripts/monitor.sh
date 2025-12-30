#!/bin/bash
# scripts/monitor.sh

# Monitor script untuk Maroon-NET BCMS

LOG_FILE="/var/log/maroonnet/monitor.log"
ALERT_EMAIL="admin@maroon-net.id"
ALERT_PHONE="+6281122334455"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
API_RESPONSE_THRESHOLD=5000  # 5 seconds in milliseconds

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

send_alert() {
    local severity=$1
    local message=$2
    
    log "ALERT $severity: $message"
    
    # Send email
    echo "$message" | mail -s "[$severity] Maroon-NET Alert" $ALERT_EMAIL
    
    # Send WhatsApp (using curl to API)
    curl -X POST "https://api.maroon-net.id/api/notifications/alert" \
        -H "Content-Type: application/json" \
        -d "{\"severity\":\"$severity\",\"message\":\"$message\",\"channel\":\"whatsapp\",\"recipient\":\"$ALERT_PHONE\"}"
}

# Check Docker services
check_docker_services() {
    log "Checking Docker services..."
    
    services=("postgres" "redis" "backend" "frontend" "nginx" "queue" "scheduler")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*Up"; then
            log "✓ Service $service is running"
        else
            send_alert "CRITICAL" "Service $service is down!"
        fi
    done
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then
        send_alert "WARNING" "CPU usage high: ${cpu_usage}%"
    fi
    
    # Memory
    memory_usage=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > $MEMORY_THRESHOLD" | bc -l) )); then
        send_alert "WARNING" "Memory usage high: ${memory_usage}%"
    fi
    
    # Disk
    disk_usage=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
    if [ $disk_usage -gt $DISK_THRESHOLD ]; then
        send_alert "WARNING" "Disk usage high: ${disk_usage}%"
    fi
}

# Check API response
check_api_response() {
    log "Checking API response..."
    
    start_time=$(date +%s%N)
    response=$(curl -s -o /dev/null -w "%{http_code}" https://api.maroon-net.id/api/health)
    end_time=$(date +%s%N)
    
    response_time=$((($end_time - $start_time)/1000000))
    
    if [ $response -eq 200 ]; then
        log "✓ API responding with HTTP 200"
        
        if [ $response_time -gt $API_RESPONSE_THRESHOLD ]; then
            send_alert "WARNING" "API response slow: ${response_time}ms"
        fi
    else
        send_alert "CRITICAL" "API not responding properly. HTTP Code: $response"
    fi
}

# Check database connections
check_database() {
    log "Checking database..."
    
    if docker-compose exec -T postgres pg_isready -U maroon_admin -d maroon_net_bcms; then
        log "✓ Database is accessible"
        
        # Check for long-running queries
        long_queries=$(docker-compose exec -T postgres psql -U maroon_admin -d maroon_net_bcms -c "
            SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
            FROM pg_stat_activity 
            WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes' 
            AND state = 'active';
        " | wc -l)
        
        if [ $long_queries -gt 2 ]; then
            send_alert "WARNING" "Found $((long_queries - 2)) long-running database queries"
        fi
    else
        send_alert "CRITICAL" "Database is not accessible!"
    fi
}

# Check Redis
check_redis() {
    log "Checking Redis..."
    
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log "✓ Redis is responding"
        
        # Check memory usage
        redis_memory=$(docker-compose exec -T redis redis-cli info memory | grep used_memory_human | cut -d: -f2)
        log "Redis memory usage: $redis_memory"
    else
        send_alert "CRITICAL" "Redis is not responding!"
    fi
}

# Check queue workers
check_queue() {
    log "Checking queue workers..."
    
    queue_jobs=$(docker-compose exec -T redis redis-cli LLEN queues:default)
    
    if [ $queue_jobs -gt 100 ]; then
        send_alert "WARNING" "Queue backlog: $queue_jobs jobs waiting"
    fi
    
    failed_jobs=$(docker-compose exec -T backend php artisan queue:failed --count)
    if [ $failed_jobs -gt 0 ]; then
        send_alert "WARNING" "Found $failed_jobs failed queue jobs"
    fi
}

# Check SSL certificate
check_ssl() {
    log "Checking SSL certificate..."
    
    expiry_date=$(echo | openssl s_client -servername billing.maroon-net.id -connect billing.maroon-net.id:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    expiry_timestamp=$(date -d "$expiry_date" +%s)
    current_timestamp=$(date +%s)
    days_remaining=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
    
    if [ $days_remaining -lt 30 ]; then
        send_alert "WARNING" "SSL certificate expires in $days_remaining days"
    fi
    
    log "SSL certificate valid for $days_remaining more days"
}

# Check backups
check_backups() {
    log "Checking backups..."
    
    latest_backup=$(find /var/backups/maroonnet -name "db_*.sql.gz" -type f -printf "%T@ %p\n" | sort -n | tail -1 | cut -d' ' -f2)
    
    if [ -z "$latest_backup" ]; then
        send_alert "CRITICAL" "No backups found!"
        return
    fi
    
    backup_age=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 3600 ))
    
    if [ $backup_age -gt 48 ]; then
        send_alert "CRITICAL" "Last backup is $backup_age hours old!"
    elif [ $backup_age -gt 24 ]; then
        send_alert "WARNING" "Last backup is $backup_age hours old"
    fi
    
    log "Last backup: $backup_age hours ago"
}

# Main monitoring function
main() {
    log "=== Starting Maroon-NET System Monitor ==="
    
    check_docker_services
    check_system_resources
    check_api_response
    check_database
    check_redis
    check_queue
    check_ssl
    check_backups
    
    log "=== Monitoring completed ==="
}

# Run monitoring
main

# Schedule this script to run every 5 minutes via cron
# */5 * * * * /path/to/scripts/monitor.sh