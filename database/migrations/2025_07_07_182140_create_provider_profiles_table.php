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
        Schema::create('provider_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('business_name')->nullable();
            $table->string('business_license')->nullable(); // file path
            $table->integer('years_of_experience')->default(0);
            $table->integer('service_area_radius')->default(10); // kilometers
            $table->text('bio')->nullable();
            $table->json('certifications')->nullable(); // array of file paths
            $table->json('portfolio_images')->nullable(); // array of image paths
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('verification_notes')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->integer('total_reviews')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0.00);
            $table->boolean('is_available')->default(true);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_profiles');
    }
};
