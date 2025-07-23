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
        Schema::create('reschedule_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            
            // Original appointment details (for reference)
            $table->date('original_date');
            $table->time('original_time');
            
            // Requested new details
            $table->date('requested_date');
            $table->time('requested_time');
            
            // Request details
            $table->enum('reason', [
                'personal_emergency',
                'work_conflict', 
                'travel_plans',
                'health_reasons',
                'weather_concerns',
                'provider_request',
                'other'
            ]);
            $table->text('notes')->nullable();
            
            // Status tracking
            $table->enum('status', ['pending', 'approved', 'declined'])->default('pending');
            $table->text('response_notes')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->foreignId('responded_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Contact updates (optional)
            $table->string('client_phone', 20)->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_address')->nullable();
            $table->string('location_type')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['appointment_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reschedule_requests');
    }
};