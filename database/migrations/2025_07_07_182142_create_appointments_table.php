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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->decimal('duration_hours', 4, 2);
            $table->decimal('total_price', 8, 2);
            $table->enum('status', [
                'pending',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled_by_client',
                'cancelled_by_provider'
            ])->default('pending');
            $table->text('client_address');
            $table->text('client_notes')->nullable();
            $table->text('provider_notes')->nullable();
            $table->json('client_location')->nullable(); // lat, lng
            $table->decimal('client_rating', 2, 1)->nullable(); // 1-5 stars
            $table->text('client_review')->nullable();
            $table->decimal('provider_rating', 2, 1)->nullable(); // client rates provider
            $table->text('provider_review')->nullable(); // client reviews provider
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
