<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Services\AppointmentService;
use App\Services\InvoiceService;
use App\Services\ReviewService;
use App\Mail\AppointmentBookingConfirmation;
use App\Mail\AppointmentProviderNotification;
use App\Events\AppointmentStatusChanged;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Client AppointmentController - Client-side appointment management
 * 
 * Handles all client-facing appointment operations including booking creation,
 * updates, cancellations, and quote interactions. Integrates with multiple
 * services for notifications, invoicing, and reviews to provide complete
 * appointment lifecycle management from the client perspective.
 */
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
     * Update appointment (for pending appointments)
     */
    public function update(Request $request, Appointment $appointment)
    {
        $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'duration_hours' => 'nullable|numeric|min:1|max:24',
            'client_phone' => 'nullable|string|max:20',
            'client_email' => 'nullable|email',
            'client_address' => 'nullable|string|max:255',
            'client_city' => 'nullable|string|max:100',
            'client_postal_code' => 'nullable|string|max:20',
            'location_type' => 'nullable|in:client_address,provider_location,custom_location',
            'location_instructions' => 'nullable|string|max:1000',
            'contact_preference' => 'nullable|in:phone,message',
            'client_notes' => 'nullable|string|max:1000',
        ]);

        // Ensure user can only update their own appointments
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found',
            ], 404);
        }

        // Check if appointment can be updated (only pending appointments)
        if ($appointment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending appointments can be directly updated. Use reschedule request for confirmed appointments.',
            ], 422);
        }

        // Validate new appointment time
        $validationError = $this->validateAppointmentDateTime(
            $request->appointment_date,
            $request->appointment_time
        );

        if ($validationError) {
            return response()->json([
                'success' => false,
                'message' => $validationError,
                'errors' => ['appointment_time' => [$validationError]]
            ], 422);
        }

        // Check provider availability (excluding this appointment)
        $availabilityError = $this->checkProviderAvailabilityForUpdate(
            $appointment->provider_id,
            $request->appointment_date,
            $request->appointment_time,
            $request->duration_hours ?? $appointment->duration_hours,
            $appointment->id
        );

        if ($availabilityError) {
            return response()->json([
                'success' => false,
                'message' => $availabilityError,
                'errors' => ['availability' => [$availabilityError]]
            ], 422);
        }

        // Contact validation
        if (empty($request->client_phone) && empty($request->client_email)) {
            return response()->json([
                'success' => false,
                'message' => 'Either phone number or email is required',
                'errors' => ['contact' => ['Contact information is required']]
            ], 422);
        }

        try {
            // Update the appointment
            $appointment->update([
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'duration_hours' => $request->duration_hours ?? $appointment->duration_hours,
                'client_phone' => $request->client_phone,
                'client_email' => $request->client_email,
                'client_address' => $request->client_address,
                'client_city' => $request->client_city,
                'client_postal_code' => $request->client_postal_code,
                'location_type' => $request->location_type ?? $appointment->location_type,
                'location_instructions' => $request->location_instructions,
                'contact_preference' => $request->contact_preference ?? $appointment->contact_preference,
                'client_notes' => $request->client_notes,
            ]);

            return response()->json([
                'success' => true,
                'data' => $appointment->fresh([
                    'service.category',
                    'provider.providerProfile',
                    'invoice',
                    'payment',
                    'clientReview'
                ]),
                'message' => 'Appointment updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Appointment update failed', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id,
                'client_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Request reschedule for confirmed appointments
     */
    public function requestReschedule(Request $request, Appointment $appointment)
    {
        $request->validate([
            'date' => 'required|date|after:today',
            'time' => 'required|date_format:H:i',
            'reason' => 'required|string|in:personal_emergency,work_conflict,travel_plans,health_reasons,weather_concerns,provider_request,other',
            'notes' => 'nullable|string|max:500',
            // Optional updated contact/location info
            'client_phone' => 'nullable|string|max:20',
            'client_email' => 'nullable|email',
            'client_address' => 'nullable|string|max:255',
            'location_type' => 'nullable|in:client_address,provider_location,custom_location',
        ]);

        // Authorization check
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if appointment can be rescheduled
        if (!$appointment->canBeRescheduled()) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot be rescheduled. It may have a pending reschedule request or be in an invalid status.'
            ], 422);
        }

        // 24-hour policy for confirmed appointments
        if ($appointment->status === 'confirmed') {
            $appointmentDateTime = $appointment->full_appointment_date_time;
            $hoursUntilAppointment = now()->diffInHours($appointmentDateTime, false);

            if ($hoursUntilAppointment <= 24) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reschedule requests must be made at least 24 hours before the appointment time'
                ], 422);
            }
        }

        // Validate new time slot
        $validationError = $this->validateAppointmentDateTime(
            $request->date,
            $request->time
        );

        if ($validationError) {
            return response()->json([
                'success' => false,
                'message' => $validationError,
                'errors' => ['appointment_time' => [$validationError]]
            ], 422);
        }

        // Check provider availability for new time
        $availabilityError = $this->checkProviderAvailabilityForUpdate(
            $appointment->provider_id,
            $request->date,
            $request->time,
            $appointment->duration_hours,
            $appointment->id
        );

        if ($availabilityError) {
            return response()->json([
                'success' => false,
                'message' => $availabilityError,
                'errors' => ['availability' => [$availabilityError]]
            ], 422);
        }

        try {
            if ($appointment->status === 'pending') {
                // Direct update for pending appointments
                $updateData = [
                    'appointment_date' => $request->date,
                    'appointment_time' => $request->time,
                ];

                // Update contact info if provided
                if ($request->client_phone) $updateData['client_phone'] = $request->client_phone;
                if ($request->client_email) $updateData['client_email'] = $request->client_email;
                if ($request->client_address) $updateData['client_address'] = $request->client_address;
                if ($request->location_type) $updateData['location_type'] = $request->location_type;

                // Append reschedule reason to notes
                if ($request->notes) {
                    $updateData['client_notes'] = ($appointment->client_notes ? $appointment->client_notes . "\n\n" : '')
                        . "Reschedule reason: " . $request->notes;
                }

                $appointment->update($updateData);

                $message = 'Appointment rescheduled successfully';
            } else {
                // For confirmed appointments, create a proper reschedule request
                $rescheduleRequest = $appointment->rescheduleRequests()->create([
                    'requested_by' => Auth::id(),
                    'original_date' => $appointment->appointment_date,
                    'original_time' => $appointment->appointment_time,
                    'requested_date' => $request->date,
                    'requested_time' => $request->time,
                    'reason' => $request->reason,
                    'notes' => $request->notes,
                    'client_phone' => $request->client_phone,
                    'client_email' => $request->client_email,
                    'client_address' => $request->client_address,
                    'location_type' => $request->location_type,
                    'status' => \App\Models\RescheduleRequest::STATUS_PENDING
                ]);

                $message = 'Reschedule request submitted successfully. The provider will respond within 24 hours.';
            }

            return response()->json([
                'success' => true,
                'data' => $appointment->fresh([
                    'service.category',
                    'provider.providerProfile',
                    'invoice',
                    'payment',
                    'clientReview',
                    'pendingRescheduleRequest'
                ]),
                'message' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Reschedule request failed', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id,
                'client_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process reschedule request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Enhanced provider availability check that excludes current appointment
     */
    private function checkProviderAvailabilityForUpdate($providerId, $appointmentDate, $appointmentTime, $durationHours, $excludeAppointmentId = null)
    {
        try {
            $provider = User::find($providerId);
            if (!$provider || $provider->role !== 'service_provider') {
                return 'Provider not found';
            }

            // Calculate end time
            $startDateTime = $this->parseAppointmentDateTime($appointmentDate, $appointmentTime);
            if (!$startDateTime) {
                return 'Invalid appointment time';
            }

            $endDateTime = $startDateTime->copy()->addHours($durationHours);

            // Use the AvailabilityService to check if provider is available
            $availabilityService = app(\App\Services\AvailabilityService::class);

            $availability = $availabilityService->isAvailableAt(
                $provider,
                $appointmentDate,
                $startDateTime->format('H:i'),
                $endDateTime->format('H:i')
            );

            if (!$availability['available']) {
                return $availability['reason'] ?? 'Provider is not available at the selected time';
            }

            // Check for conflicting appointments (excluding the current one being updated)
            $conflicts = Appointment::where('provider_id', $providerId)
                ->where('appointment_date', $appointmentDate)
                ->where('id', '!=', $excludeAppointmentId)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->where(function ($query) use ($startDateTime, $endDateTime) {
                    $query->whereBetween('appointment_time', [
                        $startDateTime->format('H:i:s'),
                        $endDateTime->format('H:i:s')
                    ])->orWhere(function ($q) use ($startDateTime, $endDateTime) {
                        // Check for overlapping appointments
                        $q->where('appointment_time', '<', $endDateTime->format('H:i:s'))
                            ->whereRaw(
                                'ADDTIME(appointment_time, SEC_TO_TIME(duration_hours * 3600)) > ?',
                                [$startDateTime->format('H:i:s')]
                            );
                    });
                })
                ->exists();

            if ($conflicts) {
                return 'Selected time conflicts with existing appointments';
            }

            return null; // Provider is available
        } catch (\Exception $e) {
            Log::error('Provider availability check error: ' . $e->getMessage());
            return 'Unable to verify provider availability';
        }
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

            // ✅ ADD: Custom validation for appointment date and time
            $validationError = $this->validateAppointmentDateTime(
                $validatedData['appointment_date'],
                $validatedData['appointment_time']
            );

            $durationValidationError = $this->validateServiceDuration(
                $validatedData['provider_id'],
                $validatedData['appointment_date'],
                $validatedData['appointment_time'],
                $validatedData['duration_hours']
            );

            if ($durationValidationError) {
                return response()->json([
                    'success' => false,
                    'message' => $durationValidationError,
                    'errors' => ['duration_hours' => [$durationValidationError]]
                ], 422);
            }

            if ($validationError) {
                return response()->json([
                    'success' => false,
                    'message' => $validationError,
                    'errors' => ['appointment_time' => [$validationError]]
                ], 422);
            }

            // ADD: Check provider availability
            $availabilityError = $this->checkProviderAvailability(
                $validatedData['provider_id'],
                $validatedData['appointment_date'],
                $validatedData['appointment_time'],
                $validatedData['duration_hours']
            );

            if ($availabilityError) {
                return response()->json([
                    'success' => false,
                    'message' => $availabilityError,
                    'errors' => ['availability' => [$availabilityError]]
                ], 422);
            }

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
                'expires_at' => now()->addHours(24), // Set 24-hour expiration
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // INCREMENT BOOKING COUNT when appointment is created
            $service = Service::find($appointment->service_id);
            if ($service) {
                $service->incrementBookings();
            }

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

            // Send notification emails
            $this->sendAppointmentNotifications($appointment);

            DB::commit();

            // Log::info('Booking created successfully', [
            //     'appointment_id' => $appointment->id,
            //     'client_id' => Auth::id(),
            //     'from_quote' => !empty($validatedData['quote_id'])
            // ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking request submitted successfully! The provider will confirm within 24 hours.',
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
     * ✅ NEW: Validate appointment date and time
     */
    private function validateAppointmentDateTime($appointmentDate, $appointmentTime)
    {
        try {
            $now = now(); // Current Sri Lankan time
            $appointmentDateTime = $this->parseAppointmentDateTime($appointmentDate, $appointmentTime);

            if (!$appointmentDateTime) {
                return 'Invalid appointment date or time format';
            }

            // Check if appointment is in the past
            if ($appointmentDateTime->lte($now)) {
                return 'Appointment time cannot be in the past. Please select a future date and time.';
            }

            // Check if appointment is too close (minimum 2 hours advance notice)
            // $minimumAdvanceHours = 2;
            // $minimumDateTime = $now->copy()->addHours($minimumAdvanceHours);

            // if ($appointmentDateTime->lt($minimumDateTime)) {
            //     return "Appointments must be booked at least {$minimumAdvanceHours} hours in advance.";
            // }

            // Check if appointment is too far in the future (maximum 3 months)
            $maximumDateTime = $now->copy()->addMonths(3);

            if ($appointmentDateTime->gt($maximumDateTime)) {
                return 'Appointments cannot be booked more than 3 months in advance.';
            }

            return null; // No validation errors
        } catch (\Exception $e) {
            Log::error('DateTime validation error: ' . $e->getMessage());
            return 'Invalid appointment date or time';
        }
    }

    /**
     * ✅ NEW: Check provider availability 
     */
    private function checkProviderAvailability($providerId, $appointmentDate, $appointmentTime, $durationHours)
    {
        try {
            $provider = User::find($providerId);
            if (!$provider || $provider->role !== 'service_provider') {
                return 'Provider not found';
            }

            // Calculate end time
            $startDateTime = $this->parseAppointmentDateTime($appointmentDate, $appointmentTime);
            if (!$startDateTime) {
                return 'Invalid appointment time';
            }

            $endDateTime = $startDateTime->copy()->addHours($durationHours);

            // Use the AvailabilityService to check if provider is available
            $availabilityService = app(\App\Services\AvailabilityService::class);

            $availability = $availabilityService->isAvailableAt(
                $provider,
                $appointmentDate,
                $startDateTime->format('H:i'),
                $endDateTime->format('H:i')
            );

            if (!$availability['available']) {
                return $availability['reason'] ?? 'Provider is not available at the selected time';
            }

            return null; // Provider is available
        } catch (\Exception $e) {
            Log::error('Provider availability check error: ' . $e->getMessage());
            return 'Unable to verify provider availability';
        }
    }

    /**
     * ✅ NEW: Parse appointment date and time into Carbon instance
     */
    private function parseAppointmentDateTime($appointmentDate, $appointmentTime)
    {
        try {
            // Handle different date formats
            if ($appointmentDate instanceof \Carbon\Carbon) {
                $date = $appointmentDate->format('Y-m-d');
            } elseif (is_string($appointmentDate)) {
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $appointmentDate)) {
                    $date = $appointmentDate;
                } elseif (strpos($appointmentDate, 'T') !== false) {
                    $date = explode('T', $appointmentDate)[0];
                } else {
                    $date = Carbon::parse($appointmentDate)->format('Y-m-d');
                }
            } else {
                $date = Carbon::parse($appointmentDate)->format('Y-m-d');
            }

            // Handle different time formats
            if ($appointmentTime instanceof \Carbon\Carbon) {
                $time = $appointmentTime->format('H:i:s');
            } elseif (is_string($appointmentTime)) {
                if (strpos($appointmentTime, 'T') !== false) {
                    $timePart = explode('T', $appointmentTime)[1];
                    $time = explode('.', $timePart)[0]; // Remove microseconds
                    if (substr_count($time, ':') === 1) {
                        $time .= ':00';
                    }
                } else {
                    $time = $appointmentTime;
                    if (substr_count($time, ':') === 1) {
                        $time .= ':00';
                    }
                }
            } else {
                $time = '00:00:00';
            }

            // Combine date and time
            $dateTimeString = $date . ' ' . $time;

            // Create Carbon instance in Sri Lankan timezone
            return Carbon::createFromFormat('Y-m-d H:i:s', $dateTimeString, 'Asia/Colombo');
        } catch (\Exception $e) {
            Log::error('Error parsing appointment datetime: ' . $e->getMessage(), [
                'date' => $appointmentDate,
                'time' => $appointmentTime
            ]);
            return null;
        }
    }

    /**
     * Enhanced duration validation based on provider's daily availability
     */
    private function validateServiceDuration($providerId, $appointmentDate, $appointmentTime, $durationHours)
    {
        try {
            $provider = User::find($providerId);
            if (!$provider || $provider->role !== 'service_provider') {
                return 'Provider not found';
            }

            // Get provider's working hours for the selected date
            $availabilityService = app(\App\Services\AvailabilityService::class);
            $workingHours = $availabilityService->getWorkingHours($provider, $appointmentDate);

            if (!$workingHours || !$workingHours['is_available']) {
                return 'Provider is not available on the selected date';
            }

            // Calculate if the service duration fits within working hours
            $appointmentStartTime = Carbon::parse($appointmentDate . ' ' . $appointmentTime);
            $appointmentEndTime = $appointmentStartTime->copy()->addHours($durationHours);

            // Parse provider's end time for the day
            $providerEndTime = Carbon::parse($appointmentDate . ' ' . $workingHours['end_time']);

            if ($appointmentEndTime->gt($providerEndTime)) {
                $maxPossibleHours = $appointmentStartTime->diffInHours($providerEndTime);
                return "Service duration exceeds provider's working hours. Maximum available duration: {$maxPossibleHours} hours";
            }

            // Check for existing appointments that might conflict
            $conflictingAppointments = Appointment::where('provider_id', $providerId)
                ->where('appointment_date', $appointmentDate)
                ->where('status', '!=', 'cancelled_by_client')
                ->where('status', '!=', 'cancelled_by_provider')
                ->whereTime('appointment_time', '>', $appointmentTime)
                ->whereTime('appointment_time', '<', $appointmentEndTime->format('H:i:s'))
                ->count();

            if ($conflictingAppointments > 0) {
                return 'Selected duration conflicts with existing appointments';
            }

            return null; // No errors
        } catch (\Exception $e) {
            Log::error('Duration validation error: ' . $e->getMessage());
            return 'Unable to validate service duration';
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
                    'clientReview',
                    'pendingRescheduleRequest'
                ]);

            // Apply status filter
            if ($request->status && $request->status !== 'all') {
                // Handle comma-separated status values
                $statusValues = explode(',', $request->status);
                $statusValues = array_map('trim', $statusValues);
                
                if (count($statusValues) > 1) {
                    $query->whereIn('status', $statusValues);
                } else {
                    $query->where('status', $request->status);
                }
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

            // Transform appointments to ensure correct date format and add rating data
            $appointments->getCollection()->transform(function ($appointment) {
                // Calculate provider rating data for each appointment
                $provider = $appointment->provider;
                if ($provider) {
                    // Calculate reviews count for this provider from Review model using scopes
                    $reviewsCount = \App\Models\Review::forProvider($provider->id)
                        ->visible()
                        ->count();

                    // Calculate average rating for this provider from Review model using scopes
                    $averageRating = \App\Models\Review::forProvider($provider->id)
                        ->visible()
                        ->avg('rating');

                    // Add calculated rating data to provider
                    $provider->calculated_average_rating = round($averageRating ?: 0, 1);
                    $provider->calculated_reviews_count = $reviewsCount;
                    $provider->calculated_completed_bookings = $provider->providerAppointments()->where('status', 'completed')->count();
                }

                // Create a new array representation to avoid Eloquent's automatic date casting
                $appointmentArray = $appointment->toArray();
                $appointmentArray['appointment_date'] = $appointment->appointment_date->format('Y-m-d');
                return $appointmentArray;
            });

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

            // Calculate provider rating data similar to ServiceController
            $provider = $appointment->provider;
            $providerProfile = $provider->providerProfile;
            
            // Calculate reviews count for this provider from Review model using scopes
            $reviewsCount = \App\Models\Review::forProvider($provider->id)
                ->visible()
                ->count();

            // Calculate average rating for this provider from Review model using scopes
            $averageRating = \App\Models\Review::forProvider($provider->id)
                ->visible()
                ->avg('rating');

            // Add calculated rating data to provider
            $provider->calculated_average_rating = round($averageRating ?: 0, 1);
            $provider->calculated_reviews_count = $reviewsCount;
            $provider->calculated_completed_bookings = $provider->providerAppointments()->where('status', 'completed')->count();

            // Mark invoice as viewed by client if it exists
            if ($appointment->invoice && !$appointment->invoice->hasBeenViewed()) {
                $appointment->invoice->markAsViewed();
            }

            // Format the appointment data similar to index method to avoid timezone issues
            $appointmentArray = $appointment->toArray();
            $appointmentArray['appointment_date'] = $appointment->appointment_date->format('Y-m-d');

            return response()->json([
                'success' => true,
                'data' => $appointmentArray,
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
            $oldStatus = $appointment->status;
            $appointment->cancel('client', $request->cancellation_reason);
            
            // Trigger notification event for status change
            AppointmentStatusChanged::dispatch($appointment, $oldStatus, 'cancelled_by_client');

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
     * Send appointment notification emails
     */
    private function sendAppointmentNotifications(Appointment $appointment)
    {
        try {
            // Dispatch event for new appointment request (client created -> pending status)
            AppointmentStatusChanged::dispatch($appointment, null, 'pending');

            Log::info('Appointment request notifications dispatched', [
                'appointment_id' => $appointment->id,
                'status' => 'pending'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send appointment notifications', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);
            // Don't throw exception as the appointment was created successfully
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

    /**
     * Pay invoice for appointment
     */
    public function payInvoice(Request $request, Appointment $appointment)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,stripe',
            'amount' => 'required|numeric|min:0',
            'stripe_payment_method_id' => 'nullable|string',
            'stripe_payment_intent_id' => 'nullable|string',
            'notes' => 'nullable|string|max:500'
        ]);

        // Ensure user can only pay their own appointments
        if ($appointment->client_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        // Check if appointment has an invoice
        if (!$appointment->invoice) {
            return response()->json([
                'success' => false,
                'message' => 'No invoice found for this appointment'
            ], 400);
        }

        // Check if invoice can be paid
        $invoice = $appointment->invoice;
        if ($invoice->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This invoice has already been paid or is not payable'
            ], 400);
        }

        // Validate amount matches invoice total
        if ((float)$request->amount !== (float)$invoice->total_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount does not match invoice total'
            ], 400);
        }

        try {
            DB::transaction(function () use ($request, $appointment, $invoice) {
                // Create payment record
                $payment = \App\Models\Payment::create([
                    'appointment_id' => $appointment->id,
                    'invoice_id' => $invoice->id,
                    'client_id' => $appointment->client_id,
                    'provider_id' => $appointment->provider_id,
                    'amount' => $request->amount,
                    'currency' => 'LKR',
                    'method' => $request->payment_method,
                    'status' => $request->payment_method === 'cash' ? 'pending' : 'completed',
                    'reference_id' => $this->generatePaymentReference($appointment->id),
                    'transaction_id' => $request->stripe_payment_intent_id ?? $request->stripe_payment_method_id ?? null,
                    'processed_at' => $request->payment_method === 'cash' ? null : now(),
                    'notes' => $request->notes ?? ($request->payment_method === 'cash' ? 'Cash payment - pending provider confirmation' : 'Card payment processed'),
                    'stripe_payment_intent_id' => $request->stripe_payment_intent_id,
                    'stripe_payment_method_id' => $request->stripe_payment_method_id
                ]);

                // Update invoice status
                if ($request->payment_method === 'cash') {
                    // For cash payments, mark as processing until provider confirms receipt
                    $invoice->update([
                        'payment_status' => 'processing', // Client has paid, but provider needs to confirm receipt
                        'paid_at' => now(),
                        'status' => 'paid'
                    ]);
                } else {
                    // For card payments, mark as completed immediately
                    $invoice->update([
                        'payment_status' => 'completed',
                        'paid_at' => now(),
                        'status' => 'paid'
                    ]);
                }

                // Update appointment status based on payment method
                $appointment->update([
                    'status' => $request->payment_method === 'cash' ? Appointment::STATUS_PAYMENT_PENDING : Appointment::STATUS_PAID,
                    'payment_received_at' => now()
                ]);

                // Dispatch payment event for notifications
                if (class_exists('\App\Events\PaymentReceived')) {
                    \App\Events\PaymentReceived::dispatch($appointment, $payment, $invoice);
                }
            });

            // Reload appointment with all relations
            $appointment->load([
                'service.category',
                'provider.providerProfile', 
                'invoice',
                'payment',
                'clientReview'
            ]);

            return response()->json([
                'success' => true,
                'message' => $request->payment_method === 'cash' 
                    ? 'Payment confirmed! Waiting for provider to confirm cash receipt.'
                    : 'Payment processed successfully!',
                'data' => $appointment
            ]);

        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'appointment_id' => $appointment->id,
                'payment_method' => $request->payment_method,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed. Please try again.'
            ], 500);
        }
    }

    /**
     * Generate unique payment reference
     */
    private function generatePaymentReference($appointmentId)
    {
        return 'PAY_' . now()->format('YmdHis') . '_' . $appointmentId . '_' . mt_rand(1000, 9999);
    }
}
