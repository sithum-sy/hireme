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
        // Remove rating fields from provider_profiles table
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->dropColumn(['average_rating', 'total_reviews']);
        });

        // Remove rating fields from services table
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('average_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back rating fields to provider_profiles table
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->decimal('average_rating', 3, 2)->default(0.00)->after('verification_notes');
            $table->integer('total_reviews')->default(0)->after('average_rating');
        });

        // Add back rating field to services table
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('average_rating', 3, 2)->default(0.00)->after('bookings_count');
        });
    }
};
