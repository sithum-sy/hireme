<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{


    public function store(Request $request)
    {
        try {
            // Log the incoming request data
            Log::info('Booking request received', [
                'data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            // Log specifically the quote-related fields
            Log::info('Quote-related fields in request', [
                'quote_id' => $request->input('quote_id'),
                'isFromQuote' => $request->boolean('isFromQuote'),
                'booking_source' => $request->input('booking_source')
            ]);

            $validatedData = $request->validate([
                'service_id' => 'required|exists:services,id',
                'provider_id' => 'required|exists:users,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required',
                'duration_hours' => 'required|numeric|min:0.5|max:24',
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
            Log::info('Validated booking data', [
                'validated' => $validatedData,
                'quote_id' => $validatedData['quote_id'] ?? null,
                'isFromQuote' => $request->boolean('isFromQuote')
            ]);

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

            Log::info('Appointment created', [
                'appointment_id' => $appointment->id,
                'quote_id' => $appointment->quote_id
            ]);

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

                    Log::info('Quote status updated to accepted', [
                        'quote_id' => $quote->id,
                        'appointment_id' => $appointment->id,
                        'client_id' => Auth::id()
                    ]);
                }
            }

            // Load relationships for response
            $appointment->load(['service', 'provider', 'client']);

            DB::commit();

            Log::info('Booking created successfully', [
                'appointment_id' => $appointment->id,
                'client_id' => Auth::id(),
                'from_quote' => !empty($validatedData['quote_id'])
            ]);

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

    public function index(Request $request)
    {
        $appointments = Appointment::where('client_id', Auth::id())
            ->with(['service', 'provider'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('appointment_date', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    public function show(Appointment $booking)
    {
        // Ensure user can only see their own bookings
        if ($booking->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        $booking->load(['service', 'provider', 'client']);

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    public function cancel(Appointment $booking)
    {
        // Ensure user can only cancel their own bookings
        if ($booking->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        // Check if booking can be cancelled
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'This booking cannot be cancelled',
            ], 422);
        }

        // Check cancellation deadline (24 hours before appointment)
        $appointmentDateTime = \Carbon\Carbon::parse($booking->appointment_date . ' ' . $booking->appointment_time);
        $cancellationDeadline = $appointmentDateTime->subHours(24);

        if (now() > $cancellationDeadline) {
            return response()->json([
                'success' => false,
                'message' => 'Cancellation deadline has passed. Please contact support.',
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled_by_client',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Cancelled by client',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'data' => $booking,
        ]);
    }
}
