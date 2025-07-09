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
        Schema::create('staff_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->string('action_type', 50); // create, update, delete, view, etc.
            $table->string('target_type')->nullable(); // Model class name
            $table->unsignedBigInteger('target_id')->nullable(); // Model ID
            $table->text('description'); // Human-readable description
            $table->json('metadata')->nullable(); // Additional context data
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['staff_id', 'created_at']);
            $table->index(['action_type', 'created_at']);
            $table->index(['target_type', 'target_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_activities');
    }
};
