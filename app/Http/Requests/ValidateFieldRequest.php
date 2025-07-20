<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Requests\Traits\RoleBasedValidation;

class ValidateFieldRequest extends FormRequest
{
    use RoleBasedValidation;

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'field_name' => 'required|string',
            'field_value' => 'nullable',
        ];
    }

    public function messages()
    {
        return [
            'field_name.required' => 'Field name is required for validation',
        ];
    }
}
