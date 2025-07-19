<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Remove the old review columns since we now use the reviews table
            $table->dropColumn([
                'client_rating',
                'client_review',
                'provider_rating',
                'provider_review'
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Re-add columns if migration is rolled back
            $table->decimal('client_rating', 2, 1)->nullable();
            $table->text('client_review')->nullable();
            $table->decimal('provider_rating', 2, 1)->nullable();
            $table->text('provider_review')->nullable();
        });
    }
};
