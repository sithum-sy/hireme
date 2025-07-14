<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');

            // Invoice Details
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('provider_earnings', 10, 2);

            // Status and Payment
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->enum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable(); // cash, card, bank_transfer, etc.
            $table->string('transaction_id')->nullable();

            // Dates
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('sent_at')->nullable();

            // Additional Info
            $table->text('notes')->nullable();
            $table->json('line_items')->nullable(); // Detailed breakdown
            $table->json('payment_details')->nullable(); // Payment gateway details

            $table->timestamps();

            // Indexes
            $table->index(['provider_id', 'status']);
            $table->index(['client_id', 'payment_status']);
            $table->index('invoice_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoices');
    }
};
