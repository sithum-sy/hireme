<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $serviceId = $this->route('service');

        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:50|max:2000',
            'category_id' => 'required|exists:service_categories,id',
            'pricing_type' => 'required|in:hourly,fixed,custom',
            'base_price' => 'required|numeric|min:0|max:99999.99',
            'duration_hours' => 'required|numeric|min:0.5|max:24',
            'requirements' => 'nullable|string|max:1000',
            'includes' => 'required|string|max:1000',
            'service_areas' => 'required|array|min:1',
            'service_areas.*' => 'string|max:100',
            'service_images' => 'nullable|array|max:5',
            'service_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'sometimes|boolean',

            // Custom pricing validation
            'custom_pricing_description' => 'required_if:pricing_type,custom|nullable|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Service title is required',
            'title.max' => 'Service title cannot exceed 255 characters',
            'description.required' => 'Service description is required',
            'description.min' => 'Service description must be at least 50 characters',
            'description.max' => 'Service description cannot exceed 2000 characters',
            'category_id.required' => 'Please select a service category',
            'category_id.exists' => 'Selected service category is invalid',
            'pricing_type.required' => 'Please select a pricing type',
            'pricing_type.in' => 'Invalid pricing type selected',
            'base_price.required' => 'Base price is required',
            'base_price.numeric' => 'Base price must be a valid number',
            'base_price.min' => 'Base price cannot be negative',
            'base_price.max' => 'Base price cannot exceed $99,999.99',
            'duration_hours.required' => 'Duration is required',
            'duration_hours.numeric' => 'Duration must be a valid number',
            'duration_hours.min' => 'Minimum duration is 0.5 hours',
            'duration_hours.max' => 'Maximum duration is 24 hours',
            'includes.required' => 'Please specify what is included in this service',
            'includes.max' => 'Service includes cannot exceed 1000 characters',
            'requirements.max' => 'Requirements cannot exceed 1000 characters',
            'service_areas.required' => 'Please specify at least one service area',
            'service_areas.min' => 'Please specify at least one service area',
            'service_areas.*.max' => 'Each service area cannot exceed 100 characters',
            'service_images.max' => 'You can upload maximum 5 images',
            'service_images.*.image' => 'Service images must be valid image files',
            'service_images.*.mimes' => 'Service images must be JPEG, PNG, JPG, or GIF',
            'service_images.*.max' => 'Each service image must not exceed 2MB',
            'custom_pricing_description.required_if' => 'Custom pricing description is required when using custom pricing',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes()
    {
        return [
            'service_areas.*' => 'service area',
            'service_images.*' => 'service image',
        ];
    }
}
