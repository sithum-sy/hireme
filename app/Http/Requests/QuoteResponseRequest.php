<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuoteResponseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'action' => 'required|in:accept,reject',
            'notes' => 'nullable|string|max:500',
            'appointment_date' => 'required_if:action,accept|nullable|date|after_or_equal:today',
            'appointment_time' => 'required_if:action,accept|nullable|date_format:H:i',
        ];
    }

    public function messages()
    {
        return [
            'action.required' => 'Please specify whether to accept or reject the quote',
            'action.in' => 'Invalid action. Must be accept or reject',
            'appointment_date.required_if' => 'Appointment date is required when accepting quote',
            'appointment_date.after_or_equal' => 'Appointment date cannot be in the past',
            'appointment_time.required_if' => 'Appointment time is required when accepting quote',
            'appointment_time.date_format' => 'Appointment time must be in HH:MM format',
            'notes.max' => 'Notes cannot exceed 500 characters',
        ];
    }
}
