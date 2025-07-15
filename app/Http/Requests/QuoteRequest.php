<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuoteRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'appointment_id' => 'sometimes|exists:appointments,id',
            'client_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'client_requirements' => 'nullable|string|max:1000',
            'quoted_price' => 'required|numeric|min:0|max:99999.99',
            'duration_hours' => 'required|numeric|min:1|max:24',
            'quote_details' => 'required|string|max:2000',
            'terms_and_conditions' => 'nullable|string|max:1000',
            'valid_until' => 'required|date|after:now',
        ];
    }

    public function messages()
    {
        return [
            'client_id.required' => 'Client is required',
            'client_id.exists' => 'Selected client is invalid',
            'service_id.required' => 'Service is required',
            'service_id.exists' => 'Selected service is invalid',
            'title.required' => 'Quote title is required',
            'description.required' => 'Quote description is required',
            'quoted_price.required' => 'Quoted price is required',
            'quoted_price.numeric' => 'Quoted price must be a valid number',
            'quoted_price.min' => 'Quoted price cannot be negative',
            'quoted_price.max' => 'Quoted price cannot exceed $99,999.99',
            'duration_hours.required' => 'Duration is required',
            'duration_hours.numeric' => 'Duration must be a valid number',
            'duration_hours.min' => 'Minimum duration is 1 hour',
            'duration_hours.max' => 'Maximum duration is 24 hours',
            'quote_details.required' => 'Quote details are required',
            'valid_until.required' => 'Quote validity period is required',
            'valid_until.after' => 'Quote validity must be in the future',
        ];
    }
}
