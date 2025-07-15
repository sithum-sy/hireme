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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade'); // Who wrote the review
            $table->foreignId('reviewee_id')->constrained('users')->onDelete('cascade'); // Who is being reviewed

            // Review type: 'client_to_provider' or 'provider_to_client'
            $table->enum('review_type', ['client_to_provider', 'provider_to_client']);

            // Rating and review content
            $table->tinyInteger('rating')->comment('1-5 star rating');
            $table->text('comment')->nullable();

            // Additional rating breakdowns (optional)
            $table->tinyInteger('quality_rating')->nullable()->comment('Work quality rating');
            $table->tinyInteger('punctuality_rating')->nullable()->comment('Punctuality rating');
            $table->tinyInteger('communication_rating')->nullable()->comment('Communication rating');
            $table->tinyInteger('value_rating')->nullable()->comment('Value for money rating');

            // Review metadata
            $table->boolean('would_recommend')->nullable();
            $table->json('review_images')->nullable(); // Store image URLs/paths
            $table->boolean('is_verified')->default(true); // Verified purchase/service
            $table->boolean('is_featured')->default(false); // Featured review
            $table->boolean('is_hidden')->default(false); // Hidden by admin/moderation

            // Response and interaction
            $table->text('provider_response')->nullable(); // Provider can respond to client reviews
            $table->timestamp('provider_responded_at')->nullable();
            $table->integer('helpful_count')->default(0); // How many found this helpful

            $table->timestamps();

            // Indexes
            $table->index(['appointment_id', 'review_type']);
            $table->index(['reviewee_id', 'rating']);
            $table->index(['reviewer_id', 'created_at']);
            $table->index(['is_hidden', 'is_verified']);

            // Ensure one review per type per appointment
            $table->unique(['appointment_id', 'reviewer_id', 'review_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
