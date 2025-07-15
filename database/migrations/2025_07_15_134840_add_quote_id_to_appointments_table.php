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
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('quote_id')->nullable()->constrained('quotes')->onDelete('set null');
            $table->index(['quote_id']); // Add index for better performance
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['quote_id']);
            $table->dropIndex(['quote_id']);
            $table->dropColumn('quote_id');
        });
    }
};
