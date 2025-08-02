<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Invoice;
use Carbon\Carbon;

class PaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all invoices that have been sent or paid
        $invoices = Invoice::whereIn('status', ['sent', 'paid', 'overdue'])
            ->with(['appointment', 'client', 'provider'])
            ->get();

        if ($invoices->isEmpty()) {
            $this->command->warn('No invoices found that require payments. Please run the invoices seeder first.');
            return;
        }

        $createdPayments = 0;

        // Sri Lankan payment methods and their usage distribution
        $paymentMethodDistribution = [
            'cash' => 0.6,           // 40% cash payments (very common in Sri Lanka)
            // 'bank_transfer' => 0.35, // 35% bank transfers
            'card' => 0.4          // 25% card payments
        ];

        // Sri Lankan banks for reference numbers
        // $sriLankanBanks = ['BOC', 'PBC', 'ComBank', 'HNB', 'DFCC', 'Sampath', 'Nations', 'Union'];

        foreach ($invoices as $invoice) {
            // Determine payment method based on distribution
            $rand = rand(1, 100) / 100;
            $paymentMethod = 'cash';

            if ($rand <= $paymentMethodDistribution['cash']) {
                $paymentMethod = 'cash';
            } else {
                $paymentMethod = 'card';
            }

            // Determine payment status based on invoice status
            $paymentStatus = Payment::STATUS_PENDING;
            $processedAt = null;
            $failedAt = null;
            $failureReason = null;

            if ($invoice->payment_status === 'completed') {
                $paymentStatus = Payment::STATUS_COMPLETED;
                $processedAt = $invoice->paid_at;
            } elseif ($invoice->status === 'overdue') {
                // Some overdue invoices might have failed payment attempts
                if (rand(1, 100) <= 30) { // 30% chance of failed payment
                    $paymentStatus = Payment::STATUS_FAILED;
                    $failedAt = $invoice->sent_at?->copy()->addDays(rand(1, 7));
                    $failureReasons = [
                        'Insufficient funds in account',
                        'Card expired',
                        // 'Bank transfer cancelled by client',
                        'Payment gateway timeout',
                        // 'Invalid account details',
                        'Bank system maintenance'
                    ];
                    $failureReason = $failureReasons[array_rand($failureReasons)];
                }
            }

            // Generate payment details based on method
            $paymentDetails = [];
            $transactionId = null;

            switch ($paymentMethod) {
                case 'cash':
                    $paymentDetails = [
                        'method' => 'cash',
                        'received_by' => 'Provider',
                        'location' => 'Service location',
                        'receipt_number' => 'CASH' . rand(100000, 999999)
                    ];
                    $transactionId = 'CASH' . rand(100000, 999999);
                    break;

                // case 'bank_transfer':
                //     $bank = $sriLankanBanks[array_rand($sriLankanBanks)];
                //     $paymentDetails = [
                //         'method' => 'bank_transfer',
                //         'bank' => $bank,
                //         'reference_number' => $bank . rand(10000000, 99999999),
                //         'transfer_type' => rand(1, 100) <= 60 ? 'online' : 'branch', // 60% online, 40% branch
                //         'account_last_four' => rand(1000, 9999)
                //     ];
                //     $transactionId = $paymentDetails['reference_number'];
                //     break;

                case 'card':
                    $cardTypes = ['Visa', 'MasterCard'];
                    $cardType = $cardTypes[array_rand($cardTypes)];
                    $paymentDetails = [
                        'method' => 'card',
                        'card_type' => $cardType,
                        'card_last_four' => rand(1000, 9999),
                        'authorization_code' => strtoupper(substr(md5(rand()), 0, 6)),
                        'gateway' => 'PayHere' // Popular payment gateway in Sri Lanka
                    ];
                    $transactionId = 'CARD' . rand(100000000, 999999999);
                    break;
            }

            // Add failure details for failed payments
            if ($paymentStatus === Payment::STATUS_FAILED) {
                $paymentDetails['failure_code'] = 'ERR_' . rand(1000, 9999);
                $paymentDetails['failure_message'] = $failureReason;
            }

            // For completed payments, add success details
            if ($paymentStatus === Payment::STATUS_COMPLETED) {
                $paymentDetails['processed_at'] = $processedAt->toDateTimeString();
                $paymentDetails['confirmation_number'] = strtoupper(substr(md5($transactionId), 0, 8));
            }

            // Create payment record
            $payment = Payment::create([
                'appointment_id' => $invoice->appointment_id,
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'provider_id' => $invoice->provider_id,
                'method' => $paymentMethod,
                'status' => $paymentStatus,
                'amount' => $invoice->total_amount,
                'currency' => 'LKR',
                'stripe_payment_intent_id' => null, // Not using Stripe for seeded data
                'stripe_payment_method_id' => null,
                'stripe_charge_id' => null,
                'transaction_id' => $transactionId,
                'payment_details' => $paymentDetails,
                'failure_reason' => $failureReason,
                'processed_at' => $processedAt,
                'failed_at' => $failedAt,
                'created_at' => $invoice->sent_at ?? $invoice->issued_at,
                'updated_at' => $processedAt ?? $failedAt ?? ($invoice->sent_at ?? $invoice->issued_at)
            ]);

            $createdPayments++;
        }

        // Statistics
        $totalPayments = Payment::count();
        $completedPayments = Payment::where('status', Payment::STATUS_COMPLETED)->count();
        $pendingPayments = Payment::where('status', Payment::STATUS_PENDING)->count();
        $failedPayments = Payment::where('status', Payment::STATUS_FAILED)->count();

        $cashPayments = Payment::where('method', 'cash')->count();
        // $bankTransfers = Payment::where('method', 'bank_transfer')->count();
        $cardPayments = Payment::where('method', 'card')->count();

        $totalAmount = Payment::sum('amount');
        $completedAmount = Payment::where('status', Payment::STATUS_COMPLETED)->sum('amount');
        $pendingAmount = Payment::where('status', Payment::STATUS_PENDING)->sum('amount');

        $this->command->info("Successfully created {$createdPayments} payment records!");

        $this->command->info("\n📊 Payment Status Summary:");
        $this->command->info("   • Total Payments: {$totalPayments}");
        $this->command->info("   • Completed: {$completedPayments}");
        $this->command->info("   • Pending: {$pendingPayments}");
        $this->command->info("   • Failed: {$failedPayments}");

        $this->command->info("\n💳 Payment Method Distribution:");
        $this->command->info("   • Cash Payments: {$cashPayments}");
        // $this->command->info("   • Bank Transfers: {$bankTransfers}");
        $this->command->info("   • Card Payments: {$cardPayments}");

        $this->command->info("\n💰 Payment Amounts:");
        $this->command->info("   • Total Amount: LKR " . number_format($totalAmount, 2));
        $this->command->info("   • Completed: LKR " . number_format($completedAmount, 2));
        $this->command->info("   • Pending: LKR " . number_format($pendingAmount, 2));

        $this->command->info("\n🌴 Realistic Sri Lankan payment patterns:");
        $this->command->info("   • Cash payments (40%) - Common for local services");
        $this->command->info("   • Bank transfers (35%) - BOC, PBC, ComBank, HNB, etc.");
        $this->command->info("   • Card payments (25%) - Visa/MasterCard via PayHere");
        $this->command->info("   • Failure scenarios included for realistic testing");
    }
}
