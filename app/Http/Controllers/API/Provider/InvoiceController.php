<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Appointment;
use App\Models\Payment;
use App\Services\InvoiceService;
use App\Events\PaymentReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Get provider's invoices
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
            'payment_status' => 'nullable|in:pending,processing,completed,failed,refunded',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $user = Auth::user();
            $query = Invoice::forProvider($user->id)
                ->with(['appointment.service', 'client']);

            // Apply filters
            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->payment_status) {
                $query->where('payment_status', $request->payment_status);
            }

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $perPage = $request->get('per_page', 15);
            $invoices = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch invoices'
            ], 500);
        }
    }

    /**
     * Get specific invoice
     */
    public function show(Invoice $invoice)
    {
        if ($invoice->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found'
            ], 404);
        }

        $invoice->load(['appointment.service', 'client', 'provider']);

        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    /**
     * Create invoice for appointment
     */
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'payment_method' => 'nullable|string|in:cash,card,bank_transfer,online',
            'due_days' => 'nullable|integer|min:0|max:30',
            'notes' => 'nullable|string|max:1000',
            'line_items' => 'nullable|array',
            'line_items.*.description' => 'required_with:line_items|string',
            'line_items.*.quantity' => 'required_with:line_items|numeric|min:1',
            'line_items.*.rate' => 'required_with:line_items|numeric|min:0',
            'line_items.*.amount' => 'required_with:line_items|numeric|min:0'
        ]);

        try {
            $appointment = Appointment::findOrFail($request->appointment_id);

            // Verify provider owns this appointment
            if ($appointment->provider_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - This appointment does not belong to you'
                ], 403);
            }

            // Check if appointment is completed
            if ($appointment->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only create invoices for completed appointments',
                    'debug' => [
                        'appointment_status' => $appointment->status,
                        'required_status' => 'completed'
                    ]
                ], 400);
            }

            // Check if invoice already exists
            if ($appointment->invoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice already exists for this appointment',
                    'existing_invoice_id' => $appointment->invoice->id
                ], 400);
            }

            // Create invoice
            $invoiceData = [
                'payment_method' => $request->payment_method,
                'due_days' => $request->due_days ?? 7,
                'notes' => $request->notes,
                'line_items' => $request->line_items ?? [],
                'auto_created' => false
            ];

            $invoice = $this->invoiceService->createInvoiceFromAppointment($appointment, $invoiceData);

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data' => $invoice->load(['appointment.service', 'client'])
            ], 201);
        } catch (\Exception $e) {
            Log::error('Invoice creation failed', [
                'appointment_id' => $request->appointment_id,
                'provider_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update invoice
     */
    public function update(Request $request, Invoice $invoice)
    {
        $request->validate([
            'payment_method' => 'nullable|string|in:cash,card,bank_transfer,online',
            'due_date' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'line_items' => 'nullable|array'
        ]);

        if ($invoice->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$invoice->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice cannot be edited'
            ], 400);
        }

        try {
            $invoice = $this->invoiceService->updateInvoice($invoice, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Invoice updated successfully',
                'data' => $invoice->fresh()->load(['appointment.service', 'client'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update invoice'
            ], 500);
        }
    }

    /**
     * Send invoice to client
     */
    public function send(Invoice $invoice)
    {
        if ($invoice->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$invoice->canBeSent()) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice cannot be sent',
                'debug' => [
                    'current_status' => $invoice->status,
                    'allowed_statuses' => ['draft']
                ]
            ], 400);
        }

        try {
            $this->invoiceService->sendInvoiceToClient($invoice);

            return response()->json([
                'success' => true,
                'message' => 'Invoice sent successfully',
                'data' => $invoice->fresh(['appointment.service', 'client'])
            ]);
        } catch (\Exception $e) {
            Log::error('Invoice sending failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark invoice as paid
     */
    public function markPaid(Request $request, Invoice $invoice)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        if ($invoice->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $paymentDetails = [
                'payment_method' => $request->payment_method,
                'transaction_id' => $request->transaction_id,
                'payment_date' => $request->payment_date ?? now()->toDateString(),
                'notes' => $request->notes,
                'marked_by' => Auth::user()->name
            ];

            $invoice->markAsPaid($paymentDetails);

            return response()->json([
                'success' => true,
                'message' => 'Invoice marked as paid',
                'data' => $invoice->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark invoice as paid'
            ], 500);
        }
    }

    /**
     * Get invoice statistics
     */
    public function statistics(Request $request)
    {
        try {
            $user = Auth::user();
            $stats = $this->invoiceService->getProviderInvoiceStatistics($user->id);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Get earnings overview
     */
    public function earnings(Request $request)
    {
        $request->validate([
            'period' => 'nullable|in:week,month,quarter,year',
            'year' => 'nullable|integer|min:2020|max:2030',
            'month' => 'nullable|integer|min:1|max:12'
        ]);

        try {
            $user = Auth::user();
            $period = $request->get('period', 'month');
            $year = $request->get('year', now()->year);
            $month = $request->get('month', now()->month);

            $earnings = $this->invoiceService->getEarningsData($user->id, $period, $year, $month);

            return response()->json([
                'success' => true,
                'data' => $earnings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch earnings data'
            ], 500);
        }
    }

    /**
     * Confirm cash payment received from client
     */
    public function confirmCashReceived(Request $request, Invoice $invoice)
    {
        $request->validate([
            'amount_received' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
            'received_at' => 'nullable|date'
        ]);

        if ($invoice->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if invoice is for cash payment and pending
        if ($invoice->payment_method !== 'cash' || $invoice->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This invoice is not eligible for cash confirmation',
                'debug' => [
                    'payment_method' => $invoice->payment_method,
                    'payment_status' => $invoice->payment_status
                ]
            ], 400);
        }

        try {
            DB::transaction(function () use ($invoice, $request) {
                // Create payment record
                $payment = Payment::create([
                    'appointment_id' => $invoice->appointment_id,
                    'invoice_id' => $invoice->id,
                    'client_id' => $invoice->client_id,
                    'provider_id' => $invoice->provider_id,
                    'amount' => $request->amount_received,
                    'currency' => 'LKR',
                    'method' => 'cash',
                    'status' => 'completed',
                    'reference_id' => 'CASH_' . now()->format('YmdHis') . '_' . $invoice->id,
                    'transaction_id' => 'CASH_CONFIRMED_' . $invoice->id,
                    'processed_at' => $request->received_at ? Carbon::parse($request->received_at) : now(),
                    'notes' => $request->notes ?? 'Cash payment confirmed by provider',
                    'confirmed_by_provider' => true,
                    'provider_confirmation_at' => now()
                ]);

                // Update invoice status
                $invoice->update([
                    'payment_status' => 'completed',
                    'paid_at' => $payment->processed_at,
                    'status' => 'paid'
                ]);

                // Update appointment status
                $invoice->appointment->update([
                    'status' => Appointment::STATUS_PAID,
                    'payment_received_at' => $payment->processed_at
                ]);

                // Dispatch payment received event for notifications
                PaymentReceived::dispatch($invoice->appointment, $payment, $invoice);
            });

            return response()->json([
                'success' => true,
                'message' => 'Cash payment confirmed successfully',
                'data' => $invoice->fresh(['appointment', 'payment'])
            ]);
        } catch (\Exception $e) {
            Log::error('Cash payment confirmation failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm cash payment'
            ], 500);
        }
    }
}
