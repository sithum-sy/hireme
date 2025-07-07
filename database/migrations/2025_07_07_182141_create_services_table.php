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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('service_categories')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('pricing_type', ['hourly', 'fixed', 'custom'])->default('hourly');
            $table->decimal('base_price', 8, 2);
            $table->decimal('duration_hours', 4, 2)->default(1.00);
            $table->json('service_images')->nullable(); // array of image paths
            $table->text('requirements')->nullable(); // what client needs to provide
            $table->text('includes')->nullable(); // what's included in service
            $table->json('service_areas')->nullable(); // array of area names
            $table->boolean('is_active')->default(true);
            $table->integer('views_count')->default(0);
            $table->integer('bookings_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
