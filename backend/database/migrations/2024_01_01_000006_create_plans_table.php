<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('price', 15, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->string('rate_limit_up');
            $table->string('rate_limit_down');
            $table->string('burst_limit_up')->nullable();
            $table->string('burst_limit_down')->nullable();
            $table->integer('burst_threshold')->default(80);
            $table->integer('burst_time')->default(15);
            $table->integer('suspension_grace_days')->default(3);
            $table->integer('validity_days')->default(30);
            $table->enum('type', ['pppoe', 'static', 'hotspot']);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->json('mikrotik_profile')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['is_active', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};