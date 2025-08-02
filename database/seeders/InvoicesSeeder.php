<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Invoice;
use App\Models\Appointment;
use Carbon\Carbon;

class InvoicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get completed appointments that can have invoices
        $completedAppointments = Appointment::whereIn('status', [
            Appointment::STATUS_COMPLETED,
            Appointment::STATUS_PAID,
            Appointment::STATUS_REVIEWED,
            Appointment::STATUS_CLOSED
        ])->with(['client', 'provider', 'service'])->get();

        if ($completedAppointments->isEmpty()) {
            $this->command->warn('No completed appointments found. Please run the appointments seeder first.');
            return;
        }

        $createdInvoices = 0;

        // Set fixed values
        $taxAmount = 0.00;
        $serviceFee = 0.00;
        $platformFee = 0.00;

        // Payment methods commonly used in Sri Lanka (removed bank_transfer)
        $paymentMethods = ['cash', 'card'];

        // Invoice status distribution
        $statusDistribution = [
            'paid' => 0.6,      // 60% paid invoices
            'sent' => 0.25,     // 25% sent awaiting payment
            'overdue' => 0.1,   // 10% overdue
            'draft' => 0.05     // 5% draft invoices
        ];

        foreach ($completedAppointments as $appointment) {
            // Determine invoice status based on appointment status
            $invoiceStatus = 'draft';
            $paymentStatus = 'pending';

            if (
                $appointment->status === Appointment::STATUS_PAID ||
                $appointment->status === Appointment::STATUS_REVIEWED ||
                $appointment->status === Appointment::STATUS_CLOSED
            ) {
                $invoiceStatus = 'paid';
                $paymentStatus = 'completed';
            } elseif ($appointment->status === Appointment::STATUS_COMPLETED) {
                // Use distribution for completed appointments
                $rand = rand(1, 100) / 100;
                if ($rand <= $statusDistribution['paid']) {
                    $invoiceStatus = 'paid';
                    $paymentStatus = 'completed';
                } elseif ($rand <= $statusDistribution['paid'] + $statusDistribution['sent']) {
                    $invoiceStatus = 'sent';
                    $paymentStatus = 'pending';
                } elseif ($rand <= $statusDistribution['paid'] + $statusDistribution['sent'] + $statusDistribution['overdue']) {
                    $invoiceStatus = 'overdue';
                    $paymentStatus = 'pending';
                } else {
                    $invoiceStatus = 'draft';
                    $paymentStatus = 'pending';
                }
            }

            // Calculate invoice amounts
            $subtotal = $appointment->total_price;
            $totalAmount = $subtotal; // No additional fees
            $providerEarnings = $subtotal; // Provider gets full amount

            // Generate unique invoice number
            $invoiceNumber = $this->generateUniqueInvoiceNumber($appointment->created_at);

            // Create line items breakdown
            $lineItems = [
                [
                    'description' => $appointment->service->title,
                    'quantity' => 1,
                    'unit_price' => $appointment->base_price,
                    'total' => $appointment->base_price
                ]
            ];

            // Determine dates
            $issuedAt = $appointment->completed_at ?? $appointment->created_at;
            $sentAt = null;
            $dueDate = null;
            $paidAt = null;

            if ($invoiceStatus !== 'draft') {
                $sentAt = $issuedAt->copy()->addHours(rand(1, 24));
                $dueDate = $sentAt->copy()->addDays(7); // 7 days payment terms
            }

            if ($paymentStatus === 'completed') {
                $paidAt = $sentAt ? $sentAt->copy()->addDays(rand(1, 6)) : $issuedAt->copy()->addDays(rand(1, 7));
            }

            // Check if overdue (for overdue status)
            if ($invoiceStatus === 'overdue' && $dueDate) {
                $dueDate = Carbon::now()->subDays(rand(1, 30)); // Make it overdue
            }

            // Payment details for completed payments
            $paymentDetails = null;
            if ($paymentStatus === 'completed') {
                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                $paymentDetails = [
                    'method' => $paymentMethod,
                    'transaction_id' => 'TXN' . rand(100000, 999999),
                    'payment_date' => $paidAt->toDateString(),
                ];
            }

            // Invoice notes
            $invoiceNotes = [
                'Thank you for using HireMe services. Payment due within 7 days.',
                'Professional service completed as per agreement. Please remit payment promptly.',
                'Service delivered with satisfaction. Kindly process payment at your earliest convenience.',
                'Quality service provided. Payment terms: Net 7 days from invoice date.',
                'Completed work as discussed. Please arrange payment within the due date.'
            ];

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'appointment_id' => $appointment->id,
                'provider_id' => $appointment->provider_id,
                'client_id' => $appointment->client_id,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'service_fee' => $serviceFee,
                'platform_fee' => $platformFee,
                'total_amount' => $totalAmount,
                'provider_earnings' => $providerEarnings,
                'status' => $invoiceStatus,
                'payment_status' => $paymentStatus,
                'payment_method' => $paymentStatus === 'completed' ? $paymentDetails['method'] : null,
                'transaction_id' => $paymentDetails['transaction_id'] ?? null,
                'issued_at' => $issuedAt,
                'due_date' => $dueDate,
                'paid_at' => $paidAt,
                'sent_at' => $sentAt,
                'notes' => $invoiceNotes[array_rand($invoiceNotes)],
                'line_items' => $lineItems,
                'payment_details' => $paymentDetails,
                'stripe_payment_intent_id' => null, // Not using Stripe for seeded data
                'client_viewed_at' => $invoiceStatus !== 'draft' ? $sentAt?->copy()->addHours(rand(1, 48)) : null,
                'created_at' => $issuedAt,
                'updated_at' => $paidAt ?? $sentAt ?? $issuedAt
            ]);

            $createdInvoices++;
        }

        // Statistics
        $totalInvoices = Invoice::count();
        $paidInvoices = Invoice::where('payment_status', 'completed')->count();
        $pendingInvoices = Invoice::where('payment_status', 'pending')->count();
        $overdueInvoices = Invoice::where('status', 'overdue')->count();

        $totalAmount = Invoice::sum('total_amount');
        $paidAmount = Invoice::where('payment_status', 'completed')->sum('total_amount');
        $platformEarnings = Invoice::sum('service_fee');

        $this->command->info("Successfully created {$createdInvoices} invoices!");
        $this->command->info("\n📊 Invoice Status Summary:");
        $this->command->info("   • Total Invoices: {$totalInvoices}");
        $this->command->info("   • Paid Invoices: {$paidInvoices}");
        $this->command->info("   • Pending Payment: {$pendingInvoices}");
        $this->command->info("   • Overdue Invoices: {$overdueInvoices}");

        $this->command->info("\n💰 Financial Summary:");
        $this->command->info("   • Total Invoice Amount: LKR " . number_format($totalAmount, 2));
        $this->command->info("   • Paid Amount: LKR " . number_format($paidAmount, 2));
        $this->command->info("   • Platform Earnings: LKR " . number_format($platformEarnings, 2));

        $this->command->info("\n🌴 All invoices include realistic Sri Lankan business context");
        $this->command->info("💳 Payment methods: Cash, Card");
        $this->command->info("📄 Standard 7-day payment terms applied");
    }

    /**
     * Generate unique invoice number based on date with retry mechanism
     */
    private function generateUniqueInvoiceNumber($date)
    {
        $maxAttempts = 100; // Prevent infinite loops
        $attempts = 0;

        do {
            $prefix = 'INV';
            $year = $date->format('Y');
            $month = $date->format('m');

            // Add random component to ensure uniqueness
            $randomComponent = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $invoiceNumber = $prefix . $year . $month . $randomComponent;

            $attempts++;

            // If we've tried too many times, add timestamp to ensure uniqueness
            if ($attempts >= $maxAttempts) {
                $invoiceNumber = $prefix . $year . $month . time() . rand(10, 99);
                break;
            }
        } while (Invoice::where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }
}
