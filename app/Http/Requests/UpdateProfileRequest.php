<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Http\Requests\Traits\RoleBasedValidation;

class UpdateProfileRequest extends FormRequest
{
    use RoleBasedValidation;

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $userId = auth()->id();

        $allRules = [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($userId)
            ],
            'address' => 'sometimes|nullable|string|max:1000',
            'contact_number' => 'sometimes|nullable|string|max:20',
            'date_of_birth' => 'sometimes|nullable|date|before:today|after:1900-01-01',
            'profile_picture' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        // Filter rules based on user role
        return $this->filterRulesByRole($allRules);
    }

    public function messages()
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email address is required',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email address is already taken',
            'address.required' => 'Address is required',
            'contact_number.required' => 'Contact number is required',
            'date_of_birth.required' => 'Date of birth is required',
            'date_of_birth.before' => 'Date of birth must be before today',
            'profile_picture.image' => 'Profile picture must be an image',
            'profile_picture.mimes' => 'Profile picture must be JPEG, PNG, JPG, or GIF',
            'profile_picture.max' => 'Profile picture must not exceed 2MB',
        ];
    }

    /**
     * Get custom attributes for validation errors
     */
    public function attributes()
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'contact_number' => 'phone number',
            'date_of_birth' => 'date of birth',
            'profile_picture' => 'profile picture',
        ];
    }

    /**
     * Handle a failed validation attempt
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $response = response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
            'role_restrictions' => $this->getRoleBasedRules()
        ], 422);

        throw new \Illuminate\Validation\ValidationException($validator, $response);
    }
}
