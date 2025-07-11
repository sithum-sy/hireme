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
        Schema::table('services', function (Blueprint $table) {
            // Location coordinates
            $table->decimal('latitude', 10, 8)->nullable()->after('service_areas');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');

            // Location details
            $table->string('location_address')->nullable()->after('longitude');
            $table->string('location_city')->nullable()->after('location_address');
            $table->string('location_neighborhood')->nullable()->after('location_city');

            // Service radius in kilometers
            $table->integer('service_radius')->default(10)->after('location_neighborhood');

            // Indexes for location-based queries
            $table->index(['latitude', 'longitude']);
            $table->index('location_city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['latitude', 'longitude']);
            $table->dropIndex(['location_city']);

            $table->dropColumn([
                'latitude',
                'longitude',
                'location_address',
                'location_city',
                'location_neighborhood',
                'service_radius'
            ]);
        });
    }
};
