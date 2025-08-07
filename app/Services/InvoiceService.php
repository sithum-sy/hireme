<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Appointment;
use App\Models\Payment;
use App\Notifications\InvoiceCreated;
use App\Notifications\InvoiceSent;
use App\Events\InvoiceGenerated;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;


class InvoiceService
{
    /**
     * Create invoice from completed appointment (fix method name)
     */
    public function createInvoice(Appointment $appointment, array $options = [])
    {
        return $this->createInvoiceFromAppointment($appointment, $options);
    }

    /**
     * Create invoice from completed appointment - Enhanced
     */
    public function createInvoiceFromAppointment(Appointment $appointment, array $options = [])
    {
        return DB::transaction(function () use ($appointment, $options) {
            // Check if invoice already exists
            if ($appointment->invoice) {
                throw new \Exception('Invoice already exists for this appointment');
            }

            // Calculate totals with enhanced structure
            $totals = $this->calculateEnhancedTotals($appointment, $options);
            $subtotal = $totals['subtotal'];
            $discount = $totals['total_discounts'];
            $providerEarnings = $totals['final_total'];

            // SET PROVIDER EARNINGS = TOTAL PRICE (no platform fee)
            // $platformFee = 0;
            // $subtotal = $appointment->total_price; // Use total price directly
            // $providerEarnings = $subtotal; // Provider gets full amount

            // Determine invoice and appointment status based on send_invoice option
            $sendInvoice = $options['send_invoice'] ?? false;
            $invoiceStatus = $sendInvoice ? 'sent' : 'draft';
            $appointmentStatus = $sendInvoice ? Appointment::STATUS_INVOICE_SENT : Appointment::STATUS_COMPLETED;

            $invoice = Invoice::create([
                'invoice_number' => (new Invoice())->generateInvoiceNumber(),
                'appointment_id' => $appointment->id,
                'provider_id' => $appointment->provider_id,
                'client_id' => $appointment->client_id,
                'subtotal' => $totals['subtotal'],
                'tax_amount' => $options['tax_amount'] ?? 0,
                'platform_fee' => $totals['total_discounts'],
                'total_amount' => $totals['final_total'],
                'provider_earnings' => $totals['final_total'],
                'payment_method' => $options['payment_method'] ?? 'cash',
                'payment_status' => 'pending',
                'status' => $invoiceStatus,
                'due_date' => now()->addDays($options['due_days'] ?? 7),
                'notes' => $options['notes'] ?? 'Thank you for choosing our service. Payment is due within 7 days.',
                'line_items' => $this->generateEnhancedLineItems($appointment, $options),
                'issued_at' => now(),
                'sent_at' => $sendInvoice ? now() : null,
            ]);

            // Update appointment status based on send_invoice option
            $appointment->update([
                'status' => $appointmentStatus,
                'invoice_created_at' => now(),
                'invoice_sent_at' => $sendInvoice ? now() : null
            ]);

            // Dispatch event for notification system
            InvoiceGenerated::dispatch($appointment, $invoice);

            // Send notification if auto-created (legacy method)
            if (isset($options['auto_created']) && $options['auto_created']) {
                $this->notifyClientOfNewInvoice($invoice);
            }

            return $invoice;
        });
    }

    /**
     * Send invoice to client - Fix method name
     */
    public function sendInvoice(Invoice $invoice)
    {
        return $this->sendInvoiceToClient($invoice);
    }
    /**
     * Update existing invoice
     */
    public function updateInvoice(Invoice $invoice, array $data)
    {
        $updateData = array_filter([
            'payment_method' => $data['payment_method'] ?? null,
            'due_date' => $data['due_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'line_items' => $data['line_items'] ?? null
        ], function ($value) {
            return $value !== null;
        });

        $invoice->update($updateData);
        return $invoice;
    }

    /**
     * Send invoice to client
     */
    // public function sendInvoice(Invoice $invoice)
    // {
    //     if (!$invoice->canBeSent()) {
    //         throw new \Exception('Invoice cannot be sent in current status');
    //     }

    //     $invoice->markAsSent();

    //     // Here you would:
    //     // 1. Send email to client
    //     // 2. Send notification
    //     // 3. Generate PDF if needed
    //     $this->notifyClientInvoiceSent($invoice);

    //     return $invoice;
    // }

    /**
     * Send invoice to client and update appointment status
     */
    public function sendInvoiceToClient(Invoice $invoice)
    {
        if (!$invoice->canBeSent()) {
            throw new \Exception('Invoice cannot be sent in current status');
        }

        DB::transaction(function () use ($invoice) {
            // Mark invoice as sent
            $invoice->markAsSent();

            // Update appointment status
            if ($invoice->appointment) {
                $invoice->appointment->markInvoiceSent();
            }

            // Send notification to client (implement as needed)
            $this->notifyClientInvoiceSent($invoice);
        });

        return $invoice;
    }

    /**
     * Get provider invoice statistics
     */
    public function getProviderInvoiceStatistics($providerId)
    {
        $baseQuery = Invoice::forProvider($providerId);

        return [
            'total_invoices' => $baseQuery->count(),
            'total_amount' => $baseQuery->sum('total_amount'),
            'total_earnings' => $baseQuery->sum('total_amount'),
            'paid_invoices' => $baseQuery->paid()->count(),
            'paid_amount' => $baseQuery->paid()->sum('total_amount'),
            'pending_invoices' => $baseQuery->pending()->count(),
            'pending_amount' => $baseQuery->pending()->sum('total_amount'),
            'overdue_invoices' => $baseQuery->overdue()->count(),
            'overdue_amount' => $baseQuery->overdue()->sum('total_amount'),
            'this_month_earnings' => $baseQuery->paid()
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('total_amount'),
            'last_month_earnings' => $baseQuery->paid()
                ->whereMonth('paid_at', now()->subMonth()->month)
                ->whereYear('paid_at', now()->subMonth()->year)
                ->sum('total_amount')
        ];
    }

    /**
     * Get earnings data for charts
     */
    public function getEarningsData($providerId, $period, $year, $month = null)
    {
        switch ($period) {
            case 'week':
                return $this->getWeeklyEarnings($providerId);
            case 'month':
                return $this->getMonthlyEarnings($providerId, $year);
            case 'quarter':
                return $this->getQuarterlyEarnings($providerId, $year);
            case 'year':
                return $this->getYearlyEarnings($providerId);
            default:
                return $this->getMonthlyEarnings($providerId, $year);
        }
    }

    /**
     * Process client payment for invoice
     */
    public function processClientPayment(Invoice $invoice, array $paymentData)
    {
        if (!$invoice->canBepaid()) {
            throw new \Exception('Invoice cannot be paid in current status');
        }

        return DB::transaction(function () use ($invoice, $paymentData) {
            // Create payment record
            $payment = $invoice->createPayment(
                $paymentData['method'],
                $paymentData['amount'],
                [
                    'stripe_payment_intent_id' => $paymentData['stripe_payment_intent_id'] ?? null,
                    'stripe_payment_method_id' => $paymentData['stripe_payment_method_id'] ?? null,
                    'transaction_id' => $paymentData['transaction_id'] ?? null,
                    'payment_details' => $paymentData['details'] ?? []
                ]
            );

            // Process payment based on method
            if ($paymentData['method'] === 'stripe') {
                return $this->processStripePayment($payment, $paymentData);
            } else {
                return $this->processCashPayment($payment, $paymentData);
            }
        });
    }

    /**
     * Process Stripe payment
     */
    // private function processStripePayment(Payment $payment, array $paymentData)
    // {
    //     try {
    //         // Mark payment as processing
    //         $payment->markAsProcessing();

    //         // Here you would integrate with Stripe
    //         // For now, we'll simulate successful payment
    //         $payment->markAsCompleted([
    //             'stripe_payment_intent_id' => $paymentData['stripe_payment_intent_id'],
    //             'processed_at' => now(),
    //             'payment_method_details' => $paymentData['payment_method_details'] ?? []
    //         ]);

    //         // Mark invoice as paid
    //         $payment->invoice->markAsPaid([
    //             'payment_method' => 'stripe',
    //             'stripe_payment_intent_id' => $paymentData['stripe_payment_intent_id'],
    //             'transaction_id' => $paymentData['stripe_payment_intent_id']
    //         ]);

    //         return [
    //             'success' => true,
    //             'payment' => $payment,
    //             'message' => 'Payment processed successfully'
    //         ];
    //     } catch (\Exception $e) {
    //         $payment->markAsFailed($e->getMessage());

    //         return [
    //             'success' => false,
    //             'message' => 'Payment processing failed: ' . $e->getMessage()
    //         ];
    //     }
    // }
    private function processStripePayment(Payment $payment, array $paymentData)
    {
        try {
            // Set Stripe API key
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // Mark payment as processing
            $payment->markAsProcessing();

            // Create payment intent
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => intval($payment->amount * 100), // Convert to cents
                'currency' => strtolower($payment->currency),
                'payment_method' => $paymentData['stripe_payment_method_id'],
                'confirm' => true,
                'return_url' => config('app.url') . '/client/appointments/' . $payment->appointment_id,
                'metadata' => [
                    'appointment_id' => $payment->appointment_id,
                    'invoice_id' => $payment->invoice_id,
                    'client_id' => $payment->client_id,
                    'provider_id' => $payment->provider_id,
                ]
            ]);

            if ($paymentIntent->status === 'succeeded') {
                // Payment successful
                $payment->update([
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'stripe_charge_id' => $paymentIntent->charges->data[0]->id ?? null,
                    'transaction_id' => $paymentIntent->id,
                ]);

                $payment->markAsCompleted([
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'payment_method_details' => $paymentIntent->payment_method ?? null,
                    'processed_at' => now(),
                ]);

                // Mark invoice as paid
                $payment->invoice->markAsPaid([
                    'payment_method' => 'stripe',
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'transaction_id' => $paymentIntent->id,
                ]);

                return [
                    'success' => true,
                    'payment' => $payment,
                    'stripe_payment_intent' => $paymentIntent,
                    'message' => 'Payment processed successfully'
                ];
            } elseif ($paymentIntent->status === 'requires_action') {
                // 3D Secure authentication required
                return [
                    'success' => false,
                    'requires_action' => true,
                    'payment_intent' => $paymentIntent,
                    'message' => 'Payment requires additional authentication'
                ];
            } else {
                // Payment failed
                $payment->markAsFailed('Payment intent status: ' . $paymentIntent->status);

                return [
                    'success' => false,
                    'message' => 'Payment failed. Please try again.'
                ];
            }
        } catch (\Stripe\Exception\CardException $e) {
            // Card was declined
            $payment->markAsFailed($e->getMessage());

            return [
                'success' => false,
                'message' => 'Your card was declined: ' . $e->getMessage()
            ];
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            // Invalid parameters
            $payment->markAsFailed($e->getMessage());

            return [
                'success' => false,
                'message' => 'Payment processing error. Please try again.'
            ];
        } catch (\Exception $e) {
            // Other errors
            $payment->markAsFailed($e->getMessage());

            return [
                'success' => false,
                'message' => 'Payment processing failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process cash payment
     */
    // private function processCashPayment(Payment $payment, array $paymentData)
    // {
    //     try {
    //         // For cash payments, mark as completed immediately
    //         $payment->markAsCompleted([
    //             'payment_method' => 'cash',
    //             'marked_by_client' => true,
    //             'processed_at' => now(),
    //             'notes' => $paymentData['notes'] ?? 'Client confirmed cash payment'
    //         ]);

    //         // Mark invoice as paid
    //         $payment->invoice->markAsPaid([
    //             'payment_method' => 'cash',
    //             'transaction_id' => $payment->id,
    //             'confirmed_by_client' => true
    //         ]);

    //         return [
    //             'success' => true,
    //             'payment' => $payment,
    //             'message' => 'Cash payment recorded successfully'
    //         ];
    //     } catch (\Exception $e) {
    //         $payment->markAsFailed($e->getMessage());

    //         return [
    //             'success' => false,
    //             'message' => 'Cash payment processing failed: ' . $e->getMessage()
    //         ];
    //     }
    // }
    private function processCashPayment(Payment $payment, array $paymentData)
    {
        try {
            // For cash payments, mark as completed immediately
            // In a real scenario, you might want provider confirmation
            $payment->markAsCompleted([
                'payment_method' => 'cash',
                'marked_by_client' => true,
                'processed_at' => now(),
                'notes' => $paymentData['notes'] ?? 'Client confirmed cash payment',
                'requires_provider_confirmation' => true // Flag for provider to confirm
            ]);

            // Mark invoice as paid
            $payment->invoice->markAsPaid([
                'payment_method' => 'cash',
                'transaction_id' => 'CASH_' . $payment->id,
                'confirmed_by_client' => true,
                'awaiting_provider_confirmation' => true
            ]);

            // Notify provider about cash payment (implement as needed)
            $this->notifyProviderCashPayment($payment);

            return [
                'success' => true,
                'payment' => $payment,
                'message' => 'Cash payment recorded successfully. Provider will be notified.'
            ];
        } catch (\Exception $e) {
            $payment->markAsFailed($e->getMessage());

            return [
                'success' => false,
                'message' => 'Cash payment processing failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Notify provider about cash payment
     */
    private function notifyProviderCashPayment(Payment $payment)
    {
        // Implement notification logic here
        // Could be email, SMS, in-app notification, etc.
        Log::info("Cash payment notification sent to provider", [
            'payment_id' => $payment->id,
            'provider_id' => $payment->provider_id,
            'amount' => $payment->amount
        ]);
    }

    /**
     * Get client invoice with payment details
     */
    public function getClientInvoice($invoiceId, $clientId)
    {
        $invoice = Invoice::where('id', $invoiceId)
            ->where('client_id', $clientId)
            ->with(['appointment.service', 'appointment.provider', 'payment'])
            ->firstOrFail();

        // Mark as viewed by client
        if (!$invoice->hasBeenViewed()) {
            $invoice->markAsViewed();
        }

        return $invoice;
    }

    /**
     * Generate receipt data after payment
     */
    // public function generateReceiptData(Payment $payment)
    // {
    //     return [
    //         'payment_id' => $payment->id,
    //         'invoice_id' => $payment->invoice_id,
    //         'appointment_id' => $payment->appointment_id,
    //         'amount' => $payment->amount,
    //         'currency' => $payment->currency,
    //         'method' => $payment->method,
    //         'status' => $payment->status,
    //         'processed_at' => $payment->processed_at,
    //         'transaction_id' => $payment->transaction_id,
    //         'service_title' => $payment->appointment->service->title ?? 'Service',
    //         'provider_name' => $payment->provider->name ?? 'Provider',
    //         'client_name' => $payment->client->name ?? 'Client'
    //     ];
    // }
    public function generateReceiptData(Payment $payment)
    {
        return [
            'receipt_id' => 'RCP-' . str_pad($payment->id, 8, '0', STR_PAD_LEFT),
            'payment_id' => $payment->id,
            'invoice_number' => $payment->invoice->formatted_invoice_number,
            'appointment_id' => $payment->appointment_id,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'method' => ucfirst($payment->method),
            'status' => ucfirst($payment->status),
            'processed_at' => $payment->processed_at,
            'transaction_id' => $payment->transaction_id,
            'service_details' => [
                'title' => $payment->appointment->service->title ?? 'Service',
                'date' => $payment->appointment->appointment_date,
                'time' => $payment->appointment->appointment_time,
            ],
            'provider_details' => [
                'name' => $payment->provider->name ?? 'Provider',
                'business_name' => $payment->provider->providerProfile->business_name ?? null,
            ],
            'client_details' => [
                'name' => $payment->client->name ?? 'Client',
                'email' => $payment->client->email ?? null,
            ]
        ];
    }

    /**
     * Calculate enhanced totals with additional charges and discounts
     */
    private function calculateEnhancedTotals(Appointment $appointment, array $options = [])
    {
        // Calculate subtotal from line items if provided, otherwise use appointment total_price
        $subtotal = $this->calculateSubtotalFromLineItems($options['line_items'] ?? [], $appointment->total_price);
        $totalAdditionalCharges = 0;
        $totalDiscounts = 0;

        // Calculate additional charges
        if (isset($options['additional_charges']) && is_array($options['additional_charges'])) {
            foreach ($options['additional_charges'] as $charge) {
                $totalAdditionalCharges += floatval($charge['amount'] ?? 0);
            }
        }

        // Calculate discounts
        if (isset($options['discounts']) && is_array($options['discounts'])) {
            foreach ($options['discounts'] as $discount) {
                $totalDiscounts += floatval($discount['amount'] ?? 0);
            }
        } else {
            // Legacy: Default 15% discount if no custom discounts provided
            $totalDiscounts = $subtotal * 0.15;
        }

        $finalTotal = ($subtotal + $totalAdditionalCharges) - $totalDiscounts;

        return [
            'subtotal' => $subtotal,
            'total_additional_charges' => $totalAdditionalCharges,
            'total_discounts' => $totalDiscounts,
            'final_total' => max(0, $finalTotal) // Ensure non-negative total
        ];
    }

    /**
     * Calculate subtotal from line items array
     */
    private function calculateSubtotalFromLineItems(array $lineItems, $fallbackAmount = 0)
    {
        if (empty($lineItems)) {
            return floatval($fallbackAmount);
        }

        $subtotal = 0;
        foreach ($lineItems as $item) {
            if (isset($item['amount'])) {
                $subtotal += floatval($item['amount']);
            } elseif (isset($item['quantity']) && isset($item['rate'])) {
                // Fallback calculation if amount is not provided
                $subtotal += floatval($item['quantity']) * floatval($item['rate']);
            }
        }

        return $subtotal > 0 ? $subtotal : floatval($fallbackAmount);
    }

    /**
     * Generate enhanced line items with additional charges and discounts
     */
    private function generateEnhancedLineItems(Appointment $appointment, array $options = [])
    {
        $structure = [
            'line_items' => [],
            'additional_charges' => [],
            'discounts' => [],
            'totals' => [] // Will be calculated after line items are set
        ];

        // Generate main service line items
        if (isset($options['line_items']) && !empty($options['line_items'])) {
            // Use custom line items if provided - always preserve all line items
            foreach ($options['line_items'] as $item) {
                if (isset($item['description']) && isset($item['quantity']) && isset($item['rate']) && isset($item['amount'])) {
                    $structure['line_items'][] = [
                        'type' => $item['type'] ?? 'service',
                        'description' => $item['description'],
                        'quantity' => floatval($item['quantity']),
                        'rate' => floatval($item['rate']),
                        'amount' => floatval($item['amount'])
                    ];
                }
            }
        } else {
            // Generate default service item
            $structure['line_items'][] = [
                'type' => 'service',
                'description' => $appointment->service->title ?? 'Service',
                'quantity' => floatval($appointment->duration_hours ?? 1),
                'rate' => floatval($appointment->total_price / ($appointment->duration_hours ?? 1)),
                'amount' => floatval($appointment->total_price)
            ];
        }

        // Add additional charges
        if (isset($options['additional_charges']) && is_array($options['additional_charges'])) {
            foreach ($options['additional_charges'] as $charge) {
                $structure['additional_charges'][] = [
                    'type' => $charge['type'] ?? 'additional',
                    'description' => $charge['description'] ?? 'Additional Charge',
                    'quantity' => floatval($charge['quantity'] ?? 1),
                    'rate' => floatval($charge['rate'] ?? $charge['amount'] ?? 0),
                    'amount' => floatval($charge['amount'] ?? 0),
                    'reason' => $charge['reason'] ?? null,
                    'client_approved' => $charge['client_approved'] ?? false
                ];
            }
        }

        // Add discounts
        if (isset($options['discounts']) && is_array($options['discounts'])) {
            foreach ($options['discounts'] as $discount) {
                $structure['discounts'][] = [
                    'type' => $discount['type'] ?? 'fixed',
                    'description' => $discount['description'] ?? 'Discount',
                    'rate' => floatval($discount['rate'] ?? 0),
                    'amount' => floatval($discount['amount'] ?? 0),
                    'reason' => $discount['reason'] ?? null
                ];
            }
        } else {
            // Legacy: Default 15% discount - calculate from line items subtotal
            $lineItemsSubtotal = 0;
            foreach ($structure['line_items'] as $item) {
                $lineItemsSubtotal += floatval($item['amount']);
            }
            $discountAmount = $lineItemsSubtotal * 0.15;
            $structure['discounts'][] = [
                'type' => 'percentage',
                'description' => 'Service Discount',
                'rate' => 15,
                'amount' => $discountAmount,
                'reason' => 'Standard service discount'
            ];
        }

        // Now calculate totals with the final line items
        $structure['totals'] = $this->calculateEnhancedTotals($appointment, [
            'line_items' => $structure['line_items'],
            'additional_charges' => $structure['additional_charges'],
            'discounts' => $structure['discounts']
        ]);

        return $structure;
    }

    /**
     * Generate line items from appointment (Legacy method for backward compatibility)
     */
    private function generateLineItems(Appointment $appointment, array $customItems = [])
    {
        $items = [];

        // If custom items are provided, use them exclusively
        if (!empty($customItems)) {
            foreach ($customItems as $item) {
                // Ensure required fields exist
                if (isset($item['description']) && isset($item['quantity']) && isset($item['rate']) && isset($item['amount'])) {
                    $items[] = [
                        'description' => $item['description'],
                        'quantity' => (float) $item['quantity'],
                        'rate' => (float) $item['rate'],
                        'amount' => (float) $item['amount']
                    ];
                }
            }
        } else {
            // Only generate default items if no custom items provided
            // Main service item
            $items[] = [
                'description' => $appointment->service->title ?? 'Service',
                'quantity' => 1,
                'rate' => $appointment->base_price ?? $appointment->total_price,
                'amount' => $appointment->base_price ?? $appointment->total_price
            ];

            // Travel fee if applicable
            if ($appointment->travel_fee > 0) {
                $items[] = [
                    'description' => 'Travel/Transportation Fee',
                    'quantity' => 1,
                    'rate' => $appointment->travel_fee,
                    'amount' => $appointment->travel_fee
                ];
            }
        }

        return $items;
    }

    private function getWeeklyEarnings($providerId)
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $dailyEarnings = Invoice::forProvider($providerId)
            ->paid()
            ->whereBetween('paid_at', [$startOfWeek, $endOfWeek])
            ->selectRaw('DATE(paid_at) as date, SUM(provider_earnings) as earnings')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'period' => 'This Week',
            'data' => $dailyEarnings,
            'total' => $dailyEarnings->sum('earnings')
        ];
    }

    private function getMonthlyEarnings($providerId, $year)
    {
        $monthlyEarnings = Invoice::forProvider($providerId)
            ->paid()
            ->whereYear('paid_at', $year)
            ->selectRaw('MONTH(paid_at) as month, SUM(provider_earnings) as earnings')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'period' => "Year $year",
            'data' => $monthlyEarnings,
            'total' => $monthlyEarnings->sum('earnings')
        ];
    }

    private function getQuarterlyEarnings($providerId, $year)
    {
        $quarterlyEarnings = Invoice::forProvider($providerId)
            ->paid()
            ->whereYear('paid_at', $year)
            ->selectRaw('QUARTER(paid_at) as quarter, SUM(provider_earnings) as earnings')
            ->groupBy('quarter')
            ->orderBy('quarter')
            ->get();

        return [
            'period' => "Year $year - Quarterly",
            'data' => $quarterlyEarnings,
            'total' => $quarterlyEarnings->sum('earnings')
        ];
    }

    private function getYearlyEarnings($providerId)
    {
        $yearlyEarnings = Invoice::forProvider($providerId)
            ->paid()
            ->selectRaw('YEAR(paid_at) as year, SUM(provider_earnings) as earnings')
            ->groupBy('year')
            ->orderBy('year')
            ->get();

        return [
            'period' => 'All Years',
            'data' => $yearlyEarnings,
            'total' => $yearlyEarnings->sum('earnings')
        ];
    }

    /*
     * Notify client about new invoice
     */
    private function notifyClientOfNewInvoice(Invoice $invoice)
    {
        try {
            $client = $invoice->client;
            if ($client && $client->email) {
                // You can use Laravel notifications or send email directly
                // $client->notify(new InvoiceCreated($invoice));

                // For now, log it
                Log::info("New invoice notification sent to client {$client->email} for invoice {$invoice->id}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to notify client about new invoice: " . $e->getMessage());
        }
    }

    /**
     * Notify client that invoice was sent
     */
    private function notifyClientInvoiceSent(Invoice $invoice)
    {
        try {
            $client = $invoice->client;
            if ($client && $client->email) {
                // $client->notify(new InvoiceSent($invoice));

                Log::info("Invoice sent notification to client {$client->email} for invoice {$invoice->id}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to notify client about sent invoice: " . $e->getMessage());
        }
    }
}
