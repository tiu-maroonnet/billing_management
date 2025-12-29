<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('code')->unique();
            $table->enum('type', ['resident', 'soho', 'corporate']);
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->text('address');
            $table->string('id_card_number')->nullable();
            $table->string('id_card_file')->nullable();
            $table->string('document_file')->nullable();
            $table->date('subscription_date');
            $table->date('birth_date')->nullable();
            $table->enum('status', ['active', 'suspended', 'terminated', 'pending'])->default('pending');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'type']);
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};