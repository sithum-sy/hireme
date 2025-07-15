<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvailabilityRequest;
use App\Http\Requests\BlockTimeRequest;
use App\Models\BlockedTime;
use App\Models\ProviderAvailability;
use App\Models\User;
use App\Services\AvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AvailabilityController extends Controller
{
    protected $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    /**
     * Get provider's weekly availability
     */
    public function getWeeklyAvailability()
    {
        try {
            // Log::info('getWeeklyAvailability called for user: ' . Auth::id());

            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access availability settings'
                ], 403);
            }

            $availability = $this->availabilityService->getWeeklyAvailability($user);

            return response()->json([
                'success' => true,
                'data' => $availability
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getWeeklyAvailability: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch availability',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Create or update provider's weekly availability
     */
    public function saveWeeklyAvailability(AvailabilityRequest $request)
    {
        try {
            // Log::info('saveWeeklyAvailability called for user: ' . Auth::id());
            // Log::info('Request data: ' . json_encode($request->all()));

            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can manage availability'
                ], 403);
            }

            $availability = $this->availabilityService->createOrUpdateWeeklyAvailability(
                $user,
                $request->validated()['availability']
            );

            return response()->json([
                'success' => true,
                'message' => 'Availability schedule saved successfully',
                'data' => $availability
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error saving weekly availability: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save availability schedule',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Update provider's weekly availability (for PUT requests)
     */
    public function updateWeeklyAvailability(AvailabilityRequest $request)
    {
        return $this->saveWeeklyAvailability($request);
    }

    /**
     * Get availability summary
     */
    public function getAvailabilitySummary()
    {
        try {
            // Log::info('getAvailabilitySummary called for user: ' . Auth::id());

            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access availability summary'
                ], 403);
            }

            $summary = $this->availabilityService->getAvailabilitySummary($user);

            return response()->json([
                'success' => true,
                'data' => $summary
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getAvailabilitySummary: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch availability summary',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Test endpoint
     */
    public function testSave(Request $request)
    {
        try {
            // Log::info('Test endpoint called');
            // Log::info('User: ' . Auth::id());

            return response()->json([
                'success' => true,
                'message' => 'Test endpoint working',
                'user_id' => Auth::id(),
                'user_role' => Auth::user()->role ?? 'unknown',
                'data' => $request->all()
            ]);
        } catch (\Exception $e) {
            Log::error('Error in test endpoint: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create blocked time
     */
    public function createBlockedTime(BlockTimeRequest $request)
    {
        try {
            // Log::info('createBlockedTime called for user: ' . Auth::id());
            // Log::info('Request data: ' . json_encode($request->all()));

            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can block time'
                ], 403);
            }

            $blockedTime = $this->availabilityService->createBlockedTime($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Time blocked successfully',
                'data' => [
                    'id' => $blockedTime->id,
                    'start_date' => $blockedTime->start_date->format('Y-m-d'),
                    'end_date' => $blockedTime->end_date->format('Y-m-d'),
                    'start_time' => $blockedTime->start_time?->format('H:i'),
                    'end_time' => $blockedTime->end_time?->format('H:i'),
                    'all_day' => $blockedTime->all_day,
                    'reason' => $blockedTime->reason,
                    'formatted_date_range' => $blockedTime->formatted_date_range,
                    'formatted_time_range' => $blockedTime->formatted_time_range,
                    'is_active' => $blockedTime->isActive(),
                    'created_at' => $blockedTime->created_at->format('Y-m-d H:i:s'),
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating blocked time: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to block time',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get blocked times
     */
    public function getBlockedTimes(Request $request)
    {
        try {
            // Log::info('getBlockedTimes called for user: ' . Auth::id());

            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access blocked times'
                ], 403);
            }

            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            $blockedTimes = $this->availabilityService->getBlockedTimes($user, $startDate, $endDate);

            $formattedBlockedTimes = $blockedTimes->map(function ($blocked) {
                return [
                    'id' => $blocked->id,
                    'start_date' => $blocked->start_date->format('Y-m-d'),
                    'end_date' => $blocked->end_date->format('Y-m-d'),
                    'start_time' => $blocked->start_time?->format('H:i'),
                    'end_time' => $blocked->end_time?->format('H:i'),
                    'all_day' => $blocked->all_day,
                    'reason' => $blocked->reason,
                    'formatted_date_range' => $blocked->formatted_date_range,
                    'formatted_time_range' => $blocked->formatted_time_range,
                    'is_active' => $blocked->isActive(),
                    'created_at' => $blocked->created_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedBlockedTimes
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching blocked times: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blocked times',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Delete blocked time
     */
    public function deleteBlockedTime(BlockedTime $blockedTime)
    {
        try {
            // Log::info('deleteBlockedTime called for user: ' . Auth::id() . ', blocked time: ' . $blockedTime->id);

            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can delete blocked times'
                ], 403);
            }

            $this->availabilityService->deleteBlockedTime($user, $blockedTime);

            return response()->json([
                'success' => true,
                'message' => 'Blocked time deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting blocked time: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blocked time',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Check availability for specific date and time (Public)
     */
    // public function checkAvailability(Request $request, $providerId)
    // {
    //     try {
    //         $request->validate([
    //             'date' => 'required|date|after_or_equal:today',
    //             'start_time' => 'required|date_format:H:i',
    //             'end_time' => 'required|date_format:H:i|after:start_time',
    //         ]);

    //         $provider = \App\Models\User::where('id', $providerId)
    //             ->where('role', 'service_provider')
    //             ->firstOrFail();

    //         $availability = $this->availabilityService->isAvailableAt(
    //             $provider,
    //             $request->date,
    //             $request->start_time,
    //             $request->end_time
    //         );

    //         return response()->json([
    //             'success' => true,
    //             'data' => $availability
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to check availability',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Get available time slots for a specific date (Public)
     */
    // public function getAvailableSlots(Request $request, $providerId)
    // {
    //     try {
    //         $request->validate([
    //             'date' => 'required|date|after_or_equal:today',
    //             'service_duration' => 'nullable|numeric|min:0.5|max:8',
    //         ]);

    //         $provider = \App\Models\User::where('id', $providerId)
    //             ->where('role', 'service_provider')
    //             ->firstOrFail();

    //         $serviceDuration = (float) $request->get('service_duration', 1);
    //         $date = $request->get('date');

    //         Log::info("Getting slots for provider {$providerId} on {$date} with duration {$serviceDuration}h");

    //         $slots = $this->availabilityService->getAvailableSlots(
    //             $provider,
    //             $date,
    //             $serviceDuration
    //         );

    //         // Also get the working hours info for the day
    //         $dayOfWeek = Carbon::parse($date)->dayOfWeek;
    //         $weeklyAvailability = \App\Models\ProviderAvailability::where('provider_id', $provider->id)
    //             ->where('day_of_week', $dayOfWeek)
    //             ->where('is_available', true)
    //             ->first();

    //         return response()->json([
    //             'success' => true,
    //             'data' => [
    //                 'date' => $date,
    //                 'service_duration_hours' => $serviceDuration,
    //                 'available_slots' => $slots,
    //                 'total_slots' => count($slots),
    //                 'working_hours' => $weeklyAvailability ? [
    //                     'start' => $weeklyAvailability->start_time->format('H:i'),
    //                     'end' => $weeklyAvailability->end_time->format('H:i'),
    //                     'formatted' => $weeklyAvailability->formatted_time_range
    //                 ] : null,
    //                 'provider_id' => $provider->id,
    //                 'day_of_week' => $dayOfWeek
    //             ]
    //         ], 200);
    //     } catch (\Exception $e) {
    //         Log::error('Error getting available slots: ' . $e->getMessage());
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch available slots',
    //             'error' => config('app.debug') ? $e->getMessage() : 'Server error'
    //         ], 500);
    //     }
    // }

    /**
     * Get provider's weekly availability (Public - for clients)
     */
    public function getProviderWeeklyAvailability($providerId)
    {
        try {
            $provider = \App\Models\User::where('id', $providerId)
                ->where('role', 'service_provider')
                ->firstOrFail();

            $availability = $this->availabilityService->getWeeklyAvailability($provider);

            return response()->json([
                'success' => true,
                'data' => $availability
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch provider availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
