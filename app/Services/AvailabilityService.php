<?php
// app/Services/AvailabilityService.php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderAvailability;
use App\Models\BlockedTime;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AvailabilityService
{
    /**
     * Get provider's weekly availability
     */
    public function getWeeklyAvailability(User $provider): array
    {
        try {
            Log::info('Getting weekly availability for provider: ' . $provider->id);

            $availability = ProviderAvailability::where('provider_id', $provider->id)
                ->orderBy('day_of_week')
                ->get()
                ->keyBy('day_of_week');

            $weeklySchedule = [];
            $dayNames = [
                0 => 'Sunday',
                1 => 'Monday',
                2 => 'Tuesday',
                3 => 'Wednesday',
                4 => 'Thursday',
                5 => 'Friday',
                6 => 'Saturday'
            ];

            for ($day = 0; $day <= 6; $day++) {
                $dayAvailability = $availability->get($day);

                $weeklySchedule[] = [
                    'day_of_week' => $day,
                    'day_name' => $dayNames[$day],
                    'is_available' => $dayAvailability ? $dayAvailability->is_available : false,
                    'start_time' => $dayAvailability && $dayAvailability->start_time
                        ? $dayAvailability->start_time->format('H:i')
                        : null,
                    'end_time' => $dayAvailability && $dayAvailability->end_time
                        ? $dayAvailability->end_time->format('H:i')
                        : null,
                    'formatted_time_range' => $dayAvailability && $dayAvailability->is_available
                        ? $this->formatTimeRange($dayAvailability->start_time, $dayAvailability->end_time)
                        : 'Unavailable',
                ];
            }

            Log::info('Weekly schedule retrieved: ' . json_encode($weeklySchedule));
            return $weeklySchedule;
        } catch (\Exception $e) {
            Log::error('Error getting weekly availability: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create or update provider's weekly availability
     */
    public function createOrUpdateWeeklyAvailability(User $provider, array $availabilityData): array
    {
        DB::beginTransaction();

        try {
            Log::info('Creating/updating availability for provider: ' . $provider->id);
            Log::info('Availability data: ' . json_encode($availabilityData));

            // Delete existing availability
            $deletedCount = ProviderAvailability::where('provider_id', $provider->id)->delete();
            Log::info('Deleted existing records: ' . $deletedCount);

            $createdAvailability = [];

            foreach ($availabilityData as $dayData) {
                Log::info('Processing day: ' . json_encode($dayData));

                $availability = ProviderAvailability::create([
                    'provider_id' => $provider->id,
                    'day_of_week' => $dayData['day_of_week'],
                    'start_time' => $dayData['is_available'] ? $dayData['start_time'] : null,
                    'end_time' => $dayData['is_available'] ? $dayData['end_time'] : null,
                    'is_available' => $dayData['is_available'],
                ]);

                $createdAvailability[] = [
                    'day_of_week' => $availability->day_of_week,
                    'day_name' => $availability->day_name ?? $this->getDayName($availability->day_of_week),
                    'is_available' => $availability->is_available,
                    'start_time' => $availability->start_time ? $availability->start_time->format('H:i') : null,
                    'end_time' => $availability->end_time ? $availability->end_time->format('H:i') : null,
                    'formatted_time_range' => $availability->is_available && $availability->start_time && $availability->end_time
                        ? $this->formatTimeRange($availability->start_time, $availability->end_time)
                        : 'Unavailable',
                ];
            }

            DB::commit();
            Log::info('Successfully saved availability');

            return $createdAvailability;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to save availability: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get provider's availability summary
     */
    public function getAvailabilitySummary(User $provider): array
    {
        try {
            Log::info('Getting availability summary for provider: ' . $provider->id);

            $weeklyAvailability = $this->getWeeklyAvailability($provider);
            $activeBlockedTimes = $this->getBlockedTimes($provider);

            $totalWorkingDays = collect($weeklyAvailability)->where('is_available', true)->count();
            $totalWorkingHours = collect($weeklyAvailability)
                ->where('is_available', true)
                ->sum(function ($day) {
                    if (!$day['start_time'] || !$day['end_time']) return 0;

                    $start = Carbon::parse($day['start_time']);
                    $end = Carbon::parse($day['end_time']);
                    return $end->diffInHours($start);
                });

            return [
                'weekly_availability' => $weeklyAvailability,
                'blocked_times_count' => $activeBlockedTimes->count(),
                'total_working_days' => $totalWorkingDays,
                'total_weekly_hours' => $totalWorkingHours,
                'average_daily_hours' => $totalWorkingDays > 0 ? round($totalWorkingHours / $totalWorkingDays, 1) : 0,
                'next_blocked_period' => null, // We'll implement this later
            ];
        } catch (\Exception $e) {
            Log::error('Error getting availability summary: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create blocked time period
     */
    public function createBlockedTime(User $provider, array $data): BlockedTime
    {
        try {
            Log::info('Creating blocked time for provider: ' . $provider->id);
            Log::info('Original blocked time data: ' . json_encode($data));

            // Ensure dates are parsed correctly without timezone conversion
            $startDate = Carbon::parse($data['start_date'])->format('Y-m-d');
            $endDate = Carbon::parse($data['end_date'])->format('Y-m-d');

            Log::info('Parsed dates - Start: ' . $startDate . ', End: ' . $endDate);

            $blockedTime = BlockedTime::create([
                'provider_id' => $provider->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'start_time' => $data['all_day'] ? null : ($data['start_time'] ?? null),
                'end_time' => $data['all_day'] ? null : ($data['end_time'] ?? null),
                'reason' => $data['reason'] ?? null,
                'all_day' => $data['all_day'] ?? false,
            ]);

            Log::info('Created blocked time: ' . json_encode($blockedTime->toArray()));

            return $blockedTime;
        } catch (\Exception $e) {
            Log::error('Error creating blocked time: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get provider's blocked times
     */
    public function getBlockedTimes(User $provider, $startDate = null, $endDate = null)
    {
        try {
            Log::info('Getting blocked times for provider: ' . $provider->id);

            $query = BlockedTime::where('provider_id', $provider->id);

            if ($startDate && $endDate) {
                $query->forDateRange($startDate, $endDate);
            } else {
                $query->active();
            }

            return $query->orderBy('start_date')->get();
        } catch (\Exception $e) {
            Log::error('Error getting blocked times: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete blocked time
     */
    public function deleteBlockedTime(User $provider, BlockedTime $blockedTime): bool
    {
        try {
            Log::info('Deleting blocked time: ' . $blockedTime->id . ' for provider: ' . $provider->id);

            if ($blockedTime->provider_id !== $provider->id) {
                throw new \Exception('You can only delete your own blocked times');
            }

            return $blockedTime->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting blocked time: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Helper methods
     */
    private function formatTimeRange($startTime, $endTime)
    {
        if (!$startTime || !$endTime) return 'Unavailable';

        return $startTime->format('g:i A') . ' - ' . $endTime->format('g:i A');
    }

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

    // Add these methods to your existing App/Services/AvailabilityService.php:

    /**
     * Get available time slots for a specific date with proper conflict checking
     */
    public function getAvailableSlots(User $provider, $date, $serviceDuration = 1): array
    {
        try {
            Log::info("Getting available slots for provider {$provider->id} on {$date} with duration {$serviceDuration}h");

            $checkDate = Carbon::parse($date);
            $dayOfWeek = $checkDate->dayOfWeek;

            // Add more detailed logging
            Log::info("Date details - Date: {$date}, Carbon date: {$checkDate->toDateString()}, Day of week: {$dayOfWeek}, Day name: {$checkDate->format('l')}");

            // Check if provider works on this day
            $weeklyAvailability = ProviderAvailability::where('provider_id', $provider->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (!$weeklyAvailability || !$weeklyAvailability->start_time || !$weeklyAvailability->end_time) {
                Log::info("Provider {$provider->id} not available on day {$dayOfWeek}");


                // Also log what days ARE available
                $availableDays = ProviderAvailability::where('provider_id', $provider->id)
                    ->where('is_available', true)
                    ->pluck('day_of_week')
                    ->toArray();
                Log::info("Provider {$provider->id} IS available on days: " . implode(', ', $availableDays));

                return [];
            }

            $workingStart = Carbon::parse($weeklyAvailability->start_time);
            $workingEnd = Carbon::parse($weeklyAvailability->end_time);

            Log::info("Working hours: {$workingStart->format('H:i')} - {$workingEnd->format('H:i')}");

            // Get blocked times for this date
            $blockedTimes = BlockedTime::where('provider_id', $provider->id)
                ->forDate($date)
                ->get();

            Log::info("Found " . $blockedTimes->count() . " blocked times for {$date}");

            // Get existing appointments for this date
            $existingAppointments = $this->getExistingAppointments($provider, $date);

            Log::info("Found " . $existingAppointments->count() . " existing appointments for {$date}");

            // Generate time slots (30-minute intervals)
            $slots = [];
            $current = $workingStart->copy();
            $slotInterval = 60; // minutes
            $serviceDurationMinutes = $serviceDuration * 60;

            while ($current->copy()->addMinutes($serviceDurationMinutes)->lte($workingEnd)) {
                $slotEnd = $current->copy()->addMinutes($serviceDurationMinutes);

                // Check if this slot conflicts with blocked times
                $isBlocked = $this->isTimeSlotBlocked($current, $slotEnd, $blockedTimes, $date);

                // Check if this slot conflicts with existing appointments
                $hasAppointmentConflict = $this->hasAppointmentConflict($current, $slotEnd, $existingAppointments);

                if (!$isBlocked && !$hasAppointmentConflict) {
                    $slots[] = [
                        'start_time' => $current->format('H:i'),
                        'end_time' => $slotEnd->format('H:i'),
                        'time' => $current->format('H:i'), // For compatibility
                        'formatted_time' => $current->format('g:i A'),
                        'is_popular' => $this->isPopularTimeSlot($current),
                        'is_available' => true,
                        'duration_minutes' => $serviceDurationMinutes
                    ];
                }

                $current->addMinutes($slotInterval);
            }

            Log::info("Generated " . count($slots) . " available slots");
            return $slots;
        } catch (\Exception $e) {
            Log::error('Error getting available slots: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Check if a time slot is blocked
     */
    private function isTimeSlotBlocked($startTime, $endTime, $blockedTimes, $date)
    {
        foreach ($blockedTimes as $blocked) {
            // If it's an all-day block, the entire day is blocked
            if ($blocked->all_day) {
                return true;
            }

            // If blocked time has no specific times, treat as all day
            if (!$blocked->start_time || !$blocked->end_time) {
                return true;
            }

            // Check for time overlap
            $blockedStart = Carbon::parse($blocked->start_time);
            $blockedEnd = Carbon::parse($blocked->end_time);

            // Times overlap if: start < blocked_end AND end > blocked_start
            $overlaps = $startTime->lt($blockedEnd) && $endTime->gt($blockedStart);

            if ($overlaps) {
                Log::info("Slot {$startTime->format('H:i')}-{$endTime->format('H:i')} blocked by: {$blocked->reason}");
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a time slot conflicts with existing appointments
     */
    private function hasAppointmentConflict($startTime, $endTime, $existingAppointments)
    {
        foreach ($existingAppointments as $appointment) {
            $appointmentStart = Carbon::parse($appointment->appointment_time);
            $appointmentEnd = $appointmentStart->copy()->addHours($appointment->duration_hours);

            // Times overlap if: start < appointment_end AND end > appointment_start
            $overlaps = $startTime->lt($appointmentEnd) && $endTime->gt($appointmentStart);

            if ($overlaps) {
                Log::info("Slot {$startTime->format('H:i')}-{$endTime->format('H:i')} conflicts with appointment #{$appointment->id}");
                return true;
            }
        }

        return false;
    }

    /**
     * Get existing appointments for conflict checking
     */
    private function getExistingAppointments(User $provider, $date)
    {
        try {
            // Check if Appointment model exists and get appointments
            if (class_exists('\App\Models\Appointment')) {
                return \App\Models\Appointment::where('provider_id', $provider->id)
                    ->where('appointment_date', $date)
                    ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                    ->get();
            }

            return collect();
        } catch (\Exception $e) {
            Log::warning('Could not check existing appointments: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Enhanced availability checking with detailed logging
     */
    public function isAvailableAt(User $provider, $date, $startTime, $endTime): array
    {
        try {
            Log::info("Checking availability for provider {$provider->id} on {$date} from {$startTime} to {$endTime}");

            $checkDate = Carbon::parse($date);
            $dayOfWeek = $checkDate->dayOfWeek;

            // Check weekly schedule
            $weeklyAvailability = ProviderAvailability::where('provider_id', $provider->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (!$weeklyAvailability) {
                Log::info("Provider not available on day {$dayOfWeek}");
                return [
                    'available' => false,
                    'reason' => 'Provider not available on this day of week',
                    'day_of_week' => $dayOfWeek,
                    'day_name' => $this->getDayName($dayOfWeek)
                ];
            }

            // Check if working hours are set
            if (!$weeklyAvailability->start_time || !$weeklyAvailability->end_time) {
                Log::info("Provider working hours not set for day {$dayOfWeek}");
                return [
                    'available' => false,
                    'reason' => 'Working hours not configured for this day'
                ];
            }

            // Check if time falls within working hours
            $requestedStart = Carbon::parse($startTime);
            $requestedEnd = Carbon::parse($endTime);
            $workingStart = Carbon::parse($weeklyAvailability->start_time);
            $workingEnd = Carbon::parse($weeklyAvailability->end_time);

            if ($requestedStart->lt($workingStart) || $requestedEnd->gt($workingEnd)) {
                Log::info("Requested time outside working hours");
                return [
                    'available' => false,
                    'reason' => 'Requested time outside working hours',
                    'working_hours' => [
                        'start' => $workingStart->format('H:i'),
                        'end' => $workingEnd->format('H:i')
                    ],
                    'requested_time' => [
                        'start' => $requestedStart->format('H:i'),
                        'end' => $requestedEnd->format('H:i')
                    ]
                ];
            }

            // Check for blocked times
            $blockedTimes = BlockedTime::where('provider_id', $provider->id)
                ->forDate($date)
                ->get();

            foreach ($blockedTimes as $blocked) {
                if ($blocked->conflictsWith($date, $date, $startTime, $endTime)) {
                    Log::info("Time conflicts with blocked period: {$blocked->reason}");
                    return [
                        'available' => false,
                        'reason' => 'Time slot is blocked',
                        'blocked_reason' => $blocked->reason,
                        'blocked_time' => $blocked->formatted_time_range
                    ];
                }
            }

            // Check for existing appointments
            $existingAppointments = $this->getExistingAppointments($provider, $date);

            foreach ($existingAppointments as $appointment) {
                $appointmentStart = Carbon::parse($appointment->appointment_time);
                $appointmentEnd = $appointmentStart->copy()->addHours($appointment->duration_hours);

                if ($requestedStart->lt($appointmentEnd) && $requestedEnd->gt($appointmentStart)) {
                    Log::info("Time conflicts with existing appointment #{$appointment->id}");
                    return [
                        'available' => false,
                        'reason' => 'Time slot already booked',
                        'conflicting_appointment' => $appointment->id
                    ];
                }
            }

            return [
                'available' => true,
                'working_hours' => [
                    'start' => $workingStart->format('H:i'),
                    'end' => $workingEnd->format('H:i')
                ],
                'checked_at' => now()->toISOString()
            ];
        } catch (\Exception $e) {
            Log::error('Error checking availability: ' . $e->getMessage());
            return [
                'available' => false,
                'reason' => 'Error checking availability',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get provider's working hours for a specific day
     */
    // public function getWorkingHours(User $provider, $date): ?array
    // {
    //     $dayOfWeek = Carbon::parse($date)->dayOfWeek;

    //     $weeklyAvailability = ProviderAvailability::where('provider_id', $provider->id)
    //         ->where('day_of_week', $dayOfWeek)
    //         ->where('is_available', true)
    //         ->first();

    //     if (!$weeklyAvailability || !$weeklyAvailability->start_time || !$weeklyAvailability->end_time) {
    //         return null;
    //     }

    //     return [
    //         'start' => $weeklyAvailability->start_time->format('H:i'),
    //         'end' => $weeklyAvailability->end_time->format('H:i'),
    //         'formatted' => $weeklyAvailability->formatted_time_range,
    //         'day_name' => $this->getDayName($dayOfWeek)
    //     ];
    // }

    public function getWorkingHours($provider, $date)
    {
        try {
            $dayOfWeek = Carbon::parse($date)->dayOfWeek;

            // Get provider's weekly availability
            $availability = ProviderAvailability::where('provider_id', $provider->id)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            if (!$availability || !$availability->is_available) {
                return null; // Not available on this day
            }

            // Check for blocked times on this specific date
            $blockedTimes = BlockedTime::where('provider_id', $provider->id)
                ->where('start_date', '<=', $date)
                ->where('end_date', '>=', $date)
                ->get();

            // If there's an all-day block, provider is not available
            foreach ($blockedTimes as $blockedTime) {
                if ($blockedTime->all_day) {
                    return null;
                }
            }

            return [
                'is_available' => true,
                'start_time' => $availability->start_time->format('H:i'),
                'end_time' => $availability->end_time->format('H:i'),
                'day_of_week' => $dayOfWeek,
                'blocked_times' => $blockedTimes->map(function ($block) {
                    return [
                        'start_time' => $block->start_time ? $block->start_time->format('H:i') : null,
                        'end_time' => $block->end_time ? $block->end_time->format('H:i') : null,
                        'all_day' => $block->all_day,
                        'reason' => $block->reason
                    ];
                })
            ];
        } catch (\Exception $e) {
            Log::error('Error getting working hours: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Determine if a time slot is popular (peak hours)
     */
    private function isPopularTimeSlot(Carbon $time): bool
    {
        $hour = $time->hour;

        // Consider 9 AM - 12 PM and 2 PM - 5 PM as popular times
        return ($hour >= 9 && $hour < 12) || ($hour >= 14 && $hour < 17);
    }

    /**
     * Check if provider has any availability on a given date
     */
    public function hasAvailabilityOnDate(User $provider, $date): bool
    {
        $slots = $this->getAvailableSlots($provider, $date, 1);
        return count($slots) > 0;
    }
}
