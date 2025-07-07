<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProviderProfileRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'business_name' => 'sometimes|nullable|string|max:255',
            'years_of_experience' => 'sometimes|required|integer|min:0|max:50',
            'service_area_radius' => 'sometimes|required|integer|min:1|max:100',
            'bio' => 'sometimes|required|string|min:50|max:1000',
            'business_license' => 'sometimes|nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
            'certifications' => 'sometimes|nullable|array|max:5',
            'certifications.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
            'portfolio_images' => 'sometimes|nullable|array|max:10',
            'portfolio_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'sometimes|boolean',
        ];
    }

    public function messages()
    {
        return [
            'years_of_experience.required' => 'Years of experience is required',
            'years_of_experience.integer' => 'Years of experience must be a number',
            'years_of_experience.min' => 'Years of experience cannot be negative',
            'years_of_experience.max' => 'Years of experience cannot exceed 50 years',
            'service_area_radius.required' => 'Service area radius is required',
            'service_area_radius.integer' => 'Service area radius must be a number',
            'service_area_radius.min' => 'Service area radius must be at least 1 km',
            'service_area_radius.max' => 'Service area radius cannot exceed 100 km',
            'bio.required' => 'Professional bio is required',
            'bio.min' => 'Bio must be at least 50 characters',
            'bio.max' => 'Bio cannot exceed 1000 characters',
            'business_license.mimes' => 'Business license must be PDF, DOC, DOCX, JPG, JPEG, or PNG',
            'business_license.max' => 'Business license file must not exceed 5MB',
            'certifications.max' => 'You can upload maximum 5 certification files',
            'certifications.*.mimes' => 'Certification files must be PDF, DOC, DOCX, JPG, JPEG, or PNG',
            'certifications.*.max' => 'Each certification file must not exceed 5MB',
            'portfolio_images.max' => 'You can upload maximum 10 portfolio images',
            'portfolio_images.*.image' => 'Portfolio files must be images',
            'portfolio_images.*.mimes' => 'Portfolio images must be JPEG, PNG, JPG, or GIF',
            'portfolio_images.*.max' => 'Each portfolio image must not exceed 2MB',
        ];
    }
}
