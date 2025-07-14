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
        Schema::table('quotes', function (Blueprint $table) {
            // Add foreign key to quote_requests
            $table->foreignId('quote_request_id')->nullable()->after('service_id')->constrained('quote_requests')->onDelete('cascade');

            // Add index for better performance
            $table->index(['quote_request_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropForeign(['quote_request_id']);
            $table->dropIndex(['quote_request_id', 'status']);
            $table->dropColumn('quote_request_id');
        });
    }
};
