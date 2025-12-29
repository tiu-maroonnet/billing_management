#!/bin/bash

set -e

echo "🚀 Starting Maroon-NET BCMS Deployment..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "⚠️  Warning: .env file not found. Using default values."
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/maroonnet/billing_management/docker/apache/ssl
sudo mkdir -p /var/www/maroonnet/logs
sudo mkdir -p /var/www/maroonnet/backups

# Set permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data /var/www/maroonnet
sudo chmod -R 755 /var/www/maroonnet
sudo chmod -R 777 /var/www/maroonnet/billing_management/apps/backend/storage
sudo chmod -R 777 /var/www/maroonnet/billing_management/apps/backend/bootstrap/cache

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Setup backend
echo "🔧 Setting up backend..."
docker-compose exec backend composer install --no-dev --optimize-autoloader
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan jwt:secret
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan db:seed --force
docker-compose exec backend php artisan storage:link
docker-compose exec backend php artisan optimize:clear

# Setup frontend
echo "🔧 Setting up frontend..."
docker-compose exec frontend npm install
docker-compose exec frontend npm run build

# Setup cron jobs
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 0 * * * docker-compose exec backend php artisan reminders:daily >> /var/www/maroonnet/logs/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 1 * * * docker-compose exec backend php artisan invoices:generate-monthly >> /var/www/maroonnet/logs/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * docker-compose exec backend php artisan backup:run --only-db >> /var/www/maroonnet/logs/cron.log 2>&1") | crontab -

# Setup SSL certificates (if needed)
echo "🔐 Setting up SSL..."
if [ ! -f /var/www/maroonnet/billing_management/docker/apache/ssl/certificate.crt ]; then
    echo "⚠️  Please place SSL certificates in docker/apache/ssl/"
    echo "   - certificate.crt"
    echo "   - private.key"
    echo "   - ca_bundle.crt"
fi

# Show deployment info
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Access Information:"
echo "   Frontend URL: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "🔑 Default Login:"
echo "   Email: admin@maroon-net.com"
echo "   Password: Admin@12345"
echo ""
echo "📊 Services Status:"
docker-compose ps
echo ""
echo "📝 Next Steps:"
echo "   1. Update .env file with your configurations"
echo "   2. Configure SSL certificates in docker/apache/ssl/"
echo "   3. Configure Mikrotik router settings"
echo "   4. Setup payment gateway credentials"
echo "   5. Configure email and WhatsApp settings"
echo ""
echo "🔄 To restart services: docker-compose restart"
echo "📜 To view logs: docker-compose logs -f"