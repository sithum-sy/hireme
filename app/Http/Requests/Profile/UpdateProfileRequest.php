<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();
        $rules = [];

        // Base rules for all users
        if ($this->has('first_name')) {
            $rules['first_name'] = ['required', 'string', 'max:255'];
        }

        if ($this->has('last_name')) {
            $rules['last_name'] = ['required', 'string', 'max:255'];
        }

        if ($this->has('email')) {
            $rules['email'] = [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ];
        }

        if ($this->has('contact_number')) {
            $rules['contact_number'] = ['nullable', 'string', 'max:20'];
        }

        if ($this->has('address')) {
            $rules['address'] = ['nullable', 'string', 'max:1000'];
        }

        if ($this->has('date_of_birth')) {
            $rules['date_of_birth'] = ['nullable', 'date', 'before:today'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'first_name.max' => 'First name must not exceed 255 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.max' => 'Last name must not exceed 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already in use.',
            'contact_number.max' => 'Phone number must not exceed 20 characters.',
            'address.max' => 'Address must not exceed 1000 characters.',
            'date_of_birth.date' => 'Please enter a valid date.',
            'date_of_birth.before' => 'Date of birth must be before today.',
        ];
    }
}
