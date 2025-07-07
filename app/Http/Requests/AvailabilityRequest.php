<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class AvailabilityRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'availability' => 'required|array|size:7', // 7 days of the week
            'availability.*.day_of_week' => 'required|integer|between:0,6',
            'availability.*.is_available' => 'required|boolean',
            'availability.*.start_time' => 'required_if:availability.*.is_available,true|nullable|date_format:H:i',
            'availability.*.end_time' => 'required_if:availability.*.is_available,true|nullable|date_format:H:i|after:availability.*.start_time',
        ];
    }

    public function messages()
    {
        return [
            'availability.required' => 'Availability data is required',
            'availability.array' => 'Availability must be an array',
            'availability.size' => 'Availability must contain exactly 7 days',
            'availability.*.day_of_week.required' => 'Day of week is required',
            'availability.*.day_of_week.integer' => 'Day of week must be a number',
            'availability.*.day_of_week.between' => 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
            'availability.*.is_available.required' => 'Availability status is required',
            'availability.*.is_available.boolean' => 'Availability status must be true or false',
            'availability.*.start_time.required_if' => 'Start time is required when available',
            'availability.*.start_time.date_format' => 'Start time must be in HH:MM format',
            'availability.*.end_time.required_if' => 'End time is required when available',
            'availability.*.end_time.date_format' => 'End time must be in HH:MM format',
            'availability.*.end_time.after' => 'End time must be after start time',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $availability = $this->input('availability', []);

            foreach ($availability as $index => $dayAvailability) {
                if ($dayAvailability['is_available'] ?? false) {
                    $startTime = $dayAvailability['start_time'] ?? null;
                    $endTime = $dayAvailability['end_time'] ?? null;

                    if ($startTime && $endTime) {
                        $start = Carbon::createFromFormat('H:i', $startTime);
                        $end = Carbon::createFromFormat('H:i', $endTime);

                        // Check minimum duration (1 hour)
                        if ($end->diffInMinutes($start) < 60) {
                            $validator->errors()->add(
                                "availability.{$index}.end_time",
                                'The working period must be at least 1 hour'
                            );
                        }

                        // Check maximum duration (16 hours)
                        if ($end->diffInMinutes($start) > 960) {
                            $validator->errors()->add(
                                "availability.{$index}.end_time",
                                'The working period cannot exceed 16 hours'
                            );
                        }
                    }
                }
            }
        });
    }
}
