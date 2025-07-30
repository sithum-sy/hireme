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
        Schema::table('appointments', function (Blueprint $table) {
            // Only add indexes that are likely not to exist already
            // Composite index for availability checking with time
            $table->index(['provider_id', 'appointment_date', 'appointment_time'], 'idx_provider_time_availability');
            
            // Composite index for status + provider queries (dashboard queries)
            $table->index(['provider_id', 'status', 'appointment_date'], 'idx_provider_status_availability');
            
            // Composite index for client appointment queries
            $table->index(['client_id', 'status', 'appointment_date'], 'idx_client_status_availability');
            
            // Index for service-related queries (reporting)
            $table->index(['service_id', 'status', 'appointment_date'], 'idx_service_reports');
            
            // Index for datetime queries (needed for availability overlap checks)
            $table->index(['appointment_date', 'appointment_time'], 'idx_datetime_availability');
            
            // Duration-based queries for overlapping appointments
            $table->index(['provider_id', 'appointment_date', 'status', 'appointment_time'], 'idx_overlap_detection');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('idx_provider_time_availability');
            $table->dropIndex('idx_provider_status_availability');
            $table->dropIndex('idx_client_status_availability');
            $table->dropIndex('idx_service_reports');
            $table->dropIndex('idx_datetime_availability');
            $table->dropIndex('idx_overlap_detection');
        });
    }
};
