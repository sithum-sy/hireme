<?php
// app/Services/AvailabilityService.php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderAvailability;
use App\Models\BlockedTime;
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
            \Log::info('Creating blocked time for provider: ' . $provider->id);
            \Log::info('Original blocked time data: ' . json_encode($data));

            // Ensure dates are parsed correctly without timezone conversion
            $startDate = Carbon::parse($data['start_date'])->format('Y-m-d');
            $endDate = Carbon::parse($data['end_date'])->format('Y-m-d');

            \Log::info('Parsed dates - Start: ' . $startDate . ', End: ' . $endDate);

            $blockedTime = BlockedTime::create([
                'provider_id' => $provider->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'start_time' => $data['all_day'] ? null : ($data['start_time'] ?? null),
                'end_time' => $data['all_day'] ? null : ($data['end_time'] ?? null),
                'reason' => $data['reason'] ?? null,
                'all_day' => $data['all_day'] ?? false,
            ]);

            \Log::info('Created blocked time: ' . json_encode($blockedTime->toArray()));

            return $blockedTime;
        } catch (\Exception $e) {
            \Log::error('Error creating blocked time: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get provider's blocked times
     */
    public function getBlockedTimes(User $provider, $startDate = null, $endDate = null)
    {
        try {
            \Log::info('Getting blocked times for provider: ' . $provider->id);

            $query = BlockedTime::where('provider_id', $provider->id);

            if ($startDate && $endDate) {
                $query->forDateRange($startDate, $endDate);
            } else {
                $query->active();
            }

            return $query->orderBy('start_date')->get();
        } catch (\Exception $e) {
            \Log::error('Error getting blocked times: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete blocked time
     */
    public function deleteBlockedTime(User $provider, BlockedTime $blockedTime): bool
    {
        try {
            \Log::info('Deleting blocked time: ' . $blockedTime->id . ' for provider: ' . $provider->id);

            if ($blockedTime->provider_id !== $provider->id) {
                throw new \Exception('You can only delete your own blocked times');
            }

            return $blockedTime->delete();
        } catch (\Exception $e) {
            \Log::error('Error deleting blocked time: ' . $e->getMessage());
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
}
