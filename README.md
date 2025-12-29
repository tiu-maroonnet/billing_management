# Billing & Customer Management System (BCMS)
## PT. Trira Inti Utama - Maroon-NET

Sistem manajemen pelanggan dan billing terintegrasi untuk ISP dengan fitur:
- Manajemen pelanggan (PPPoE & IP Static)
- Integrasi Mikrotik RouterOS API
- Sistem billing otomatis
- Reminder via Email & WhatsApp
- Ticketing system
- Multi-user roles

## Tech Stack
- **Backend**: Laravel 11 + PHP 8.3
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: MySQL 8 + Redis
- **Web Server**: Apache 2.4
- **OS**: Ubuntu Server 22.04 LTS

## Quick Start (Development)
```bash
# Clone repository
git clone https://github.com/tiu-maroonnet/billing_management.git
cd billing_management

# Setup Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# Setup Frontend
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000