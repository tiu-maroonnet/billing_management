<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('plan_id')->constrained('plans');
            $table->foreignId('router_id')->constrained('routers');
            $table->enum('type', ['pppoe', 'static', 'hotspot']);
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('static_ip')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('interface')->nullable();
            $table->date('start_date');
            $table->integer('due_day');
            $table->enum('status', ['active', 'suspended', 'terminated', 'pending'])->default('pending');
            $table->string('mikrotik_secret_id')->nullable();
            $table->string('mikrotik_queue_id')->nullable();
            $table->string('mikrotik_address_list_id')->nullable();
            $table->text('provisioning_log')->nullable();
            $table->timestamp('last_provisioned_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'type', 'customer_id']);
            $table->unique(['router_id', 'username']);
            $table->unique(['router_id', 'static_ip']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};