<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Appointment;
use App\Notifications\InvoiceCreated;
use App\Notifications\InvoiceSent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class InvoiceService
{
    /**
     * Create invoice from completed appointment
     */
    public function createInvoiceFromAppointment(Appointment $appointment, array $options = [])
    {
        return DB::transaction(function () use ($appointment, $options) {
            $subtotal = $appointment->total_price;
            $platformFeeRate = 0.15; // 15% platform fee
            $platformFee = $subtotal * $platformFeeRate;
            $providerEarnings = $subtotal - $platformFee;

            $invoice = Invoice::create([
                'invoice_number' => (new Invoice())->generateInvoiceNumber(),
                'appointment_id' => $appointment->id,
                'provider_id' => $appointment->provider_id,
                'client_id' => $appointment->client_id,
                'subtotal' => $subtotal,
                'tax_amount' => 0,
                'platform_fee' => $platformFee,
                'total_amount' => $subtotal,
                'provider_earnings' => $providerEarnings,
                'payment_method' => $options['payment_method'] ?? null,
                'due_date' => now()->addDays($options['due_days'] ?? 7),
                'notes' => $options['notes'] ?? null,
                'line_items' => $this->generateLineItems($appointment, $options['line_items'] ?? []),
                'issued_at' => now(),
                'status' => 'draft' // Start as draft
            ]);

            // Send notification to client about new invoice
            if (isset($options['auto_created']) && $options['auto_created']) {
                $this->notifyClientOfNewInvoice($invoice);
            }

            return $invoice;
        });
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
    public function sendInvoice(Invoice $invoice)
    {
        if (!$invoice->canBeSent()) {
            throw new \Exception('Invoice cannot be sent in current status');
        }

        $invoice->markAsSent();

        // Here you would:
        // 1. Send email to client
        // 2. Send notification
        // 3. Generate PDF if needed
        $this->notifyClientInvoiceSent($invoice);

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
            'total_earnings' => $baseQuery->sum('provider_earnings'),
            'paid_invoices' => $baseQuery->paid()->count(),
            'paid_amount' => $baseQuery->paid()->sum('total_amount'),
            'pending_invoices' => $baseQuery->pending()->count(),
            'pending_amount' => $baseQuery->pending()->sum('total_amount'),
            'overdue_invoices' => $baseQuery->overdue()->count(),
            'overdue_amount' => $baseQuery->overdue()->sum('total_amount'),
            'this_month_earnings' => $baseQuery->paid()
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('provider_earnings'),
            'last_month_earnings' => $baseQuery->paid()
                ->whereMonth('paid_at', now()->subMonth()->month)
                ->whereYear('paid_at', now()->subMonth()->year)
                ->sum('provider_earnings')
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
     * Generate line items from appointment
     */
    private function generateLineItems(Appointment $appointment, array $customItems = [])
    {
        $items = [];

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

        // Add custom items
        foreach ($customItems as $item) {
            $items[] = [
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'rate' => $item['rate'],
                'amount' => $item['amount']
            ];
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
                \Log::info("New invoice notification sent to client {$client->email} for invoice {$invoice->id}");
            }
        } catch (\Exception $e) {
            \Log::error("Failed to notify client about new invoice: " . $e->getMessage());
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

                \Log::info("Invoice sent notification to client {$client->email} for invoice {$invoice->id}");
            }
        } catch (\Exception $e) {
            \Log::error("Failed to notify client about sent invoice: " . $e->getMessage());
        }
    }
}
