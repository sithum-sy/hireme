<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Models\ProviderAvailability;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProviderController extends Controller
{
    /**
     * Browse all providers with location filtering
     */
    public function index(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'category_id' => 'nullable|exists:service_categories,id',
            'min_rating' => 'nullable|numeric|between:1,5',
            'verified_only' => 'nullable|boolean',
            'sort_by' => 'nullable|in:distance,rating,experience,recent',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $query = User::with(['providerProfile', 'services.category'])
            ->where('role', 'service_provider')
            ->where('is_active', true)
            ->whereHas('providerProfile', function ($profileQuery) use ($request) {
                if ($request->verified_only) {
                    $profileQuery->where('verification_status', 'verified');
                }
                if ($request->min_rating) {
                    $profileQuery->where('average_rating', '>=', $request->min_rating);
                }
            });

        // Category filter through services
        if ($request->category_id) {
            $query->whereHas('services', function ($serviceQuery) use ($request) {
                $serviceQuery->where('category_id', $request->category_id)
                    ->where('is_active', true);
            });
        }

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->radius ?? 15;

            // Filter providers who have services serving the location
            $query->whereHas('services', function ($serviceQuery) use ($lat, $lng) {
                $serviceQuery->where('is_active', true)
                    ->servingLocation($lat, $lng);
            });
        }

        // Sorting
        switch ($request->sort_by) {
            case 'rating':
                $query->join('provider_profiles', 'users.id', '=', 'provider_profiles.user_id')
                    ->orderByDesc('provider_profiles.average_rating');
                break;
            case 'experience':
                $query->join('provider_profiles', 'users.id', '=', 'provider_profiles.user_id')
                    ->orderByDesc('provider_profiles.years_of_experience');
                break;
            case 'recent':
                $query->orderByDesc('users.created_at');
                break;
            case 'distance':
            default:
                $query->orderByDesc('users.created_at');
        }

        $perPage = $request->get('per_page', 12);
        $providers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => collect($providers->items())->map(function ($provider) use ($request) {
                return $this->formatProviderForClient($provider, $request);
            }),
            'meta' => [
                'total' => $providers->total(),
                'per_page' => $providers->perPage(),
                'current_page' => $providers->currentPage(),
                'last_page' => $providers->lastPage(),
            ]
        ]);
    }

    /**
     * Search providers
     */
    public function search(Request $request)
    {
        $request->validate([
            'search' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $searchTerm = $request->search;

        $query = User::with(['providerProfile', 'services.category'])
            ->where('role', 'service_provider')
            ->where('is_active', true)
            ->where(function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhereHas('providerProfile', function ($profileQuery) use ($searchTerm) {
                        $profileQuery->where('business_name', 'like', "%{$searchTerm}%")
                            ->orWhere('bio', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('services', function ($serviceQuery) use ($searchTerm) {
                        $serviceQuery->where('title', 'like', "%{$searchTerm}%")
                            ->orWhere('description', 'like', "%{$searchTerm}%");
                    });
            });

        // Location filtering
        if ($request->latitude && $request->longitude) {
            $query->whereHas('services', function ($serviceQuery) use ($request) {
                $serviceQuery->where('is_active', true)
                    ->servingLocation($request->latitude, $request->longitude);
            });
        }

        $perPage = $request->get('per_page', 12);
        $providers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => collect($providers->items())->map(function ($provider) use ($request) {
                return $this->formatProviderForClient($provider, $request);
            }),
            'meta' => [
                'total' => $providers->total(),
                'per_page' => $providers->perPage(),
                'current_page' => $providers->currentPage(),
                'last_page' => $providers->lastPage(),
            ]
        ]);
    }

    /**
     * Get provider details
     */
    public function show(User $provider)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $provider->load([
            'providerProfile',
            'services' => function ($query) {
                $query->where('is_active', true)->with('category');
            },
            'providerAppointments' => function ($query) {
                $query->completed()
                    ->whereNotNull('provider_rating')
                    ->with('client:id,first_name,last_name', 'service:id,title')
                    ->latest()
                    ->limit(10);
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatProviderDetailForClient($provider)
        ]);
    }

    /**
     * Get provider's services
     */
    public function getServices(User $provider, Request $request)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'category_id' => 'nullable|exists:service_categories,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $query = $provider->services()
            ->with(['category'])
            ->where('is_active', true);

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $query->servingLocation($request->latitude, $request->longitude);
        }

        $perPage = $request->get('per_page', 12);
        $services = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $services->through(function ($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'description' => Str::limit($service->description, 150),
                    'category' => [
                        'id' => $service->category->id,
                        'name' => $service->category->name,
                        'icon' => $service->category->icon,
                        'color' => $service->category->color,
                    ],
                    'pricing_type' => $service->pricing_type,
                    'base_price' => $service->base_price,
                    'formatted_price' => $service->formatted_price,
                    'duration_hours' => $service->duration_hours,
                    'average_rating' => $service->average_rating,
                    'first_image_url' => $service->first_image_url,
                    'distance' => isset($service->distance) ? round($service->distance, 2) : null,
                ];
            }),
            'meta' => [
                'total' => $services->total(),
                'per_page' => $services->perPage(),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
            ]
        ]);
    }

    /**
     * Get provider availability
     */
    public function getAvailability(User $provider, Request $request)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'date' => 'nullable|date|after_or_equal:today',
            'service_duration' => 'nullable|numeric|min:0.5|max:8',
        ]);

        try {
            $availabilityService = app(\App\Services\AvailabilityService::class);

            if ($request->date) {
                // Get available slots for specific date
                $serviceDuration = $request->service_duration ?? 1;
                $slots = $availabilityService->getAvailableSlots(
                    $provider,
                    $request->date,
                    $serviceDuration
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'date' => $request->date,
                        'available_slots' => $slots,
                        'total_slots' => count($slots),
                    ]
                ]);
            } else {
                // Get general availability summary
                $summary = $availabilityService->getAvailabilitySummary($provider);

                return response()->json([
                    'success' => true,
                    'data' => $summary
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get provider's weekly availability schedule
     */
    public function getWeeklyAvailability(User $provider)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        try {
            $availability = ProviderAvailability::where('provider_id', $provider->id)
                ->orderBy('day_of_week')
                ->get();

            $weeklySchedule = [];
            for ($day = 0; $day <= 6; $day++) {
                $dayAvailability = $availability->where('day_of_week', $day)->first();

                $weeklySchedule[] = [
                    'day_of_week' => $day,
                    'day_name' => $this->getDayName($day),
                    'is_available' => $dayAvailability ? $dayAvailability->is_available : false,
                    'start_time' => $dayAvailability && $dayAvailability->is_available ?
                        $dayAvailability->start_time->format('H:i') : null,
                    'end_time' => $dayAvailability && $dayAvailability->is_available ?
                        $dayAvailability->end_time->format('H:i') : null,
                    'formatted_time_range' => $dayAvailability && $dayAvailability->is_available ?
                        $dayAvailability->formatted_time_range : 'Unavailable'
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $weeklySchedule,
                'message' => 'Weekly availability retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function getAvailableSlots(Request $request, User $provider)
    // {
    //     if ($provider->role !== 'service_provider') {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Provider not found'
    //         ], 404);
    //     }

    //     $request->validate([
    //         'date' => 'required|date|after_or_equal:today',
    //         'service_id' => 'nullable|exists:services,id',
    //         // 'duration' => 'nullable|numeric|min:0.5|max:8',
    //         'service_duration' => 'nullable|numeric|min:0.5|max:8',
    //     ]);

    //     try {
    //         $date = $request->input('date');
    //         $duration = $request->input('duration', 1);

    //         // Use the AvailabilityService for proper availability checking
    //         $availabilityService = app(\App\Services\AvailabilityService::class);

    //         $slots = $availabilityService->getAvailableSlots(
    //             $provider,
    //             $date,
    //             $duration
    //         );

    //         // Also get working hours for context
    //         $workingHours = $availabilityService->getWorkingHours($provider, $date);

    //         return response()->json([
    //             'success' => true,
    //             'data' => [
    //                 'date' => $date,
    //                 'available_slots' => $slots,
    //                 'total_slots' => count($slots),
    //                 'service_duration_hours' => $duration,
    //                 'working_hours' => $workingHours,
    //                 'provider_id' => $provider->id,
    //                 'day_of_week' => Carbon::parse($date)->dayOfWeek
    //             ],
    //             'message' => count($slots) > 0
    //                 ? 'Available slots found'
    //                 : 'No available slots for this date'
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Error getting available slots in ProviderController: ' . $e->getMessage());
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to retrieve available slots',
    //             'error' => config('app.debug') ? $e->getMessage() : 'Server error'
    //         ], 500);
    //     }
    // }
    /**
     * Get available time slots for a specific date
     */
    public function getAvailableSlots(Request $request, User $provider)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'nullable|exists:services,id',
            'service_duration' => 'nullable|numeric|min:0.5|max:8',
        ]);

        try {
            $date = $request->input('date');
            $duration = $request->input('service_duration', 1);

            // Use the AvailabilityService for proper availability checking
            $availabilityService = app(\App\Services\AvailabilityService::class);

            $slots = $availabilityService->getAvailableSlots(
                $provider,
                $date,
                $duration
            );

            // ✅ ADD: Filter past slots if date is today
            $filteredSlots = $this->filterPastSlots($slots, $date);

            // Also get working hours for context
            $workingHours = $availabilityService->getWorkingHours($provider, $date);

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'available_slots' => $filteredSlots,
                    'total_slots' => count($filteredSlots),
                    'service_duration_hours' => $duration,
                    'working_hours' => $workingHours,
                    'provider_id' => $provider->id,
                    'day_of_week' => Carbon::parse($date)->dayOfWeek,
                    // ✅ ADD: Debug info
                    'original_slots_count' => count($slots),
                    'filtered_slots_count' => count($filteredSlots),
                    'is_today' => $date === now('Asia/Colombo')->format('Y-m-d'),
                ],
                'message' => count($filteredSlots) > 0
                    ? 'Available slots found'
                    : 'No available slots for this date'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting available slots in ProviderController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available slots',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * ✅ ADD: Filter out past time slots for today
     */
    private function filterPastSlots($slots, $date)
    {
        // Only filter if the selected date is today
        $today = now('Asia/Colombo')->format('Y-m-d');
        if ($date !== $today) {
            return $slots;
        }

        // Add buffer time (configurable - you can move this to config)
        $bufferHours = 1; // Minimum 1 hour advance booking
        $cutoffTime = now('Asia/Colombo')->addHours($bufferHours);
        $cutoffTimeString = $cutoffTime->format('H:i');

        Log::info('Filtering past slots for today', [
            'date' => $date,
            'current_time' => now('Asia/Colombo')->format('H:i:s'),
            'cutoff_time' => $cutoffTimeString,
            'buffer_hours' => $bufferHours,
            'original_slots_count' => count($slots)
        ]);

        $filteredSlots = array_filter($slots, function ($slot) use ($cutoffTimeString) {
            // Handle different slot data structures
            $slotTime = $slot['start_time'] ?? $slot['time'] ?? null;

            if (!$slotTime) {
                return false; // Invalid slot
            }

            $isAvailable = $slotTime >= $cutoffTimeString;

            if (!$isAvailable) {
                Log::debug('Filtered out past slot', [
                    'slot_time' => $slotTime,
                    'cutoff_time' => $cutoffTimeString
                ]);
            }

            return $isAvailable;
        });

        // Log::info('Slot filtering completed', [
        //     'original_count' => count($slots),
        //     'filtered_count' => count($filteredSlots),
        //     'removed_count' => count($slots) - count($filteredSlots)
        // ]);

        // Reset array keys to maintain proper indexing
        return array_values($filteredSlots);
    }

    /**
     * Check if provider is available at specific time
     */
    public function checkAvailability(Request $request, User $provider)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        try {
            $date = $request->input('date');
            $startTime = $request->input('start_time');
            $endTime = $request->input('end_time');

            // Use the AvailabilityService for proper availability checking
            $availabilityService = app(\App\Services\AvailabilityService::class);

            $availability = $availabilityService->isAvailableAt(
                $provider,
                $date,
                $startTime,
                $endTime
            );

            return response()->json([
                'success' => true,
                'data' => $availability,
                'message' => $availability['available']
                    ? 'Time slot is available'
                    : ($availability['reason'] ?? 'Time slot not available')
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking availability in ProviderController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to check availability',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get provider's working hours for a specific date
     */
    public function getWorkingHours(User $provider, Request $request)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'date' => 'required|date|after_or_equal:today'
        ]);

        try {
            $availabilityService = app(\App\Services\AvailabilityService::class);
            $workingHours = $availabilityService->getWorkingHours($provider, $request->date);

            if (!$workingHours) {
                return response()->json([
                    'success' => false,
                    'message' => 'Provider not available on selected date',
                    'data' => [
                        'is_available' => false,
                        'start_time' => null,
                        'end_time' => null
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $request->date,
                    'is_available' => $workingHours['is_available'] ?? true,
                    'start_time' => $workingHours['start_time'],
                    'end_time' => $workingHours['end_time'],
                    'formatted_time_range' => $workingHours['formatted_time_range'] ??
                        $this->formatTimeRange($workingHours['start_time'], $workingHours['end_time']),
                    'max_hours_from_now' => $this->calculateMaxHoursFromTime(
                        $request->date,
                        $workingHours['start_time'],
                        $workingHours['end_time']
                    )
                ],
                'message' => 'Working hours retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve working hours',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Helper method to format time range
     */
    private function formatTimeRange($startTime, $endTime)
    {
        if (!$startTime || !$endTime) return 'Not available';

        $start = Carbon::parse($startTime)->format('g:i A');
        $end = Carbon::parse($endTime)->format('g:i A');

        return "{$start} - {$end}";
    }

    /**
     * Helper method to calculate maximum hours available from current time
     */
    private function calculateMaxHoursFromTime($date, $startTime, $endTime)
    {
        $today = now()->format('Y-m-d');
        $selectedDate = Carbon::parse($date)->format('Y-m-d');

        // If selected date is today, calculate from current time
        if ($selectedDate === $today) {
            $now = now();
            $endDateTime = Carbon::parse($date . ' ' . $endTime);

            if ($now->gte($endDateTime)) {
                return 0; // No time left today
            }

            return max(0, $now->diffInHours($endDateTime));
        }

        // For future dates, calculate full working day
        $start = Carbon::parse($date . ' ' . $startTime);
        $end = Carbon::parse($date . ' ' . $endTime);

        return $start->diffInHours($end);
    }

    /**
     * Get day name from day number
     */
    private function getDayName($dayOfWeek)
    {
        $days = [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday'
        ];

        return $days[$dayOfWeek] ?? 'Unknown';
    }

    /**
     * Format provider for client listing
     */
    private function formatProviderForClient($provider, $request = null)
    {
        $profile = $provider->providerProfile;
        $activeServices = $provider->services->where('is_active', true);

        return [
            'id' => $provider->id,
            'name' => $provider->full_name,
            'business_name' => $profile?->business_name,
            'bio' => Str::limit($profile?->bio, 150),
            'average_rating' => $profile?->average_rating ?? 0,
            'total_reviews' => $profile?->total_reviews ?? 0,
            'years_of_experience' => $profile?->years_of_experience,
            'verified' => $profile?->isVerified() ?? false,
            'verification_status' => $profile?->verification_status,
            'is_available' => $profile?->is_available ?? true,
            'profile_picture' => $provider->profile_picture
                ? Storage::url($provider->profile_picture)
                : null,
            'services_count' => $activeServices->count(),
            'categories' => $activeServices->pluck('category.name')->unique()->values(),
            'price_range' => [
                'min' => $activeServices->min('base_price') ?? 0,
                'max' => $activeServices->max('base_price') ?? 0,
            ],
            'created_at' => $provider->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format provider detail for client
     */
    private function formatProviderDetailForClient($provider)
    {
        $profile = $provider->providerProfile;
        $activeServices = $provider->services->where('is_active', true);

        return [
            'id' => $provider->id,
            'name' => $provider->full_name,
            'email' => $provider->email,
            'contact_number' => $provider->contact_number,
            'address' => $provider->address,
            'profile_picture' => $provider->profile_picture
                ? Storage::url($provider->profile_picture)
                : null,
            'business_details' => [
                'business_name' => $profile?->business_name,
                'bio' => $profile?->bio,
                'years_of_experience' => $profile?->years_of_experience,
                'service_area_radius' => $profile?->service_area_radius,
                'verification_status' => $profile?->verification_status,
                'verified' => $profile?->isVerified() ?? false,
                'verified_at' => $profile?->verified_at?->format('Y-m-d H:i:s'),
                'is_available' => $profile?->is_available ?? true,
            ],
            'ratings' => [
                'average_rating' => $profile?->average_rating ?? 0,
                'total_reviews' => $profile?->total_reviews ?? 0,
                'rating_breakdown' => $this->getRatingBreakdown($provider),
            ],
            'services' => $activeServices->map(function ($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'category' => $service->category->name,
                    'pricing_type' => $service->pricing_type,
                    'base_price' => $service->base_price,
                    'formatted_price' => $service->formatted_price,
                    'average_rating' => $service->average_rating,
                    'first_image_url' => $service->first_image_url,
                ];
            }),
            'recent_reviews' => $provider->providerAppointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'rating' => $appointment->provider_rating,
                    'review' => $appointment->provider_review,
                    'service_title' => $appointment->service->title,
                    'client_name' => $appointment->client->first_name . ' ' . substr($appointment->client->last_name, 0, 1) . '.',
                    'completed_at' => $appointment->completed_at?->format('M j, Y'),
                ];
            }),
            'statistics' => [
                'total_services' => $activeServices->count(),
                'total_bookings' => $provider->providerAppointments()->count(),
                'completed_bookings' => $provider->providerAppointments()->where('status', 'completed')->count(),
                'completion_rate' => $this->calculateProviderCompletionRate($provider),
                'average_response_time' => $this->calculateProviderResponseTime($provider),
                'categories_served' => $activeServices->pluck('category.name')->unique()->values(),
                'member_since' => $provider->created_at->format('M Y'),
            ],
            'portfolio' => [
                'certification_urls' => $profile?->certification_urls ?? [],
                'portfolio_image_urls' => $profile?->portfolio_image_urls ?? [],
            ],
            'created_at' => $provider->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get rating breakdown for provider
     */
    private function getRatingBreakdown($provider)
    {
        $appointments = $provider->providerAppointments()
            ->whereNotNull('provider_rating')
            ->get();

        if ($appointments->isEmpty()) {
            return [
                '5' => 0,
                '4' => 0,
                '3' => 0,
                '2' => 0,
                '1' => 0
            ];
        }

        $breakdown = $appointments->groupBy('provider_rating')
            ->map(function ($group) {
                return $group->count();
            });

        // Fill missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (!isset($breakdown[$i])) {
                $breakdown[$i] = 0;
            }
        }

        return $breakdown->sortKeysDesc();
    }

    /**
     * Calculate provider completion rate
     */
    private function calculateProviderCompletionRate($provider)
    {
        $totalAppointments = $provider->providerAppointments()->count();
        if ($totalAppointments === 0) return 0;

        $completedAppointments = $provider->providerAppointments()
            ->where('status', 'completed')
            ->count();

        return round(($completedAppointments / $totalAppointments) * 100, 1);
    }

    /**
     * Calculate provider average response time
     */
    private function calculateProviderResponseTime($provider)
    {
        $appointments = $provider->providerAppointments()
            ->whereNotNull('confirmed_at')
            ->whereColumn('confirmed_at', '>', 'created_at')
            ->get();

        if ($appointments->isEmpty()) return null;

        $totalMinutes = $appointments->sum(function ($appointment) {
            return $appointment->created_at->diffInMinutes($appointment->confirmed_at);
        });

        $averageMinutes = $totalMinutes / $appointments->count();

        if ($averageMinutes < 60) {
            return round($averageMinutes) . ' minutes';
        } else {
            return round($averageMinutes / 60, 1) . ' hours';
        }
    }
}
