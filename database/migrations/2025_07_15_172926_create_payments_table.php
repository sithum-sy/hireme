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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');

            // Payment details
            $table->enum('method', ['stripe', 'cash'])->default('cash');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('LKR');

            // Stripe specific fields
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_payment_method_id')->nullable();
            $table->string('stripe_charge_id')->nullable();

            // Transaction details
            $table->string('transaction_id')->nullable();
            $table->json('payment_details')->nullable(); // Store additional payment metadata
            $table->text('failure_reason')->nullable();

            // Timestamps
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['appointment_id', 'status']);
            $table->index(['client_id', 'status']);
            $table->index('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
