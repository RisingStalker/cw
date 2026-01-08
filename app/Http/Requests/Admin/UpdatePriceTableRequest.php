<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePriceTableRequest extends FormRequest
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
        $priceTable = $this->route('price_table');
        $priceTableId = $priceTable instanceof \App\Models\PriceTable ? $priceTable->id : $priceTable;
        
        return [
            'year' => ['required', 'integer', 'min:2000', 'max:2100', 'unique:price_tables,year,'.$priceTableId],
            'is_active' => ['boolean'],
        ];
    }
}
