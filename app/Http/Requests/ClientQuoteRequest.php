<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientQuoteRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'service_id' => 'required|exists:services,id',
            'provider_id' => 'required|exists:users,id',
            'message' => 'required|string|max:2000',
            'requested_date' => 'nullable|date|after_or_equal:today',
            'requested_time' => 'nullable|date_format:H:i',
            'location_type' => 'required|in:client_address,provider_location,custom_location',
            'address' => 'required_if:location_type,client_address,custom_location|string|max:500',
            'city' => 'required_if:location_type,client_address,custom_location|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'contact_preference' => 'nullable|in:phone,message',
            'special_requirements' => 'nullable|string|max:1000',
            'urgency' => 'nullable|in:normal,urgent,emergency',
            'quote_type' => 'nullable|string|max:50',
        ];
    }

    public function messages()
    {
        return [
            'service_id.required' => 'Service selection is required',
            'provider_id.required' => 'Provider selection is required',
            'message.required' => 'Please describe your requirements',
            'message.max' => 'Requirements description cannot exceed 2000 characters',
            'address.required_if' => 'Address is required for selected location type',
            'city.required_if' => 'City is required for selected location type',
            'location_type.required' => 'Please select a service location',
            'location_type.in' => 'Invalid location type selected',
            'contact_preference.in' => 'Invalid contact preference',
            'urgency.in' => 'Invalid urgency level',
            'requested_date.after_or_equal' => 'Requested date cannot be in the past',
            'requested_time.date_format' => 'Time must be in HH:MM format',
        ];
    }

    protected function prepareForValidation()
    {
        // Ensure at least one contact method is provided
        if (!$this->phone && !$this->email) {
            $this->merge([
                'contact_validation_error' => true
            ]);
        }
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (!$this->phone && !$this->email) {
                $validator->errors()->add('contact', 'Either phone number or email is required');
            }
        });
    }
}
