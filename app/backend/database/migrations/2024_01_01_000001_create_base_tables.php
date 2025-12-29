<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Users Group Table
        Schema::create('user_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->json('permissions');
            $table->timestamps();
        });

        // Users Table
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');
            $table->foreignId('group_id')->constrained('user_groups');
            $table->enum('status', ['active', 'locked'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // Company Table
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->string('brand');
            $table->string('brand_logo')->nullable();
            $table->text('address');
            $table->string('phone', 20);
            $table->string('email');
            $table->string('npwp', 25)->nullable();
            $table->json('bank_details');
            $table->json('tax_settings')->nullable();
            $table->timestamps();
        });

        // Customers Table
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['resident', 'soho', 'corporate']);
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->unique();
            $table->text('address');
            $table->json('coordinates')->nullable();
            $table->date('subscription_date');
            $table->json('document_uploads')->nullable();
            $table->enum('status', ['active', 'suspended', 'terminated'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Routers Table
        Schema::create('routers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ip_address');
            $table->integer('api_port')->default(8729);
            $table->string('username');
            $table->text('password_encrypted');
            $table->boolean('tls_enabled')->default(true);
            $table->enum('status', ['online', 'offline', 'maintenance'])->default('online');
            $table->json('capabilities')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Plans Table
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('rate_limit_up'); // in kbps
            $table->integer('rate_limit_down'); // in kbps
            $table->integer('burst_limit_up')->nullable();
            $table->integer('burst_limit_down')->nullable();
            $table->integer('burst_threshold_up')->nullable();
            $table->integer('burst_threshold_down')->nullable();
            $table->integer('burst_time_up')->nullable();
            $table->integer('burst_time_down')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->integer('suspension_grace_days')->default(5);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Services Table
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('plan_id')->constrained('plans');
            $table->foreignId('router_id')->constrained('routers');
            $table->enum('type', ['pppoe', 'static']);
            $table->string('username')->nullable();
            $table->string('password_encrypted')->nullable();
            $table->string('static_ip')->nullable();
            $table->string('mac_address', 17)->nullable();
            $table->date('start_date');
            $table->integer('due_day');
            $table->enum('status', ['active', 'suspended', 'terminated'])->default('active');
            $table->json('mikrotik_config')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Invoices Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('service_id')->constrained('services');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('amount', 12, 2);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->date('due_date');
            $table->enum('status', ['draft', 'unpaid', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->json('items');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Payments Table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices');
            $table->string('payment_number')->unique();
            $table->enum('method', ['bank_transfer', 'credit_card', 'virtual_account', 'cash', 'ewallet']);
            $table->string('gateway')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('admin_fee', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('reference')->nullable();
            $table->string('proof')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Reminders Table
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices');
            $table->enum('channel', ['email', 'whatsapp', 'sms']);
            $table->enum('type', ['due_reminder', 'overdue_notice', 'suspension_warning', 'reactivation_notice']);
            $table->json('template_data');
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('response')->nullable();
            $table->timestamps();
        });

        // Ticketing Table
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->string('reporter_name');
            $table->string('reporter_contact');
            $table->enum('category', ['technical', 'billing', 'general', 'complaint']);
            $table->enum('priority', ['low', 'medium', 'high', 'critical']);
            $table->text('description');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->timestamp('action_date')->nullable();
            $table->string('technician_name')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
        });

        // Audit Logs Table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('action');
            $table->string('resource_type');
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->json('payload')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['resource_type', 'resource_id']);
            $table->index('created_at');
        });

        // Mikrotik Logs Table
        Schema::create('mikrotik_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('router_id')->constrained('routers');
            $table->foreignId('service_id')->nullable()->constrained('services');
            $table->string('command');
            $table->json('parameters');
            $table->enum('status', ['success', 'failed']);
            $table->text('response')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });

        // Notification Templates
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['email', 'whatsapp', 'sms']);
            $table->string('subject')->nullable();
            $table->text('content');
            $table->json('variables');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('mikrotik_logs');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('reminders');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('services');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('routers');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('users');
        Schema::dropIfExists('user_groups');
    }
};