<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->string('logo')->nullable();
            $table->string('brand_logo')->nullable();
            $table->text('address');
            $table->string('phone');
            $table->string('email');
            $table->string('npwp')->nullable();
            $table->string('tax_rate')->default('0');
            $table->json('bank_accounts')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company');
    }
};