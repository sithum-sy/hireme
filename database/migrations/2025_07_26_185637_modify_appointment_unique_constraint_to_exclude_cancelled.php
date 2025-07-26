<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop any existing unique constraint that might be causing the issue
        try {
            DB::statement('ALTER TABLE appointments DROP INDEX unique_provider_datetime_active');
        } catch (Exception $e) {
            // Ignore if constraint doesn't exist
        }

        try {
            DB::statement('ALTER TABLE appointments DROP INDEX unique_provider_datetime');
        } catch (Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Don't add a new constraint - we'll handle this in application logic
        // to allow rebooking cancelled time slots
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new constraint
        try {
            DB::statement('ALTER TABLE appointments DROP INDEX unique_provider_datetime_active');
        } catch (Exception $e) {
            // Ignore if constraint doesn't exist
        }

        // Restore the original constraint (if it existed)
        // Note: We don't restore the old constraint as it was causing the issue
    }
};
