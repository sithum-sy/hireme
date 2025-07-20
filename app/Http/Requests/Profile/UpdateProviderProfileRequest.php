<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProviderProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'service_provider';
    }

    public function rules(): array
    {
        $rules = [];

        // Include base profile rules
        $baseRequest = new UpdateProfileRequest();
        $baseRequest->setUserResolver($this->getUserResolver());
        $rules = array_merge($rules, $baseRequest->rules());

        // Provider-specific rules
        if ($this->has('business_name')) {
            $rules['business_name'] = ['nullable', 'string', 'max:255'];
        }

        if ($this->has('bio')) {
            $rules['bio'] = ['required', 'string', 'min:50', 'max:1000'];
        }

        if ($this->has('years_of_experience')) {
            $rules['years_of_experience'] = ['required', 'integer', 'min:0', 'max:50'];
        }

        if ($this->has('service_area_radius')) {
            $rules['service_area_radius'] = ['required', 'integer', 'min:1', 'max:100'];
        }

        if ($this->has('is_available')) {
            $rules['is_available'] = ['boolean'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return array_merge(
            (new UpdateProfileRequest())->messages(),
            [
                'business_name.max' => 'Business name must not exceed 255 characters.',
                'bio.required' => 'Professional bio is required.',
                'bio.min' => 'Professional bio must be at least 50 characters.',
                'bio.max' => 'Professional bio must not exceed 1000 characters.',
                'years_of_experience.required' => 'Years of experience is required.',
                'years_of_experience.integer' => 'Years of experience must be a number.',
                'years_of_experience.min' => 'Years of experience cannot be negative.',
                'years_of_experience.max' => 'Years of experience cannot exceed 50.',
                'service_area_radius.required' => 'Service area radius is required.',
                'service_area_radius.integer' => 'Service area radius must be a number.',
                'service_area_radius.min' => 'Service area radius must be at least 1 km.',
                'service_area_radius.max' => 'Service area radius cannot exceed 100 km.',
            ]
        );
    }
}
