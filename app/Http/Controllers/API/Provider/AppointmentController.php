<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Get provider's appointments with filtering
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,confirmed,in_progress,completed,cancelled_by_client,cancelled_by_provider,no_show,disputed',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $user = Auth::user();
            $filters = $request->only(['status', 'date_from', 'date_to']);

            $query = $this->appointmentService->getAppointments($user, $filters);
            $perPage = $request->get('per_page', 15);
            $appointments = $query->paginate($perPage);

            // Transform for provider view
            $appointments->through(function ($appointment) {
                return $this->transformAppointmentForProvider($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $appointments
            ]);
        } catch (\Exception $e) {
            Log::error('Provider appointments fetch failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointments'
            ], 500);
        }
    }

    /**
     * Get today's appointments
     */
    public function today()
    {
        try {
            $user = Auth::user();
            $today = now()->toDateString();

            $appointments = Appointment::where('provider_id', $user->id)
                ->where('appointment_date', $today)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->with(['client', 'service'])
                ->orderBy('appointment_time')
                ->get();

            $appointments = $appointments->map(function ($appointment) {
                return $this->transformAppointmentForProvider($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $appointments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch today\'s appointments'
            ], 500);
        }
    }

    /**
     * Get specific appointment details
     */
    public function show(Appointment $appointment)
    {
        // Ensure provider owns this appointment
        if ($appointment->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found'
            ], 404);
        }

        $appointment->load(['client', 'service', 'quote']);

        return response()->json([
            'success' => true,
            'data' => $this->transformAppointmentForProvider($appointment)
        ]);
    }

    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'status' => 'required|in:confirmed,in_progress,completed,cancelled_by_provider,no_show',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($appointment->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $result = $this->appointmentService->respondToAppointment(
                Auth::user(),
                $appointment,
                $request->status === 'confirmed' ? 'confirm' : ($request->status === 'cancelled_by_provider' ? 'cancel' : ($request->status === 'in_progress' ? 'start' : 'complete')),
                ['provider_notes' => $request->notes]
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully',
                'data' => $this->transformAppointmentForProvider($result)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Transform appointment data for provider view
     */
    private function transformAppointmentForProvider($appointment)
    {
        return [
            'id' => $appointment->id,
            'client_name' => $appointment->client->first_name . ' ' . $appointment->client->last_name,
            'client_phone' => $appointment->client_phone,
            'client_email' => $appointment->client_email,
            'service_title' => $appointment->service->title,
            'appointment_date' => $appointment->appointment_date,
            'appointment_time' => $appointment->appointment_time,
            'duration_hours' => $appointment->duration_hours,
            'total_price' => $appointment->total_price,
            'status' => $appointment->status,
            'status_text' => $appointment->status_text,
            'location_type' => $appointment->location_type,
            'client_address' => $appointment->client_address,
            'client_notes' => $appointment->client_notes,
            'provider_notes' => $appointment->provider_notes,
            'created_at' => $appointment->created_at,
            'can_confirm' => $appointment->canBeConfirmed(),
            'can_cancel' => $appointment->canBeCancelled(),
            // Add earnings calculation
            'earnings' => $appointment->status === 'completed' ?
                $appointment->total_price * 0.85 : // 15% platform fee
                ($appointment->status === 'confirmed' ? $appointment->total_price * 0.85 : 0)
        ];
    }
}
