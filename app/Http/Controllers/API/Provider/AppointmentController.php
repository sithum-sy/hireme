<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\AppointmentService;
use App\Services\InvoiceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    protected $appointmentService;
    protected $invoiceService;

    public function __construct(AppointmentService $appointmentService, InvoiceService $invoiceService)
    {
        $this->appointmentService = $appointmentService;
        $this->invoiceService = $invoiceService;
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

            // Enhanced sorting: closest date/time first, but completed ones at the end
            $query->orderByRaw("
            CASE 
                WHEN status = 'completed' THEN 2 
                WHEN status IN ('cancelled_by_client', 'cancelled_by_provider', 'no_show') THEN 3
                ELSE 1 
            END
        ")
                ->orderBy('appointment_date', 'asc')
                ->orderBy('appointment_time', 'asc');

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
                ->orderBy('appointment_time', 'asc') // Earliest time first
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
    // public function updateStatus(Request $request, Appointment $appointment)
    // {
    //     $request->validate([
    //         'status' => 'required|in:confirmed,in_progress,completed,cancelled_by_provider,no_show',
    //         'notes' => 'nullable|string|max:1000'
    //     ]);

    //     // Verify provider owns this appointment
    //     if ($appointment->provider_id !== Auth::id()) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Unauthorized'
    //         ], 403);
    //     }

    //     // try {
    //     //     $result = $this->appointmentService->respondToAppointment(
    //     //         Auth::user(),
    //     //         $appointment,
    //     //         $request->status === 'confirmed' ? 'confirm' : ($request->status === 'cancelled_by_provider' ? 'cancel' : ($request->status === 'in_progress' ? 'start' : 'complete')),
    //     //         ['provider_notes' => $request->notes]
    //     //     );

    //     //     return response()->json([
    //     //         'success' => true,
    //     //         'message' => 'Appointment status updated successfully',
    //     //         'data' => $this->transformAppointmentForProvider($result)
    //     //     ]);
    //     // } catch (\Exception $e) {
    //     //     return response()->json([
    //     //         'success' => false,
    //     //         'message' => $e->getMessage()
    //     //     ], 400);
    //     // }
    //     try {
    //         $oldStatus = $appointment->status;
    //         $newStatus = $request->status;

    //         // Update appointment status
    //         $appointment->update([
    //             'status' => $newStatus,
    //             'provider_notes' => $request->notes,
    //             $newStatus . '_at' => now() // completed_at, confirmed_at, etc.
    //         ]);

    //         // **AUTO-CREATE INVOICE WHEN COMPLETED**
    //         if ($newStatus === 'completed' && $oldStatus !== 'completed') {
    //             $this->createInvoiceForCompletedAppointment($appointment);
    //         }

    //         return response()->json([
    //             'success' => true,
    //             'data' => $appointment->fresh()->load(['service', 'client']),
    //             'message' => 'Appointment status updated successfully'
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to update appointment status: ' . $e->getMessage());

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to update appointment status'
    //         ], 500);
    //     }
    // }
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

        // Special validation for starting service
        // if ($request->status === 'in_progress' && $appointment->status === 'confirmed') {
        //     if (!$this->canStartService($appointment)) {
        //         return response()->json([
        //             'success' => false,
        //             'message' => 'Service cannot be started yet. Please wait until the scheduled time (15 minutes grace period allowed).',
        //             'time_validation_failed' => true
        //         ], 400);
        //     }
        // }

        try {
            $oldStatus = $appointment->status;
            $newStatus = $request->status;

            $appointment->update([
                'status' => $newStatus,
                'provider_notes' => $request->notes,
                $newStatus . '_at' => now()
            ]);

            // Auto-create invoice when completed
            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                $this->createInvoiceForCompletedAppointment($appointment);
            }

            return response()->json([
                'success' => true,
                'data' => $appointment->fresh()->load(['service', 'client']),
                'message' => 'Appointment status updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update appointment status: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment status'
            ], 500);
        }
    }

    /**
     * Check if service can be started based on appointment time
     */
    private function canStartService(Appointment $appointment)
    {
        try {
            $now = now(); // Current time in Sri Lanka timezone

            // Get appointment date and time
            $appointmentDate = $appointment->appointment_date;
            $appointmentTime = $appointment->appointment_time;

            if (!$appointmentDate || !$appointmentTime) {
                Log::info('Missing date or time', [
                    'date' => $appointmentDate,
                    'time' => $appointmentTime
                ]);
                return false;
            }

            // Create appointment datetime based on the format we receive
            $appointmentDateTime = $this->parseAppointmentDateTime($appointmentDate, $appointmentTime);

            if (!$appointmentDateTime) {
                Log::error('Failed to parse appointment datetime', [
                    'date' => $appointmentDate,
                    'time' => $appointmentTime
                ]);
                return false;
            }

            // Allow starting 15 minutes before scheduled time
            $allowedStartTime = $appointmentDateTime->copy()->subMinutes(15);

            Log::info('Time check details', [
                'now' => $now->format('Y-m-d H:i:s'),
                'appointment_datetime' => $appointmentDateTime->format('Y-m-d H:i:s'),
                'allowed_start_time' => $allowedStartTime->format('Y-m-d H:i:s'),
                'can_start' => $now->gte($allowedStartTime)
            ]);

            return $now->gte($allowedStartTime);
        } catch (\Exception $e) {
            Log::error('Error checking appointment start time: ' . $e->getMessage(), [
                'appointment_id' => $appointment->id,
                'date' => $appointment->appointment_date ?? 'null',
                'time' => $appointment->appointment_time ?? 'null',
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Parse appointment date and time into Carbon instance
     */
    private function parseAppointmentDateTime($appointmentDate, $appointmentTime)
    {
        try {
            // Handle different date formats
            if ($appointmentDate instanceof \Carbon\Carbon) {
                $date = $appointmentDate->format('Y-m-d');
            } elseif (is_string($appointmentDate)) {
                // If it's already in YYYY-MM-DD format
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $appointmentDate)) {
                    $date = $appointmentDate;
                }
                // If it's a datetime string, extract the date part
                elseif (strpos($appointmentDate, 'T') !== false) {
                    $date = explode('T', $appointmentDate)[0];
                }
                // If it's in another format, try to parse it
                else {
                    $date = Carbon::parse($appointmentDate)->format('Y-m-d');
                }
            } else {
                $date = Carbon::parse($appointmentDate)->format('Y-m-d');
            }

            // Handle different time formats
            if ($appointmentTime instanceof \Carbon\Carbon) {
                $time = $appointmentTime->format('H:i:s');
            } elseif (is_string($appointmentTime)) {
                // If it's a full datetime string, extract time part
                if (strpos($appointmentTime, 'T') !== false) {
                    $timePart = explode('T', $appointmentTime)[1];
                    $time = explode('.', $timePart)[0]; // Remove microseconds
                    // Ensure it has seconds
                    if (substr_count($time, ':') === 1) {
                        $time .= ':00';
                    }
                }
                // If it's just time (HH:MM or HH:MM:SS)
                else {
                    $time = $appointmentTime;
                    // Ensure it has seconds
                    if (substr_count($time, ':') === 1) {
                        $time .= ':00';
                    }
                }
            } else {
                $time = '00:00:00';
            }

            // Combine date and time
            $dateTimeString = $date . ' ' . $time;

            Log::info('Parsing datetime', [
                'original_date' => $appointmentDate,
                'original_time' => $appointmentTime,
                'parsed_date' => $date,
                'parsed_time' => $time,
                'combined' => $dateTimeString
            ]);

            // Create Carbon instance
            return Carbon::createFromFormat('Y-m-d H:i:s', $dateTimeString);
        } catch (\Exception $e) {
            Log::error('Error parsing appointment datetime: ' . $e->getMessage(), [
                'date' => $appointmentDate,
                'time' => $appointmentTime,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Complete service (specific endpoint)
     */
    public function completeService(Request $request, Appointment $appointment)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
            'create_invoice' => 'boolean', // Option to create invoice
            'send_invoice' => 'boolean'    // Option to auto-send invoice
        ]);

        if ($appointment->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            // Mark appointment as completed
            $appointment->update([
                'status' => 'completed',
                'completed_at' => now(),
                'provider_notes' => $request->notes
            ]);

            $response = [
                'success' => true,
                'data' => $appointment->fresh()->load(['service', 'client']),
                'message' => 'Service completed successfully'
            ];

            // Auto-create invoice if requested (default: true)
            if ($request->get('create_invoice', true)) {
                $invoice = $this->createInvoiceForCompletedAppointment(
                    $appointment,
                    $request->get('send_invoice', false)
                );

                $response['invoice'] = $invoice;
                $response['message'] .= $invoice ? ' Invoice created automatically.' : '';
            }

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Failed to complete service: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to complete service'
            ], 500);
        }
    }

    /**
     * Get today's appointments for dashboard
     */
    public function todayForDashboard()
    {
        try {
            $user = Auth::user();
            $today = now()->toDateString();

            $appointments = Appointment::where('provider_id', $user->id)
                ->where('appointment_date', $today)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->with(['client', 'service'])
                ->orderBy('appointment_time')
                ->limit(5)
                ->get();

            $transformedAppointments = $appointments->map(function ($appointment) {
                return $this->transformAppointmentForProvider($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedAppointments
            ]);
        } catch (\Exception $e) {
            Log::error('Today appointments error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch today\'s appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming appointments for dashboard
     */
    public function upcomingForDashboard()
    {
        try {
            $user = Auth::user();
            $today = now()->toDateString();
            $nextWeek = now()->addWeek()->toDateString();

            $appointments = Appointment::where('provider_id', $user->id)
                ->where('appointment_date', '>', $today)
                ->where('appointment_date', '<=', $nextWeek)
                ->whereIn('status', ['pending', 'confirmed'])
                ->with(['client', 'service'])
                ->orderBy('appointment_date', 'asc')
                ->orderBy('appointment_time', 'asc') // Closest first
                ->limit(5)
                ->get();

            $transformedAppointments = $appointments->map(function ($appointment) {
                return $this->transformAppointmentForProvider($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedAppointments
            ]);
        } catch (\Exception $e) {
            Log::error('Upcoming appointments error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent past appointments for dashboard
     */
    public function pastForDashboard()
    {
        try {
            $user = Auth::user();
            $lastWeek = now()->subWeek()->toDateString();

            $appointments = Appointment::where('provider_id', $user->id)
                ->where('appointment_date', '<', now()->toDateString())
                ->where('appointment_date', '>=', $lastWeek)
                ->where('status', 'completed')
                ->with(['client', 'service'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->limit(5)
                ->get();

            $transformedAppointments = $appointments->map(function ($appointment) {
                return $this->transformAppointmentForProvider($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedAppointments
            ]);
        } catch (\Exception $e) {
            Log::error('Past appointments error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch past appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cancelled appointments for dashboard
     */
    public function cancelledForDashboard()
    {
        try {
            $user = Auth::user();
            $lastMonth = now()->subMonth()->toDateString();

            $appointments = Appointment::where('provider_id', $user->id)
                ->where('appointment_date', '>=', $lastMonth)
                ->whereIn('status', ['cancelled_by_client', 'cancelled_by_provider', 'no_show'])
                ->with(['client', 'service'])
                ->orderBy('appointment_date', 'desc')
                ->limit(5)
                ->get();

            $transformedAppointments = $appointments->map(function ($appointment) {
                return $this->transformAppointmentForProvider($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedAppointments
            ]);
        } catch (\Exception $e) {
            Log::error('Cancelled appointments error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cancelled appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard appointment stats
     */
    public function dashboardStats()
    {
        try {
            $user = Auth::user();
            $today = now()->toDateString();

            $stats = [
                'today_total' => Appointment::where('provider_id', $user->id)
                    ->where('appointment_date', $today)
                    ->count(),

                'today_pending' => Appointment::where('provider_id', $user->id)
                    ->where('appointment_date', $today)
                    ->where('status', 'pending')
                    ->count(),

                'today_confirmed' => Appointment::where('provider_id', $user->id)
                    ->where('appointment_date', $today)
                    ->where('status', 'confirmed')
                    ->count(),

                'today_completed' => Appointment::where('provider_id', $user->id)
                    ->where('appointment_date', $today)
                    ->where('status', 'completed')
                    ->count(),

                'upcoming_count' => Appointment::where('provider_id', $user->id)
                    ->where('appointment_date', '>', $today)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count(),

                'this_week_completed' => Appointment::where('provider_id', $user->id)
                    ->whereBetween('appointment_date', [
                        now()->startOfWeek()->toDateString(),
                        now()->endOfWeek()->toDateString()
                    ])
                    ->where('status', 'completed')
                    ->count(),

                'this_month_earnings' => Appointment::where('provider_id', $user->id)
                    ->whereMonth('appointment_date', now()->month)
                    ->whereYear('appointment_date', now()->year)
                    ->where('status', 'completed')
                    ->sum('total_price'),

                'recent_cancellations' => Appointment::where('provider_id', $user->id)
                    ->where('appointment_date', '>=', now()->subWeek()->toDateString())
                    ->whereIn('status', ['cancelled_by_client', 'cancelled_by_provider', 'no_show'])
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointment stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create invoice for completed appointment
     */
    private function createInvoiceForCompletedAppointment(Appointment $appointment, $autoSend = false)
    {
        try {
            // Check if invoice already exists
            if ($appointment->invoices()->exists()) {
                Log::info("Invoice already exists for appointment {$appointment->id}");
                return $appointment->invoices()->first();
            }

            // Create invoice
            $invoice = $this->invoiceService->createInvoiceFromAppointment($appointment, [
                'payment_method' => $appointment->payment_method,
                'due_days' => 7, // 7 days to pay
                'notes' => 'Thank you for choosing our service. We appreciate your business!',
                'auto_created' => true
            ]);

            // Auto-send if requested
            if ($autoSend && $invoice) {
                $this->invoiceService->sendInvoice($invoice);
                Log::info("Invoice {$invoice->id} auto-sent for appointment {$appointment->id}");
            }

            Log::info("Invoice {$invoice->id} created for completed appointment {$appointment->id}");

            return $invoice;
        } catch (\Exception $e) {
            Log::error("Failed to create invoice for appointment {$appointment->id}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Approve reschedule request
     */
    public function approveReschedule(Request $request, Appointment $appointment)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);

        // Authorization check
        if ($appointment->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Get the pending reschedule request
        $rescheduleRequest = $appointment->pendingRescheduleRequest;
        if (!$rescheduleRequest) {
            return response()->json([
                'success' => false,
                'message' => 'No pending reschedule request found'
            ], 404);
        }

        try {
            // Approve the reschedule request
            $rescheduleRequest->approve(Auth::id(), $request->notes);

            // Apply the reschedule to the appointment
            $appointment->applyReschedule($rescheduleRequest);

            return response()->json([
                'success' => true,
                'data' => $appointment->fresh([
                    'service',
                    'client',
                    'pendingRescheduleRequest',
                    'latestRescheduleRequest'
                ]),
                'message' => 'Reschedule request approved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Reschedule approval failed', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id,
                'provider_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve reschedule request'
            ], 500);
        }
    }

    /**
     * Decline reschedule request
     */
    public function declineReschedule(Request $request, Appointment $appointment)
    {
        $request->validate([
            'notes' => 'required|string|max:500'
        ]);

        // Authorization check
        if ($appointment->provider_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Get the pending reschedule request
        $rescheduleRequest = $appointment->pendingRescheduleRequest;
        if (!$rescheduleRequest) {
            return response()->json([
                'success' => false,
                'message' => 'No pending reschedule request found'
            ], 404);
        }

        try {
            // Decline the reschedule request
            $rescheduleRequest->decline(Auth::id(), $request->notes);

            return response()->json([
                'success' => true,
                'data' => $appointment->fresh([
                    'service',
                    'client',
                    'pendingRescheduleRequest',
                    'latestRescheduleRequest'
                ]),
                'message' => 'Reschedule request declined successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Reschedule decline failed', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id,
                'provider_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to decline reschedule request'
            ], 500);
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
            'has_pending_reschedule' => $appointment->hasPendingRescheduleRequest(),
            'pending_reschedule_request' => $appointment->pendingRescheduleRequest,
            // Add earnings calculation
            'earnings' => $appointment->status === 'completed' ?
                $appointment->total_price : ($appointment->status === 'confirmed' ? $appointment->total_price : 0)
        ];
    }
}
