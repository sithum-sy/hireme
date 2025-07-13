<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');

            // Basic quote info
            $table->string('title');
            $table->text('description');

            // CLIENT REQUEST DATA - Store all frontend form data as JSON for flexibility
            $table->json('quote_request_data'); // All the QuoteRequestModal form data
            $table->text('client_requirements')->nullable(); // Main message/requirements

            // PROVIDER RESPONSE FIELDS - Set when provider responds
            $table->decimal('quoted_price', 8, 2)->nullable();
            $table->decimal('duration_hours', 4, 2)->nullable();
            $table->decimal('travel_fee', 8, 2)->default(0);
            $table->text('quote_details')->nullable(); // Provider's detailed response
            $table->text('terms_and_conditions')->nullable();
            $table->json('pricing_breakdown')->nullable(); // Detailed pricing from provider

            // STATUS AND WORKFLOW
            $table->enum('status', [
                'pending',        // Waiting for provider response
                'quoted',         // Provider has responded with quote
                'accepted',       // Client accepted the quote
                'rejected',       // Client rejected the quote
                'expired',        // Quote expired
                'withdrawn',      // Provider withdrew
                'converted'       // Converted to appointment
            ])->default('pending');

            // TIMESTAMPS AND NOTES
            $table->timestamp('valid_until')->nullable(); // Set when provider responds
            $table->text('client_notes')->nullable(); // Client's response notes
            $table->text('provider_notes')->nullable(); // Provider's internal notes
            $table->timestamp('responded_at')->nullable(); // When provider responded
            $table->timestamp('client_responded_at')->nullable(); // When client accepted/rejected

            // APPOINTMENT CONVERSION
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('set null');

            $table->timestamps();

            // Indexes for performance
            $table->index(['client_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['status', 'valid_until']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
