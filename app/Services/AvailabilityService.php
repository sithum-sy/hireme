<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderAvailability;
use App\Models\BlockedTime;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AvailabilityService
{
    /**
     * Update provider's weekly availability
     */
    public function updateWeeklyAvailability(User $provider, array $availabilityData): array
    {
        DB::beginTransaction();

        try {
            // Delete existing availability
            ProviderAvailability::where('provider_id', $provider->id)->delete();

            $createdAvailability = [];

            foreach ($availabilityData as $dayData) {
                $availability = ProviderAvailability::create([
                    'provider_id' => $provider->id,
                    'day_of_week' => $dayData['day_of_week'],
                    'start_time' => $dayData['is_available'] ? $dayData['start_time'] : null,
                    'end_time' => $dayData['is_available'] ? $dayData['end_time'] : null,
                    'is_available' => $dayData['is_available'],
                ]);

                $createdAvailability[] = $availability;
            }

            DB::commit();

            return $createdAvailability;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get provider's weekly availability
     */
    public function getWeeklyAvailability(User $provider): array
    {
        $availability = ProviderAvailability::where('provider_id', $provider->id)
            ->orderBy('day_of_week')
            ->get()
            ->keyBy('day_of_week');

        $weeklySchedule = [];
        $dayNames = ProviderAvailability::getDaysOfWeek();

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
                'formatted_time_range' => $dayAvailability
                    ? $dayAvailability->formatted_time_range
                    : 'Unavailable',
            ];
        }

        return $weeklySchedule;
    }

    /**
     * Create blocked time period
     */
    public function createBlockedTime(User $provider, array $data): BlockedTime
    {
        return BlockedTime::create([
            'provider_id' => $provider->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'start_time' => $data['all_day'] ? null : ($data['start_time'] ?? null),
            'end_time' => $data['all_day'] ? null : ($data['end_time'] ?? null),
            'reason' => $data['reason'] ?? null,
            'all_day' => $data['all_day'] ?? false,
        ]);
    }

    /**
     * Get provider's blocked times
     */
    public function getBlockedTimes(User $provider, $startDate = null, $endDate = null)
    {
        $query = BlockedTime::where('provider_id', $provider->id);

        if ($startDate && $endDate) {
            $query->forDateRange($startDate, $endDate);
        } else {
            $query->active();
        }

        return $query->orderBy('start_date')->get();
    }

    /**
     * Check if provider is available at specific date and time
     */
    public function isAvailableAt(User $provider, $date, $startTime, $endTime): array
    {
        $date = Carbon::parse($date);
        $dayOfWeek = $date->dayOfWeek;

        // Check weekly availability
        $weeklyAvailability = ProviderAvailability::where('provider_id', $provider->id)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if (!$weeklyAvailability || !$weeklyAvailability->is_available) {
            return [
                'available' => false,
                'reason' => 'Provider is not available on ' . $date->format('l') . 's'
            ];
        }

        // Check if time is within working hours
        $requestStart = Carbon::parse($startTime);
        $requestEnd = Carbon::parse($endTime);
        $workStart = Carbon::parse($weeklyAvailability->start_time);
        $workEnd = Carbon::parse($weeklyAvailability->end_time);

        if ($requestStart->lt($workStart) || $requestEnd->gt($workEnd)) {
            return [
                'available' => false,
                'reason' => 'Requested time is outside working hours (' .
                    $weeklyAvailability->formatted_time_range . ')'
            ];
        }

        // Check for blocked times
        $blockedTimes = BlockedTime::where('provider_id', $provider->id)
            ->forDate($date->toDateString())
            ->get();

        foreach ($blockedTimes as $blocked) {
            if ($blocked->conflictsWith($date, $date, $requestStart->format('H:i'), $requestEnd->format('H:i'))) {
                return [
                    'available' => false,
                    'reason' => 'Provider has blocked this time' .
                        ($blocked->reason ? ': ' . $blocked->reason : '')
                ];
            }
        }

        // Check for existing appointments
        $existingAppointments = Appointment::where('provider_id', $provider->id)
            ->where('appointment_date', $date->toDateString())
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->get();

        foreach ($existingAppointments as $appointment) {
            $appointmentStart = Carbon::parse($appointment->appointment_time);
            $appointmentEnd = $appointmentStart->copy()->addHours($appointment->duration_hours);

            if (!($requestEnd->lte($appointmentStart) || $requestStart->gte($appointmentEnd))) {
                return [
                    'available' => false,
                    'reason' => 'Provider has another appointment at this time'
                ];
            }
        }

        return ['available' => true];
    }

    /**
     * Get available time slots for a specific date
     */
    public function getAvailableSlots(User $provider, $date, $serviceDuration = 1): array
    {
        $date = Carbon::parse($date);
        $dayOfWeek = $date->dayOfWeek;

        // Get weekly availability
        $weeklyAvailability = ProviderAvailability::where('provider_id', $provider->id)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if (!$weeklyAvailability || !$weeklyAvailability->is_available) {
            return [];
        }

        $workStart = Carbon::parse($date->toDateString() . ' ' . $weeklyAvailability->start_time);
        $workEnd = Carbon::parse($date->toDateString() . ' ' . $weeklyAvailability->end_time);

        // Get blocked times and appointments for the date
        $blockedTimes = BlockedTime::where('provider_id', $provider->id)
            ->forDate($date->toDateString())
            ->get();

        $appointments = Appointment::where('provider_id', $provider->id)
            ->where('appointment_date', $date->toDateString())
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->get();

        // Generate time slots (30-minute intervals)
        $availableSlots = [];
        $currentTime = $workStart->copy();
        $slotDuration = 30; // minutes

        while ($currentTime->copy()->addMinutes($serviceDuration * 60)->lte($workEnd)) {
            $slotEnd = $currentTime->copy()->addMinutes($serviceDuration * 60);
            $isAvailable = true;

            // Check against blocked times
            foreach ($blockedTimes as $blocked) {
                if ($blocked->conflictsWith(
                    $date->toDateString(),
                    $date->toDateString(),
                    $currentTime->format('H:i'),
                    $slotEnd->format('H:i')
                )) {
                    $isAvailable = false;
                    break;
                }
            }

            // Check against existing appointments
            if ($isAvailable) {
                foreach ($appointments as $appointment) {
                    $appointmentStart = Carbon::parse($date->toDateString() . ' ' . $appointment->appointment_time);
                    $appointmentEnd = $appointmentStart->copy()->addHours($appointment->duration_hours);

                    if (!($slotEnd->lte($appointmentStart) || $currentTime->gte($appointmentEnd))) {
                        $isAvailable = false;
                        break;
                    }
                }
            }

            if ($isAvailable) {
                $availableSlots[] = [
                    'start_time' => $currentTime->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                    'formatted_time' => $currentTime->format('g:i A') . ' - ' . $slotEnd->format('g:i A'),
                ];
            }

            $currentTime->addMinutes($slotDuration);
        }

        return $availableSlots;
    }

    /**
     * Delete blocked time
     */
    public function deleteBlockedTime(User $provider, BlockedTime $blockedTime): bool
    {
        if ($blockedTime->provider_id !== $provider->id) {
            throw new \Exception('You can only delete your own blocked times');
        }

        return $blockedTime->delete();
    }

    /**
     * Get provider's availability summary
     */
    public function getAvailabilitySummary(User $provider): array
    {
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
            'next_blocked_period' => $activeBlockedTimes->first(),
        ];
    }
}
