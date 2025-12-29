<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('ip_address');
            $table->integer('api_port')->default(8728);
            $table->string('username');
            $table->text('password')->nullable();
            $table->text('api_certificate')->nullable();
            $table->boolean('use_tls')->default(false);
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->json('capabilities')->nullable();
            $table->integer('max_connections')->default(500);
            $table->integer('current_connections')->default(0);
            $table->timestamp('last_sync')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'ip_address']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routers');
    }
};