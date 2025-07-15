<?php
// app/Http/Controllers/API/Client/AppointmentController.php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Services\AppointmentService;
use App\Services\InvoiceService;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    protected $invoiceService;
    protected $reviewService;

    public function __construct()
    {
        // Initialize services - create them if they don't exist yet
        $this->invoiceService = app(InvoiceService::class);
        $this->reviewService = app(ReviewService::class);
    }

    /**
     * Create new appointment (your existing store method - keeping as is)
     */
    public function store(Request $request)
    {
        try {
            // Log the incoming request data
            // Log::info('Booking request received', [
            //     'data' => $request->all(),
            //     'user_id' => Auth::id()
            // ]);

            // Log specifically the quote-related fields
            // Log::info('Quote-related fields in request', [
            //     'quote_id' => $request->input('quote_id'),
            //     'isFromQuote' => $request->boolean('isFromQuote'),
            //     'booking_source' => $request->input('booking_source')
            // ]);

            $validatedData = $request->validate([
                'service_id' => 'required|exists:services,id',
                'provider_id' => 'required|exists:users,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required',
                'duration_hours' => 'required|numeric|min:1|max:24',
                'total_price' => 'required|numeric|min:0',
                'client_phone' => 'nullable|string|max:20',
                'client_email' => 'nullable|email',
                'client_address' => 'nullable|string|max:255',
                'client_city' => 'nullable|string|max:100',
                'client_postal_code' => 'nullable|string|max:20',
                'location_type' => 'required|in:client_address,provider_location,custom_location',
                'location_instructions' => 'nullable|string|max:1000',
                'contact_preference' => 'nullable|in:phone,message',
                'client_notes' => 'nullable|string|max:1000',
                'payment_method' => 'required|in:cash,card,bank_transfer',
                'agreed_to_terms' => 'required|boolean|accepted',
                'base_price' => 'nullable|numeric|min:0',
                'travel_fee' => 'nullable|numeric|min:0',
                'booking_source' => 'nullable|string|max:50',
                'quote_id' => 'nullable|exists:quotes,id',
                'isFromQuote' => 'nullable|boolean',
            ]);

            // Log the validated data
            // Log::info('Validated booking data', [
            //     'validated' => $validatedData,
            //     'quote_id' => $validatedData['quote_id'] ?? null,
            //     'isFromQuote' => $request->boolean('isFromQuote')
            // ]);

            // Ensure at least one contact method is provided
            if (empty($validatedData['client_phone']) && empty($validatedData['client_email'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Either phone number or email is required',
                    'errors' => ['contact' => ['Contact information is required']]
                ], 422);
            }

            DB::beginTransaction();

            // Create the appointment
            $appointment = Appointment::create([
                'client_id' => Auth::id(),
                'provider_id' => $validatedData['provider_id'],
                'service_id' => $validatedData['service_id'],
                'appointment_date' => $validatedData['appointment_date'],
                'appointment_time' => $validatedData['appointment_time'],
                'duration_hours' => $validatedData['duration_hours'],
                'total_price' => $validatedData['total_price'],
                'base_price' => $request->base_price ?? $validatedData['total_price'],
                'travel_fee' => $request->travel_fee ?? 0,
                'location_type' => $validatedData['location_type'],
                'client_address' => $validatedData['client_address'],
                'client_city' => $request->client_city,
                'client_postal_code' => $request->client_postal_code,
                'location_instructions' => $request->location_instructions,
                'client_phone' => $validatedData['client_phone'],
                'client_email' => $validatedData['client_email'],
                'contact_preference' => $request->contact_preference ?? 'phone',
                'client_notes' => $request->client_notes,
                'payment_method' => $validatedData['payment_method'],
                'status' => 'pending',
                'booking_source' => $validatedData['booking_source'] ?? 'web_app',
                'quote_id' => $validatedData['quote_id'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Log::info('Appointment created', [
            //     'appointment_id' => $appointment->id,
            //     'quote_id' => $appointment->quote_id
            // ]);

            // If this booking is from a quote, update the quote status
            if (!empty($validatedData['quote_id']) || $request->boolean('isFromQuote')) {
                $quote = Quote::find($validatedData['quote_id']);
                if ($quote && $quote->client_id === Auth::id()) {
                    $quote->update([
                        'status' => 'accepted',
                        'client_responded_at' => now(),
                        'client_response_notes' => 'Quote accepted via appointment booking',
                        'appointment_id' => $appointment->id,
                    ]);

                    // Log::info('Quote status updated to accepted', [
                    //     'quote_id' => $quote->id,
                    //     'appointment_id' => $appointment->id,
                    //     'client_id' => Auth::id()
                    // ]);
                }
            }

            // Load relationships for response
            $appointment->load(['service', 'provider', 'client']);

            DB::commit();

            // Log::info('Booking created successfully', [
            //     'appointment_id' => $appointment->id,
            //     'client_id' => Auth::id(),
            //     'from_quote' => !empty($validatedData['quote_id'])
            // ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking request submitted successfully! The provider will confirm within 2 hours.',
                'data' => [
                    'id' => $appointment->id,
                    'confirmation_code' => $appointment->confirmation_code,
                    'status' => $appointment->status,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'total_price' => $appointment->total_price,
                    'service' => [
                        'id' => $appointment->service->id,
                        'title' => $appointment->service->title,
                    ],
                    'provider' => [
                        'id' => $appointment->provider->id,
                        'name' => $appointment->provider->first_name . ' ' . $appointment->provider->last_name,
                        'business_name' => $appointment->provider->provider_profile->business_name ?? null,
                    ],
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Booking creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'client_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get client's appointments with enhanced filtering and payment/review data
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $query = Appointment::where('client_id', Auth::id())
                ->with([
                    'service.category',
                    'provider.providerProfile',
                    'invoice',
                    'payment',
                    'clientReview'
                ]);

            // Apply status filter
            if ($request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Apply date filters
            if ($request->date_from) {
                $query->whereDate('appointment_date', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('appointment_date', '<=', $request->date_to);
            }

            $perPage = $request->get('per_page', 15);
            $appointments = $query->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'message' => 'Appointments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointments',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get specific appointment with all details including invoice and payment
     */
    public function show(Appointment $appointment)
    {
        // Ensure user can only see their own appointments
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found',
            ], 404);
        }

        try {
            // Load all necessary relationships
            $appointment->load([
                'service.category',
                'provider.providerProfile',
                'client',
                'invoice',
                'payment',
                'clientReview',
                'providerReview',
                'quote'
            ]);

            // Mark invoice as viewed by client if it exists
            if ($appointment->invoice && !$appointment->invoice->hasBeenViewed()) {
                $appointment->invoice->markAsViewed();
            }

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'message' => 'Appointment details retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load appointment details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Cancel appointment (your existing cancel method - enhanced)
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        $request->validate([
            'cancellation_reason' => 'nullable|string|max:500'
        ]);

        // Ensure user can only cancel their own appointments
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found',
            ], 404);
        }

        // Check if appointment can be cancelled
        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot be cancelled',
            ], 422);
        }

        // Check cancellation deadline (24 hours before appointment)
        $appointmentDateTime = $appointment->full_appointment_date_time;
        $hoursUntilAppointment = now()->diffInHours($appointmentDateTime, false);

        if ($hoursUntilAppointment <= 24) {
            return response()->json([
                'success' => false,
                'message' => 'Appointments cannot be cancelled within 24 hours of the scheduled time',
            ], 422);
        }

        try {
            $appointment->cancel('client', $request->cancellation_reason);

            return response()->json([
                'success' => true,
                'message' => 'Appointment cancelled successfully',
                'data' => $appointment->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel appointment',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * NEW: Process payment for appointment invoice
     */
    public function payInvoice(Request $request, Appointment $appointment)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,cash',
            'amount' => 'required|numeric|min:0',
            'stripe_payment_method_id' => 'required_if:payment_method,stripe|string',
            'notes' => 'nullable|string|max:500'
        ]);

        // Authorization checks
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if (!$appointment->canReceivePayment()) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot receive payment at this time'
            ], 400);
        }

        $invoice = $appointment->invoice;
        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'No invoice found for this appointment',
                'debug' => [
                    'appointment_id' => $appointment->id,
                    'appointment_status' => $appointment->status,
                    'has_invoice' => false
                ]
            ], 404);
        }

        // Check if appointment can receive payment
        if (!$appointment->canReceivePayment()) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot receive payment at this time',
                'debug' => [
                    'appointment_status' => $appointment->status,
                    'allowed_statuses' => ['completed', 'invoice_sent', 'payment_pending'],
                    'has_invoice' => !!$invoice
                ]
            ], 400);
        }

        if (!$invoice->canBePaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice cannot be paid in its current status',
                'debug' => [
                    'invoice_id' => $invoice->id,
                    'invoice_status' => $invoice->status,
                    'payment_status' => $invoice->payment_status,
                    'invoice_total' => $invoice->total_amount,
                    'request_amount' => $request->amount
                ]
            ], 400);
        }

        // Validate payment amount
        if ($request->amount != $invoice->total_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount does not match invoice total',
                'debug' => [
                    'invoice_amount' => $invoice->total_amount,
                    'payment_amount' => $request->amount
                ]
            ], 400);
        }

        try {
            // Process payment through InvoiceService
            $paymentData = [
                'method' => $request->payment_method,
                'amount' => $request->amount,
                'stripe_payment_method_id' => $request->stripe_payment_method_id,
                'notes' => $request->notes,
                'details' => [
                    'user_agent' => $request->header('User-Agent'),
                    'ip_address' => $request->ip(),
                    'processed_by' => 'client'
                ]
            ];

            $result = $this->invoiceService->processClientPayment($invoice, $paymentData);

            if ($result['success']) {
                // Reload appointment with fresh data
                $appointment->load([
                    'service.category',
                    'provider.providerProfile',
                    'invoice',
                    'payment'
                ]);

                return response()->json([
                    'success' => true,
                    'data' => $appointment,
                    'payment' => $result['payment'],
                    'message' => 'Payment processed successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'client_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * NEW: Submit review for appointment
     */
    public function submitReview(Request $request, Appointment $appointment)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|min:10|max:1000',
            'quality_rating' => 'nullable|integer|min:1|max:5',
            'punctuality_rating' => 'nullable|integer|min:1|max:5',
            'communication_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'would_recommend' => 'nullable|boolean',
            'review_images' => 'nullable|array|max:5',
            'review_images.*' => 'nullable|string'
        ]);

        // Authorization checks
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if (!$appointment->canBeReviewed()) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot be reviewed at this time'
            ], 400);
        }

        if ($appointment->hasClientReview()) {
            return response()->json([
                'success' => false,
                'message' => 'Review already submitted for this appointment'
            ], 400);
        }

        try {
            $reviewData = [
                'rating' => $request->rating,
                'comment' => $request->comment,
                'quality_rating' => $request->quality_rating,
                'punctuality_rating' => $request->punctuality_rating,
                'communication_rating' => $request->communication_rating,
                'value_rating' => $request->value_rating,
                'would_recommend' => $request->boolean('would_recommend'),
                'review_images' => $request->review_images
            ];

            $review = $this->reviewService->submitReview(
                $appointment,
                Auth::user(),
                $reviewData
            );

            // Reload appointment with fresh data
            $appointment->load([
                'service.category',
                'provider.providerProfile',
                'clientReview',
                'providerReview'
            ]);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'review' => $review,
                'message' => 'Review submitted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Review submission failed', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'client_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Failed to submit review',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Create invoice for completed appointment (for testing)
     */
    public function createInvoice(Appointment $appointment)
    {
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if ($appointment->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Can only create invoice for completed appointments'
            ], 400);
        }

        if ($appointment->hasInvoice()) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice already exists for this appointment'
            ], 400);
        }

        try {
            $invoice = $this->invoiceService->createInvoice($appointment);

            $appointment->load(['invoice']);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'message' => 'Invoice created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Invoice creation failed', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create invoice'
            ], 500);
        }
    }
}
