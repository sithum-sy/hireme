<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
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

            // Status enum matching model expectations
            $table->enum('status', [
                'pending',                    // Match model scopes
                'confirmed',
                'in_progress',
                'completed',
                'cancelled_by_client',
                'cancelled_by_provider',
                'no_show',
                'disputed'
            ])->default('pending');          // Change default to 'pending'

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

            // Add indexes for better performance
            $table->index(['client_id', 'appointment_date']);
            $table->index(['provider_id', 'appointment_date']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
