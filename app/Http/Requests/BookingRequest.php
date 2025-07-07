<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class BookingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'service_id' => 'required|exists:services,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'client_address' => 'required|string|max:1000',
            'client_notes' => 'nullable|string|max:1000',
            'client_location' => 'nullable|array',
            'client_location.lat' => 'required_with:client_location|numeric|between:-90,90',
            'client_location.lng' => 'required_with:client_location|numeric|between:-180,180',
            'request_quote' => 'boolean',
            'requirements' => 'nullable|string|max:1000',
        ];
    }

    public function messages()
    {
        return [
            'service_id.required' => 'Please select a service',
            'service_id.exists' => 'Selected service is invalid',
            'appointment_date.required' => 'Appointment date is required',
            'appointment_date.after_or_equal' => 'Appointment date cannot be in the past',
            'appointment_time.required' => 'Appointment time is required',
            'appointment_time.date_format' => 'Appointment time must be in HH:MM format',
            'client_address.required' => 'Service address is required',
            'client_address.max' => 'Address cannot exceed 1000 characters',
            'client_notes.max' => 'Notes cannot exceed 1000 characters',
            'client_location.lat.between' => 'Invalid latitude value',
            'client_location.lng.between' => 'Invalid longitude value',
            'requirements.max' => 'Requirements cannot exceed 1000 characters',
        ];
    }
}
