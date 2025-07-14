<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Appointment;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
            'line_items.*.description' => 'required|string',
            'line_items.*.quantity' => 'required|numeric|min:1',
            'line_items.*.rate' => 'required|numeric|min:0',
            'line_items.*.amount' => 'required|numeric|min:0'
        ]);

        try {
            $appointment = Appointment::findOrFail($request->appointment_id);

            // Verify provider owns this appointment
            if ($appointment->provider_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if appointment is completed
            if ($appointment->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only create invoices for completed appointments'
                ], 400);
            }

            // Check if invoice already exists
            if ($appointment->invoices()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice already exists for this appointment'
                ], 400);
            }

            $invoice = $this->invoiceService->createInvoiceFromAppointment(
                $appointment,
                $request->only(['payment_method', 'due_days', 'notes', 'line_items'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'data' => $invoice->load(['appointment.service', 'client'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice'
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
                'message' => 'Invoice cannot be sent'
            ], 400);
        }

        try {
            $this->invoiceService->sendInvoice($invoice);

            return response()->json([
                'success' => true,
                'message' => 'Invoice sent successfully',
                'data' => $invoice->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send invoice'
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
}
