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
        Schema::table('invoices', function (Blueprint $table) {
            // Add payment-related fields if they don't exist
            if (!Schema::hasColumn('invoices', 'payment_method')) {
                $table->enum('payment_method', ['stripe', 'cash'])->nullable()->after('status');
            }

            if (!Schema::hasColumn('invoices', 'stripe_payment_intent_id')) {
                $table->string('stripe_payment_intent_id')->nullable()->after('payment_method');
            }

            if (!Schema::hasColumn('invoices', 'service_fee')) {
                $table->decimal('service_fee', 10, 2)->default(0)->after('platform_fee');
            }

            if (!Schema::hasColumn('invoices', 'payment_details')) {
                $table->json('payment_details')->nullable()->after('stripe_payment_intent_id');
            }

            // Add client access fields
            if (!Schema::hasColumn('invoices', 'client_viewed_at')) {
                $table->timestamp('client_viewed_at')->nullable()->after('sent_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'stripe_payment_intent_id',
                'service_fee',
                'payment_details',
                'client_viewed_at'
            ]);
        });
    }
};
