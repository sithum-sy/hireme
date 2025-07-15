<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
            // Main review fields
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|min:10|max:1000',

            // Detailed rating breakdowns
            'quality_rating' => 'nullable|integer|min:1|max:5',
            'punctuality_rating' => 'nullable|integer|min:1|max:5',
            'communication_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',

            // Recommendation
            'would_recommend' => 'nullable|boolean',

            // Review images
            'review_images' => 'nullable|array|max:5',
            'review_images.*' => 'nullable|string|max:1000', // URLs or base64 strings

            // Additional fields
            'service_rating' => 'nullable|integer|min:1|max:5',
            'service_comment' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages()
    {
        return [
            'rating.required' => 'Please provide a rating for the service',
            'rating.integer' => 'Rating must be a whole number',
            'rating.min' => 'Rating must be at least 1 star',
            'rating.max' => 'Rating cannot exceed 5 stars',
            'comment.min' => 'Review comment must be at least 10 characters',
            'comment.max' => 'Review comment cannot exceed 1000 characters',
            'review_images.max' => 'You can upload a maximum of 5 images',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert string boolean values to actual booleans
        if ($this->has('would_recommend')) {
            $this->merge([
                'would_recommend' => filter_var($this->would_recommend, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }
    }
}
