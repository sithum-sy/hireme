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
            // Add only status-related fields, no review fields
            if (!Schema::hasColumn('appointments', 'invoice_sent_at')) {
                $table->timestamp('invoice_sent_at')->nullable()->after('completed_at');
            }

            if (!Schema::hasColumn('appointments', 'payment_received_at')) {
                $table->timestamp('payment_received_at')->nullable()->after('invoice_sent_at');
            }

            // Add a simple flag to track if reviews are completed
            if (!Schema::hasColumn('appointments', 'reviews_completed_at')) {
                $table->timestamp('reviews_completed_at')->nullable()->after('payment_received_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'invoice_sent_at',
                'payment_received_at',
                'reviews_completed_at'
            ]);
        });
    }
};
