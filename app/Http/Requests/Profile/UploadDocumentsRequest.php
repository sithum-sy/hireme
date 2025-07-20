<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'service_provider';
    }

    public function rules(): array
    {
        $rules = [];

        if ($this->hasFile('business_license')) {
            $rules['business_license'] = [
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:5120' // 5MB
            ];
        }

        if ($this->hasFile('certifications')) {
            $rules['certifications'] = ['array', 'max:5'];
            $rules['certifications.*'] = [
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:5120'
            ];
        }

        if ($this->hasFile('portfolio_images')) {
            $rules['portfolio_images'] = ['array', 'max:10'];
            $rules['portfolio_images.*'] = [
                'image',
                'mimes:jpg,jpeg,png,gif',
                'max:2048', // 2MB
                'dimensions:min_width=300,min_height=300,max_width=3000,max_height=3000'
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'business_license.mimes' => 'Business license must be a PDF, DOC, DOCX, JPG, JPEG, or PNG file.',
            'business_license.max' => 'Business license must not be larger than 5MB.',
            'certifications.max' => 'You can upload maximum 5 certification files.',
            'certifications.*.mimes' => 'Each certification must be a PDF, DOC, DOCX, JPG, JPEG, or PNG file.',
            'certifications.*.max' => 'Each certification file must not be larger than 5MB.',
            'portfolio_images.max' => 'You can upload maximum 10 portfolio images.',
            'portfolio_images.*.image' => 'Portfolio files must be images.',
            'portfolio_images.*.mimes' => 'Portfolio images must be JPG, JPEG, PNG, or GIF files.',
            'portfolio_images.*.max' => 'Each portfolio image must not be larger than 2MB.',
            'portfolio_images.*.dimensions' => 'Portfolio images must be between 300x300 and 3000x3000 pixels.',
        ];
    }
}
