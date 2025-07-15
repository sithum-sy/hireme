<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class ServiceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $serviceId = $this->route('service') ? $this->route('service')->id : null;

        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:50|max:2000',
            'category_id' => 'required|exists:service_categories,id',
            'pricing_type' => 'required|in:fixed,hourly,custom',
            'base_price' => 'required|numeric|min:0|max:99999.99',
            'duration_hours' => 'required|numeric|min:1|max:24',
            'custom_pricing_description' => 'nullable|string|max:500',

            // Location fields
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'location_address' => 'required|string|max:500',
            'location_city' => 'nullable|string|max:100',
            'location_neighborhood' => 'nullable|string|max:100',
            'service_radius' => 'required|integer|min:1|max:100',

            // Service areas (expecting JSON string)
            'service_areas' => 'required|array|min:1',
            'service_areas.*' => 'string|max:100',

            // Additional details
            'includes' => 'nullable|string|max:1000',
            'requirements' => 'nullable|string|max:1000',

            // Images
            'service_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'existing_images' => 'nullable|string', // JSON string of kept images
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Service title is required',
            'title.max' => 'Service title cannot exceed 255 characters',
            'description.required' => 'Service description is required',
            'description.min' => 'Description must be at least 50 characters',
            'description.max' => 'Description cannot exceed 2000 characters',
            'category_id.required' => 'Please select a service category',
            'category_id.exists' => 'Selected category is invalid',
            'base_price.required' => 'Service price is required',
            'base_price.numeric' => 'Price must be a valid number',
            'base_price.min' => 'Price cannot be negative',
            'base_price.max' => 'Price cannot exceed Rs. 99,999.99',
            'duration_hours.required' => 'Service duration is required',
            'duration_hours.min' => 'Minimum duration is 1 hour',
            'duration_hours.max' => 'Maximum duration is 24 hours',
            'latitude.required' => 'Service location is required',
            'longitude.required' => 'Service location is required',
            'location_address.required' => 'Service address is required',
            'service_radius.required' => 'Service radius is required',
            'service_areas.required' => 'Please select at least one service area',
            'service_areas.array' => 'Service areas must be a valid list',
            'service_areas.min' => 'Please select at least one service area',
            'service_areas.*.string' => 'Each service area must be a valid text',
            'service_areas.*.max' => 'Service area names cannot exceed 100 characters',
            'service_images.*.image' => 'Uploaded files must be images',
            'service_images.*.mimes' => 'Images must be JPEG, PNG, JPG, or GIF format',
            'service_images.*.max' => 'Each image must be less than 2MB',
        ];
    }

    // public function prepareForValidation()
    // {
    //     \Log::info('Service request validation data:', [
    //         'all_data' => $this->all(),
    //         'files' => $this->allFiles(),
    //         'method' => $this->method(),
    //     ]);

    //     // Decode service_areas if it's a JSON string
    //     if ($this->has('service_areas') && is_string($this->service_areas)) {
    //         $areas = json_decode($this->service_areas, true);
    //         if (is_array($areas)) {
    //             $this->merge(['service_areas_decoded' => $areas]);
    //         }
    //     }
    // }

    protected function prepareForValidation()
    {
        \Log::info('Service request validation data (BEFORE processing):', [
            'all_data' => $this->all(),
            'service_areas_raw' => $this->service_areas,
            'service_areas_type' => gettype($this->service_areas)
        ]);

        // Handle service_areas JSON string conversion
        if ($this->has('service_areas') && is_string($this->service_areas)) {
            try {
                $areas = json_decode($this->service_areas, true);
                if (is_array($areas) && json_last_error() === JSON_ERROR_NONE) {
                    $this->merge(['service_areas' => $areas]);
                    \Log::info('Successfully converted service_areas to array:', $areas);
                } else {
                    \Log::error('Failed to decode service_areas JSON:', [
                        'raw_value' => $this->service_areas,
                        'json_error' => json_last_error_msg()
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Exception while processing service_areas:', [
                    'error' => $e->getMessage(),
                    'raw_value' => $this->service_areas
                ]);
            }
        }

        // Ensure optional fields are present (convert null to empty string)
        $this->merge([
            'includes' => $this->includes ?? '',
            'requirements' => $this->requirements ?? '',
            'custom_pricing_description' => $this->custom_pricing_description ?: null,
            'location_city' => $this->location_city ?? null,
            'location_neighborhood' => $this->location_neighborhood ?? null,
        ]);

        \Log::info('Service request validation data (AFTER processing):', [
            'all_data' => $this->all(),
            'service_areas_processed' => $this->service_areas,
            'service_areas_type_after' => gettype($this->service_areas)
        ]);
    }

    // protected function prepareForValidation()
    // {
    //     // Decode service_areas if it's a JSON string
    //     if ($this->has('service_areas') && is_string($this->service_areas)) {
    //         $areas = json_decode($this->service_areas, true);
    //         if (is_array($areas)) {
    //             $this->merge(['service_areas_decoded' => $areas]);
    //         }
    //     }
    // }
}
