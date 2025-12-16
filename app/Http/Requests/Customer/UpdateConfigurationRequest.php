<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConfigurationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'last_position' => ['nullable', 'array'],
            'items' => ['nullable', 'array'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.item_variation_id' => ['nullable', 'exists:item_variations,id'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'items.*.project_room_id' => ['nullable', 'exists:project_rooms,id'],
            'items.*.project_bathroom_id' => ['nullable', 'exists:project_bathrooms,id'],
        ];
    }
}
