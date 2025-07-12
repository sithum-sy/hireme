<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_searches', function (Blueprint $table) {
            $table->id();
            $table->string('search_term')->nullable();
            $table->json('filters')->nullable(); // category, location, price_range, etc.
            $table->decimal('search_latitude', 10, 8)->nullable();
            $table->decimal('search_longitude', 11, 8)->nullable();
            $table->integer('search_radius')->nullable();
            $table->integer('results_count')->default(0);
            $table->string('user_session_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('client_ip')->nullable();
            $table->timestamps();

            $table->index(['search_term', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['search_latitude', 'search_longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_searches');
    }
};
