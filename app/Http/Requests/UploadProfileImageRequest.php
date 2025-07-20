<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfileImageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'profile_picture' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:2048', // 2MB
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'
            ]
        ];
    }

    public function messages()
    {
        return [
            'profile_picture.required' => 'Please select a profile picture',
            'profile_picture.image' => 'File must be an image',
            'profile_picture.mimes' => 'Profile picture must be JPEG, PNG, JPG, GIF, or WebP',
            'profile_picture.max' => 'Profile picture must not exceed 2MB',
            'profile_picture.dimensions' => 'Profile picture must be between 100x100 and 2000x2000 pixels',
        ];
    }
}
