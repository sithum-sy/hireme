<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class BlockTimeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'reason' => 'nullable|string|max:255',
            'all_day' => 'boolean',
        ];
    }

    public function messages()
    {
        return [
            'start_date.required' => 'Start date is required',
            'start_date.date' => 'Start date must be a valid date',
            'start_date.after_or_equal' => 'Start date cannot be in the past',
            'end_date.required' => 'End date is required',
            'end_date.date' => 'End date must be a valid date',
            'end_date.after_or_equal' => 'End date must be after or equal to start date',
            'start_time.date_format' => 'Start time must be in HH:MM format',
            'end_time.date_format' => 'End time must be in HH:MM format',
            'end_time.after' => 'End time must be after start time',
            'reason.string' => 'Reason must be text',
            'reason.max' => 'Reason cannot exceed 255 characters',
            'all_day.boolean' => 'All day must be true or false',
        ];
    }
    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');
            $startTime = $this->input('start_time');
            $endTime = $this->input('end_time');
            $allDay = $this->boolean('all_day');

            // If not all day, validate time range
            if (!$allDay && $startTime && $endTime) {
                // If same date, ensure time range is valid
                if ($startDate === $endDate) {
                    $start = Carbon::createFromFormat('H:i', $startTime);
                    $end = Carbon::createFromFormat('H:i', $endTime);

                    if ($end->diffInMinutes($start) < 30) {
                        $validator->errors()->add(
                            'end_time',
                            'The blocked period must be at least 30 minutes'
                        );
                    }
                }
            }

            // Check if date range is reasonable (not more than 365 days)
            if ($startDate && $endDate) {
                $start = Carbon::parse($startDate);
                $end = Carbon::parse($endDate);

                if ($end->diffInDays($start) > 365) {
                    $validator->errors()->add(
                        'end_date',
                        'The blocked period cannot exceed 365 days'
                    );
                }
            }
        });
    }
}
