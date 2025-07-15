<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        return true; // Authorization handled in controller
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules()
    {
        return [
            'payment_method' => 'required|in:stripe,cash',
            'amount' => 'required|numeric|min:0.01',

            // Stripe-specific fields
            'stripe_payment_method_id' => 'required_if:payment_method,stripe|string',
            'save_payment_method' => 'nullable|boolean',

            // Cash payment fields
            'notes' => 'nullable|string|max:500',

            // Common fields
            'currency' => 'nullable|string|size:3|in:LKR,USD',
            'return_url' => 'nullable|url'
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages()
    {
        return [
            'payment_method.required' => 'Please select a payment method',
            'payment_method.in' => 'Invalid payment method selected',
            'amount.required' => 'Payment amount is required',
            'amount.numeric' => 'Payment amount must be a valid number',
            'amount.min' => 'Payment amount must be greater than zero',
            'stripe_payment_method_id.required_if' => 'Payment method details are required for card payments',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes()
    {
        return [
            'stripe_payment_method_id' => 'payment method',
            'amount' => 'payment amount',
        ];
    }
}
