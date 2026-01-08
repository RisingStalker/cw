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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Transform variations data to ensure nested arrays are properly structured
        // When using FormData, Inertia sends nested arrays as JSON strings
        $variationsInput = $this->input('variations');
        
        // Log raw input for debugging
        \Log::info('UpdateItemRequest - Raw variations input', [
            'type' => gettype($variationsInput),
            'is_string' => is_string($variationsInput),
            'is_array' => is_array($variationsInput),
            'value' => is_string($variationsInput) ? substr($variationsInput, 0, 200) : $variationsInput,
        ]);
        
        // If variations is a JSON string, decode it
        if (is_string($variationsInput)) {
            $variationsInput = json_decode($variationsInput, true);
        }
        
        if (is_array($variationsInput)) {
            $variations = [];
            foreach ($variationsInput as $index => $variation) {
                // If variation itself is a JSON string, decode it
                if (is_string($variation)) {
                    $variation = json_decode($variation, true);
                }
                
                if (!is_array($variation)) {
                    continue;
                }
                
                $variationData = [
                    'type' => $variation['type'] ?? null,
                    'name' => $variation['name'] ?? null,
                    'surcharge' => $variation['surcharge'] ?? null,
                    'short_text' => $variation['short_text'] ?? null,
                    'existing_image_path' => $variation['existing_image_path'] ?? null,
                ];
                
                // Handle price_tables nested array - try multiple methods
                $priceTables = null;
                
                // Method 1: Direct access from variation array
                if (isset($variation['price_tables'])) {
                    $priceTables = $variation['price_tables'];
                }
                
                // Method 2: Try dot notation from request
                if (empty($priceTables) || !is_array($priceTables)) {
                    $priceTables = $this->input("variations.{$index}.price_tables");
                }
                
                // Method 3: Try bracket notation (FormData format: variations[0][price_tables])
                if (empty($priceTables) || !is_array($priceTables)) {
                    $allData = $this->all();
                    if (isset($allData["variations"][$index]["price_tables"])) {
                        $priceTables = $allData["variations"][$index]["price_tables"];
                    }
                }
                
                // Method 4: Try accessing raw request data with bracket notation
                if (empty($priceTables) || !is_array($priceTables)) {
                    $rawData = $this->getContent();
                    if (!empty($rawData)) {
                        $parsed = json_decode($rawData, true);
                        if (isset($parsed["variations"][$index]["price_tables"])) {
                            $priceTables = $parsed["variations"][$index]["price_tables"];
                        }
                    }
                }
                
                // Method 5: Try parsing flattened FormData format (variations[0][price_tables][0][price_table_id])
                if (empty($priceTables) || !is_array($priceTables)) {
                    $allInputs = $this->all();
                    $priceTablesArray = [];
                    $keyPattern = "variations.{$index}.price_tables";
                    
                    // Look for keys like variations[0][price_tables][0][price_table_id]
                    foreach ($allInputs as $key => $value) {
                        if (preg_match('/^variations\[(\d+)\]\[price_tables\]\[(\d+)\]\[price_table_id\]$/', $key, $matches)) {
                            $varIndex = (int)$matches[1];
                            $ptIndex = (int)$matches[2];
                            if ($varIndex === $index) {
                                if (!isset($priceTablesArray[$ptIndex])) {
                                    $priceTablesArray[$ptIndex] = [];
                                }
                                $priceTablesArray[$ptIndex]['price_table_id'] = $value;
                            }
                        }
                        if (preg_match('/^variations\[(\d+)\]\[price_tables\]\[(\d+)\]\[surcharge\]$/', $key, $matches)) {
                            $varIndex = (int)$matches[1];
                            $ptIndex = (int)$matches[2];
                            if ($varIndex === $index) {
                                if (!isset($priceTablesArray[$ptIndex])) {
                                    $priceTablesArray[$ptIndex] = [];
                                }
                                $priceTablesArray[$ptIndex]['surcharge'] = $value;
                            }
                        }
                    }
                    
                    if (!empty($priceTablesArray)) {
                        $priceTables = array_values($priceTablesArray);
                    }
                }
                
                // If price_tables is a JSON string, decode it
                if (is_string($priceTables)) {
                    $priceTables = json_decode($priceTables, true);
                }
                
                \Log::info("UpdateItemRequest - Price tables for variation {$index}", [
                    'price_tables' => $priceTables,
                    'is_array' => is_array($priceTables),
                    'count' => is_array($priceTables) ? count($priceTables) : 0,
                ]);
                
                if (is_array($priceTables)) {
                    // Filter out empty entries (where price_table_id is empty)
                    $variationData['price_tables'] = array_values(array_filter($priceTables, function($pt) {
                        return !empty($pt['price_table_id'] ?? null);
                    }));
                } else {
                    $variationData['price_tables'] = [];
                }
                
                $variations[] = $variationData;
            }
            
            \Log::info('UpdateItemRequest - Processed variations', [
                'count' => count($variations),
                'variations' => $variations,
            ]);
            
            $this->merge(['variations' => $variations]);
        }
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
            'variations.*.image' => ['nullable', 'image', 'max:2048'],
            'variations.*.existing_image_path' => ['nullable', 'string'],
            'variations.*.short_text' => ['nullable', 'string', 'max:1000'],
            'variations.*.price_tables' => ['nullable', 'array'],
            'variations.*.price_tables.*.price_table_id' => ['nullable', 'exists:price_tables,id'],
            'variations.*.price_tables.*.surcharge' => ['nullable', 'numeric', 'min:0'],
            'price_tables' => ['nullable', 'array'],
            'price_tables.*.price_table_id' => ['required', 'exists:price_tables,id'],
            'price_tables.*.additional_cost' => ['required', 'numeric', 'min:0'],
        ];
    }
}
