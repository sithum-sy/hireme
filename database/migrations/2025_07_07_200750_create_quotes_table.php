<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('client_requirements')->nullable();
            $table->decimal('quoted_price', 8, 2);
            $table->decimal('duration_hours', 4, 2);
            $table->text('quote_details');
            $table->text('terms_and_conditions')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'])->default('pending');
            $table->timestamp('valid_until');
            $table->text('client_notes')->nullable();
            $table->text('provider_notes')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index(['provider_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
