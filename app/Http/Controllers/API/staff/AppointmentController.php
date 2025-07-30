<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\LogsActivity;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Service;
use App\Models\StaffActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    use LogsActivity;

    /**
     * Get all appointments with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $status = $request->get('status');
            $provider = $request->get('provider'); // provider ID
            $client = $request->get('client'); // client ID
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = Appointment::query();

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('provider', function ($providerQuery) use ($search) {
                        $providerQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('service', function ($serviceQuery) use ($search) {
                        $serviceQuery->where('title', 'like', "%{$search}%");
                    })
                    ->orWhere('id', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($status) {
                $query->where('status', $status);
            }

            // Apply provider filter
            if ($provider) {
                $query->where('provider_id', $provider);
            }

            // Apply client filter
            if ($client) {
                $query->where('client_id', $client);
            }

            // Apply date range filter
            if ($dateFrom) {
                $query->whereDate('appointment_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('appointment_date', '<=', $dateTo);
            }

            // Apply sorting
            $allowedSortFields = ['appointment_date', 'appointment_time', 'status', 'total_price', 'created_at', 'updated_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $appointments = $query->paginate($perPage);

            // Load relationships
            $appointments->load([
                'client:id,first_name,last_name,email,profile_picture',
                'provider:id,first_name,last_name,email,profile_picture',
                'service:id,title,base_price'
            ]);

            // Transform the data
            $appointments->getCollection()->transform(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'duration_hours' => $appointment->duration_hours,
                    'total_price' => $appointment->total_price,
                    'base_price' => $appointment->base_price,
                    'travel_fee' => $appointment->travel_fee,
                    'location_type' => $appointment->location_type,
                    'client_address' => $appointment->client_address,
                    'client_city' => $appointment->client_city,
                    'client_phone' => $appointment->client_phone,
                    'client_email' => $appointment->client_email,
                    'payment_method' => $appointment->payment_method,
                    'status' => $appointment->status,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    'confirmed_at' => $appointment->confirmed_at?->format('Y-m-d H:i:s'),
                    'started_at' => $appointment->started_at?->format('Y-m-d H:i:s'),
                    'completed_at' => $appointment->completed_at?->format('Y-m-d H:i:s'),
                    'cancelled_at' => $appointment->cancelled_at?->format('Y-m-d H:i:s'),
                    'cancellation_reason' => $appointment->cancellation_reason,
                    'client' => [
                        'id' => $appointment->client->id,
                        'full_name' => $appointment->client->full_name,
                        'email' => $appointment->client->email,
                        'profile_picture' => $appointment->client->profile_picture,
                    ],
                    'provider' => [
                        'id' => $appointment->provider->id,
                        'full_name' => $appointment->provider->full_name,
                        'email' => $appointment->provider->email,
                        'profile_picture' => $appointment->provider->profile_picture,
                    ],
                    'service' => [
                        'id' => $appointment->service->id,
                        'title' => $appointment->service->title,
                        'base_price' => $appointment->service->base_price,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'meta' => [
                    'total_appointments' => Appointment::count(),
                    'pending_appointments' => Appointment::where('status', 'pending')->count(),
                    'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
                    'completed_appointments' => Appointment::where('status', 'completed')->count(),
                    'cancelled_appointments' => Appointment::whereIn('status', ['cancelled_by_client', 'cancelled_by_provider', 'cancelled_by_staff'])->count(),
                    'disputed_appointments' => Appointment::where('status', 'disputed')->count(),
                    'providers' => User::where('role', 'service_provider')
                        ->where('is_active', true)
                        ->get(['id', 'first_name', 'last_name'])
                        ->map(function ($provider) {
                            return [
                                'id' => $provider->id,
                                'full_name' => $provider->full_name,
                            ];
                        }),
                    'clients' => User::where('role', 'client')
                        ->where('is_active', true)
                        ->get(['id', 'first_name', 'last_name'])
                        ->map(function ($client) {
                            return [
                                'id' => $client->id,
                                'full_name' => $client->full_name,
                            ];
                        })
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch appointments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointments',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get a specific appointment with detailed information
     */
    public function show(Appointment $appointment)
    {
        try {
            $appointment->load([
                'client:id,first_name,last_name,email,profile_picture,phone,address,city,state,country',
                'provider:id,first_name,last_name,email,profile_picture,phone',
                'provider.providerProfile:user_id,business_name,verification_status',
                'service:id,title,description,base_price,duration_hours',
                'service.category:id,name,color,icon'
            ]);

            $appointmentData = [
                'id' => $appointment->id,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'duration_hours' => $appointment->duration_hours,
                'total_price' => $appointment->total_price,
                'base_price' => $appointment->base_price,
                'travel_fee' => $appointment->travel_fee,
                'location_type' => $appointment->location_type,
                'client_address' => $appointment->client_address,
                'client_city' => $appointment->client_city,
                'client_postal_code' => $appointment->client_postal_code,
                'location_instructions' => $appointment->location_instructions,
                'client_phone' => $appointment->client_phone,
                'client_email' => $appointment->client_email,
                'contact_preference' => $appointment->contact_preference,
                'client_notes' => $appointment->client_notes,
                'provider_notes' => $appointment->provider_notes,
                'payment_method' => $appointment->payment_method,
                'booking_source' => $appointment->booking_source,
                'status' => $appointment->status,
                'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                'confirmed_at' => $appointment->confirmed_at?->format('Y-m-d H:i:s'),
                'started_at' => $appointment->started_at?->format('Y-m-d H:i:s'),
                'completed_at' => $appointment->completed_at?->format('Y-m-d H:i:s'),
                'cancelled_at' => $appointment->cancelled_at?->format('Y-m-d H:i:s'),
                'cancellation_reason' => $appointment->cancellation_reason,
                'client_rating' => $appointment->client_rating,
                'client_review' => $appointment->client_review,
                'provider_rating' => $appointment->provider_rating,
                'provider_review' => $appointment->provider_review,
                'client' => [
                    'id' => $appointment->client->id,
                    'full_name' => $appointment->client->full_name,
                    'email' => $appointment->client->email,
                    'phone' => $appointment->client->phone,
                    'profile_picture' => $appointment->client->profile_picture,
                    'address' => $appointment->client->address,
                    'city' => $appointment->client->city,
                    'state' => $appointment->client->state,
                    'country' => $appointment->client->country,
                ],
                'provider' => [
                    'id' => $appointment->provider->id,
                    'full_name' => $appointment->provider->full_name,
                    'email' => $appointment->provider->email,
                    'phone' => $appointment->provider->phone,
                    'profile_picture' => $appointment->provider->profile_picture,
                    'business_name' => $appointment->provider->providerProfile->business_name ?? null,
                    'verification_status' => $appointment->provider->providerProfile->verification_status ?? 'pending',
                ],
                'service' => [
                    'id' => $appointment->service->id,
                    'title' => $appointment->service->title,
                    'description' => $appointment->service->description,
                    'base_price' => $appointment->service->base_price,
                    'duration_hours' => $appointment->service->duration_hours,
                    'category' => $appointment->service->category,
                ],
            ];

            // Log activity
            $this->logUserActivity(StaffActivity::ACTION_VIEW, $appointment->client, [
                'view_type' => 'detailed_appointment',
                'appointment_id' => $appointment->id,
                'provider_id' => $appointment->provider_id,
                'service_id' => $appointment->service_id
            ]);

            return response()->json([
                'success' => true,
                'data' => $appointmentData
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch appointment details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointment details',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,confirmed,in_progress,completed,cancelled_by_client,cancelled_by_provider,cancelled_by_staff,no_show,disputed',
                'notes' => 'nullable|string|max:1000',
                'cancellation_reason' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldStatus = $appointment->status;
            $newStatus = $request->status;

            $appointment->status = $newStatus;
            
            // Update timestamp fields based on status
            switch ($newStatus) {
                case 'confirmed':
                    $appointment->confirmed_at = now();
                    break;
                case 'in_progress':
                    $appointment->started_at = now();
                    break;
                case 'completed':
                    $appointment->completed_at = now();
                    break;
                case 'cancelled_by_client':
                case 'cancelled_by_provider':
                case 'cancelled_by_staff':
                    $appointment->cancelled_at = now();
                    if ($request->cancellation_reason) {
                        $appointment->cancellation_reason = $request->cancellation_reason;
                    }
                    break;
            }

            if ($request->notes) {
                $appointment->provider_notes = $request->notes;
            }

            $appointment->save();

            // Log activity
            $this->logUserActivity(StaffActivity::ACTION_UPDATE, $appointment->client, [
                'appointment_id' => $appointment->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'provider_id' => $appointment->provider_id,
                'service_id' => $appointment->service_id
            ]);

            return response()->json([
                'success' => true,
                'message' => "Appointment status updated from '{$oldStatus}' to '{$newStatus}' successfully",
                'data' => [
                    'appointment' => [
                        'id' => $appointment->id,
                        'status' => $appointment->status,
                        'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update appointment status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment status',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete an appointment
     */
    public function destroy(Appointment $appointment)
    {
        try {
            // Check if appointment can be deleted (usually only pending appointments)
            if (!in_array($appointment->status, ['pending', 'cancelled_by_client', 'cancelled_by_provider'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete appointment with status: ' . $appointment->status
                ], 400);
            }

            $appointmentId = $appointment->id;
            $clientName = $appointment->client->full_name;
            $providerName = $appointment->provider->full_name;

            $appointment->delete();

            // Log activity
            $this->logUserActivity(StaffActivity::ACTION_DELETE, null, [
                'deleted_appointment_id' => $appointmentId,
                'client_name' => $clientName,
                'provider_name' => $providerName,
                'appointment_date' => $appointment->appointment_date
            ]);

            return response()->json([
                'success' => true,
                'message' => "Appointment #{$appointmentId} has been deleted successfully"
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete appointment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete appointment',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get appointment statistics
     */
    public function statistics(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $startDate = now()->subDays($days);

            $stats = [
                'total_appointments' => Appointment::count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
                'in_progress_appointments' => Appointment::where('status', 'in_progress')->count(),
                'completed_appointments' => Appointment::where('status', 'completed')->count(),
                'cancelled_appointments' => Appointment::whereIn('status', ['cancelled_by_client', 'cancelled_by_provider', 'cancelled_by_staff'])->count(),
                'disputed_appointments' => Appointment::where('status', 'disputed')->count(),
                'no_show_appointments' => Appointment::where('status', 'no_show')->count(),
                'new_appointments' => Appointment::where('created_at', '>=', $startDate)->count(),
                'total_revenue' => Appointment::where('status', 'completed')->sum('total_price'),
                'average_appointment_value' => Appointment::where('status', 'completed')->avg('total_price'),
                'appointments_by_status' => [
                    'pending' => Appointment::where('status', 'pending')->count(),
                    'confirmed' => Appointment::where('status', 'confirmed')->count(),
                    'in_progress' => Appointment::where('status', 'in_progress')->count(),
                    'completed' => Appointment::where('status', 'completed')->count(),
                    'cancelled' => Appointment::whereIn('status', ['cancelled_by_client', 'cancelled_by_provider', 'cancelled_by_staff'])->count(),
                    'disputed' => Appointment::where('status', 'disputed')->count(),
                    'no_show' => Appointment::where('status', 'no_show')->count(),
                ],
                'growth_data' => $this->getAppointmentGrowthData($days),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch appointment statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointment statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get appointment growth data for charts
     */
    private function getAppointmentGrowthData($days = 30)
    {
        $data = [];
        $startDate = now()->subDays($days);

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $appointments = Appointment::whereDate('created_at', $date->format('Y-m-d'))->count();
            $completed = Appointment::whereDate('completed_at', $date->format('Y-m-d'))->count();
            $revenue = Appointment::where('status', 'completed')
                ->whereDate('completed_at', $date->format('Y-m-d'))
                ->sum('total_price');

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'appointments' => $appointments,
                'completed' => $completed,
                'revenue' => $revenue,
            ];
        }

        return $data;
    }
}