<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM(
            'pending',
            'confirmed', 
            'in_progress',
            'completed',
            'invoice_sent',
            'payment_pending',
            'paid',
            'reviewed',
            'closed',
            'cancelled_by_client',
            'cancelled_by_provider',
            'no_show',
            'disputed'
        ) NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM(
            'pending',
            'confirmed',
            'in_progress', 
            'completed',
            'cancelled_by_client',
            'cancelled_by_provider',
            'no_show',
            'disputed'
        ) NOT NULL DEFAULT 'pending'");
    }
};
