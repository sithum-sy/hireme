<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientQuoteRequest;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuoteController extends Controller
{
    public function store(ClientQuoteRequest $request)
    {
        try {
            Log::info('Quote request received', ['data' => $request->validated(), 'user_id' => Auth::id()]);

            $validatedData = $request->validated();

            // Get service and provider details
            $service = Service::findOrFail($validatedData['service_id']);
            $provider = User::findOrFail($validatedData['provider_id']);

            DB::beginTransaction();

            $quote = Quote::create([
                'client_id' => Auth::id(),
                'provider_id' => $validatedData['provider_id'],
                'service_id' => $validatedData['service_id'],
                'title' => "Quote Request: {$service->title}",
                'description' => "Quote request for {$service->title} by " . trim($provider->first_name . ' ' . $provider->last_name),

                // Store all request data as JSON
                'quote_request_data' => $validatedData,
                'client_requirements' => $validatedData['message'],

                // Initial status
                'status' => Quote::STATUS_PENDING,
            ]);

            // Load relationships for response
            $quote->load(['service', 'provider', 'client']);

            DB::commit();

            Log::info('Quote request created successfully', ['quote_id' => $quote->id, 'client_id' => Auth::id()]);

            return response()->json([
                'success' => true,
                'message' => 'Quote request sent successfully! The provider will respond within 24 hours.',
                'data' => [
                    'id' => $quote->id,
                    'quote_number' => $quote->quote_number,
                    'status' => $quote->status,
                    'status_text' => $quote->status_text,
                    'service_title' => $quote->service->title,
                    'provider_name' => trim($quote->provider->first_name . ' ' . $quote->provider->last_name),
                    'urgency' => $quote->urgency,
                    'location_summary' => $quote->location_summary,
                    'created_at' => $quote->created_at->toISOString(),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Quote request validation failed', ['errors' => $e->errors(), 'user_id' => Auth::id()]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quote request creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'client_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create quote request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $quotes = Quote::where('client_id', Auth::id())
            ->with(['service', 'provider'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Transform the data for frontend
        $quotes->getCollection()->transform(function ($quote) {
            return [
                'id' => $quote->id,
                'quote_number' => $quote->quote_number,
                'service_title' => $quote->service->title,
                'provider_name' => trim($quote->provider->first_name . ' ' . $quote->provider->last_name),
                'status' => $quote->status,
                'status_text' => $quote->status_text,
                'quoted_price' => $quote->quoted_price,
                'formatted_quoted_price' => $quote->formatted_quoted_price,
                'location_summary' => $quote->location_summary,
                'urgency' => $quote->urgency,
                'requested_date' => $quote->requested_date,
                'valid_until' => $quote->valid_until ? $quote->valid_until->toISOString() : null,
                'created_at' => $quote->created_at->toISOString(),
                'time_remaining' => $quote->time_remaining,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $quotes,
        ]);
    }

    public function show($id)
    {
        $quote = Quote::where('client_id', Auth::id())
            ->with(['service', 'provider', 'client', 'appointment'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $quote,
        ]);
    }

    public function accept(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
            'appointment_date' => 'nullable|date|after_or_equal:today',
            'appointment_time' => 'nullable|date_format:H:i',
            'create_appointment' => 'boolean',
        ]);

        $quote = Quote::where('client_id', Auth::id())->findOrFail($id);

        if (!$quote->canBeAccepted()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be accepted at this time. It may have expired or already been responded to.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $quote->accept($request->notes);

            $responseData = $quote->fresh(['service', 'provider']);
            $message = 'Quote accepted successfully!';

            // Create appointment if requested
            if ($request->create_appointment && $request->appointment_date && $request->appointment_time) {
                $appointment = Appointment::create([
                    'client_id' => $quote->client_id,
                    'provider_id' => $quote->provider_id,
                    'service_id' => $quote->service_id,
                    'appointment_date' => $request->appointment_date,
                    'appointment_time' => $request->appointment_time,
                    'duration_hours' => $quote->duration_hours,
                    'total_price' => $quote->quoted_price + ($quote->travel_fee ?? 0),
                    'base_price' => $quote->quoted_price,
                    'travel_fee' => $quote->travel_fee ?? 0,
                    'location_type' => $quote->location_type,
                    'client_address' => $quote->service_address,
                    'client_city' => $quote->service_city,
                    'client_phone' => $quote->client_phone,
                    'client_email' => $quote->client_email,
                    'contact_preference' => $quote->contact_preference,
                    'client_notes' => $quote->client_requirements . ($request->notes ? "\n\nAdditional notes: " . $request->notes : ""),
                    'payment_method' => 'cash',
                    'status' => Appointment::STATUS_PENDING,
                    'booking_source' => 'quote_conversion',
                ]);

                $quote->convertToAppointment($appointment->id);

                $responseData['appointment'] = $appointment;
                $message = 'Quote accepted and appointment created successfully!';
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $responseData,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quote acceptance failed', [
                'error' => $e->getMessage(),
                'quote_id' => $id,
                'client_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to accept quote. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function decline(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
            'reason' => 'nullable|in:price_too_high,timeline_too_long,requirements_not_met,found_alternative,other',
        ]);

        $quote = Quote::where('client_id', Auth::id())->findOrFail($id);

        if (!$quote->canBeRejected()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote cannot be declined at this time. It may have expired or already been responded to.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $declineNotes = $request->notes;
            if ($request->reason && $request->reason !== 'other') {
                $reasonTexts = [
                    'price_too_high' => 'Price too high',
                    'timeline_too_long' => 'Timeline too long',
                    'requirements_not_met' => 'Requirements not met',
                    'found_alternative' => 'Found alternative provider',
                ];
                $declineNotes = ($reasonTexts[$request->reason] ?? '') . ($declineNotes ? ": {$declineNotes}" : '');
            }

            $quote->reject($declineNotes);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Quote declined.',
                'data' => $quote->fresh(['service', 'provider']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quote decline failed', [
                'error' => $e->getMessage(),
                'quote_id' => $id,
                'client_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to decline quote. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
