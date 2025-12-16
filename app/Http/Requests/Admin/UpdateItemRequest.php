<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
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
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'additional_cost' => ['required', 'numeric', 'min:0'],
            'requires_quantity' => ['boolean'],
            'consultation_required' => ['boolean'],
            'is_standard' => ['boolean'],
            'hidden_until' => ['nullable', 'date'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:2048'],
            'variations' => ['nullable', 'array'],
            'variations.*.type' => ['required', 'in:size,color'],
            'variations.*.name' => ['required', 'string', 'max:255'],
            'variations.*.surcharge' => ['required', 'numeric', 'min:0'],
            'price_tables' => ['nullable', 'array'],
            'price_tables.*.price_table_id' => ['required', 'exists:price_tables,id'],
            'price_tables.*.additional_cost' => ['required', 'numeric', 'min:0'],
        ];
    }
}
