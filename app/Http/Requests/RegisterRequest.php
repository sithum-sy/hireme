<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // Debug logging for validation
        Log::info('RegisterRequest validation preparation', [
            'has_profile_picture_file' => $this->hasFile('profile_picture'),
            'profile_picture_in_request' => $this->has('profile_picture'),
            'files' => $this->allFiles(),
            'all_data' => $this->all(),
        ]);
    }

    public function rules()
    {
        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:client,service_provider',
            'address' => 'required|string|max:1000',
            'contact_number' => 'required|string|max:20',
            'date_of_birth' => 'required|date|before:today|after:1900-01-01|before:' . now()->subYears(18)->format('Y-m-d'),
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        // Additional validation rules for service providers
        if ($this->role === 'service_provider') {
            $rules = array_merge($rules, [
                'business_name' => 'nullable|string|max:255',
                'business_license' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120', // 5MB
                'years_of_experience' => 'required|integer|min:0|max:50',
                'bio' => 'required|string|min:50|max:1000',
                'certifications.*' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
                'portfolio_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email address is required',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email address is already registered',
            'password.required' => 'Password is required',
            'password.confirmed' => 'Password confirmation does not match',
            'role.required' => 'Please select your role',
            'role.in' => 'Invalid role selected',
            'address.required' => 'Address is required',
            'contact_number.required' => 'Contact number is required',
            'date_of_birth.required' => 'Date of birth is required',
            'date_of_birth.date' => 'Please enter a valid date',
            'date_of_birth.before' => 'You must be at least 18 years old to register',
            'date_of_birth.after' => 'Please enter a valid date of birth',
            'profile_picture.image' => 'Profile picture must be an image',
            'profile_picture.mimes' => 'Profile picture must be a JPEG, PNG, JPG, or GIF',
            'profile_picture.max' => 'Profile picture must not exceed 2MB',

            // Service provider specific messages
            'business_license.mimes' => 'Business license must be PDF, DOC, DOCX, JPG, JPEG, or PNG',
            'business_license.max' => 'Business license file must not exceed 5MB',
            'years_of_experience.required' => 'Years of experience is required',
            'years_of_experience.integer' => 'Years of experience must be a number',
            'years_of_experience.min' => 'Years of experience cannot be negative',
            'years_of_experience.max' => 'Years of experience cannot exceed 50 years',
            'bio.required' => 'Professional bio is required',
            'bio.min' => 'Bio must be at least 50 characters',
            'bio.max' => 'Bio cannot exceed 1000 characters',
            'certifications.*.mimes' => 'Certification files must be PDF, DOC, DOCX, JPG, JPEG, or PNG',
            'certifications.*.max' => 'Each certification file must not exceed 5MB',
            'portfolio_images.*.image' => 'Portfolio files must be images',
            'portfolio_images.*.mimes' => 'Portfolio images must be JPEG, PNG, JPG, or GIF',
            'portfolio_images.*.max' => 'Each portfolio image must not exceed 2MB',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes()
    {
        return [
            // 'service_categories.*' => 'service category',
            'certifications.*' => 'certification file',
            'portfolio_images.*' => 'portfolio image',
        ];
    }
}
