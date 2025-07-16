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
        Schema::table('reviews', function (Blueprint $table) {
            // Add service_id if not exists (needed for service rating updates)
            if (!Schema::hasColumn('reviews', 'service_id')) {
                $table->unsignedBigInteger('service_id')->nullable()->after('reviewee_id');
                $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            }

            // Add status field (needed for published/draft states)
            if (!Schema::hasColumn('reviews', 'status')) {
                $table->string('status')->default('published')->after('is_hidden');
                $table->index('status');
            }

            // Add flagged_at and moderation_notes (for future moderation features)
            if (!Schema::hasColumn('reviews', 'flagged_at')) {
                $table->timestamp('flagged_at')->nullable()->after('provider_responded_at');
            }

            if (!Schema::hasColumn('reviews', 'moderation_notes')) {
                $table->text('moderation_notes')->nullable()->after('flagged_at');
            }
        });

        // Update existing reviews to have service_id from their appointments
        DB::statement("
            UPDATE reviews 
            SET service_id = (
                SELECT service_id 
                FROM appointments 
                WHERE appointments.id = reviews.appointment_id
            )
            WHERE service_id IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn([
                'service_id',
                'status',
                'flagged_at',
                'moderation_notes'
            ]);
        });
    }
};
