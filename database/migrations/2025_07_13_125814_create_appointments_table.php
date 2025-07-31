<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CreateAppointmentsTable Migration - Core appointments system database structure
 * 
 * Creates the main appointments table that handles service bookings between 
 * clients and providers. Includes comprehensive fields for location, pricing,
 * status tracking, and performance optimization through strategic indexing.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            // Foreign key relationships with cascade delete for data integrity
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            
            // Core appointment scheduling fields
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->decimal('duration_hours', 4, 2);
            $table->decimal('total_price', 8, 2);

            // Add missing fields from model fillable
            $table->decimal('base_price', 8, 2)->nullable();
            $table->decimal('travel_fee', 8, 2)->default(0);
            $table->enum('location_type', ['client_address', 'provider_location', 'custom_location'])->default('client_address');
            $table->text('client_address')->nullable(); // Make nullable since provider_location doesn't need it
            $table->string('client_city', 100)->nullable();
            $table->string('client_postal_code', 20)->nullable();
            $table->text('location_instructions')->nullable();
            $table->string('client_phone', 20)->nullable();
            $table->string('client_email')->nullable();
            $table->enum('contact_preference', ['phone', 'message'])->default('phone');
            $table->text('client_notes')->nullable();
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer'])->default('cash');
            $table->string('booking_source', 50)->default('web_app');
            $table->text('cancellation_reason')->nullable();

            // Comprehensive status enum covering complete appointment lifecycle
            $table->enum('status', [
                'pending',                    // Initial state awaiting provider confirmation
                'confirmed',
                'in_progress',
                'completed',
                'cancelled_by_client',
                'cancelled_by_provider',
                'no_show',
                'disputed'
            ])->default('pending');

            // Review and rating fields
            $table->text('provider_notes')->nullable();
            $table->json('client_location')->nullable();
            $table->decimal('client_rating', 2, 1)->nullable();
            $table->text('client_review')->nullable();
            $table->decimal('provider_rating', 2, 1)->nullable();
            $table->text('provider_review')->nullable();

            // Timestamp fields
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            // Strategic database indexes for query performance optimization
            $table->index(['client_id', 'appointment_date']); // Client appointment lookups
            $table->index(['provider_id', 'appointment_date']); // Provider schedule queries
            $table->index(['status']); // Status-based filtering and reporting
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
