<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreConstructionProjectRequest extends FormRequest
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
        // Convert numeric strings to numbers
        if ($this->has('facade_area') && is_string($this->facade_area)) {
            $this->merge(['facade_area' => $this->facade_area !== '' ? (float) $this->facade_area : null]);
        }
        if ($this->has('balcony_meters') && is_string($this->balcony_meters)) {
            $this->merge(['balcony_meters' => $this->balcony_meters !== '' ? (float) $this->balcony_meters : null]);
        }
        if ($this->has('interior_balustrade_meters') && is_string($this->interior_balustrade_meters)) {
            $this->merge(['interior_balustrade_meters' => $this->interior_balustrade_meters !== '' ? (float) $this->interior_balustrade_meters : null]);
        }

        // Convert empty string to null for optional fields
        if ($this->has('manual_price_table_id') && $this->manual_price_table_id === '') {
            $this->merge(['manual_price_table_id' => null]);
        }

        // Transform rooms data
        if ($this->has('rooms') && is_array($this->rooms)) {
            $rooms = [];
            foreach ($this->rooms as $room) {
                $roomData = [
                    'name' => $room['name'] ?? '',
                    'floor_space' => isset($room['floor_space']) && $room['floor_space'] !== '' ? (float) $room['floor_space'] : null,
                    'prohibited_floors' => $this->parseProhibitedFloors($room['prohibited_floors'] ?? ''),
                ];
                $rooms[] = $roomData;
            }
            $this->merge(['rooms' => $rooms]);
        }

        // Transform bathrooms data and filter out empty ones
        if ($this->has('bathrooms') && is_array($this->bathrooms)) {
            $bathrooms = [];
            foreach ($this->bathrooms as $bathroom) {
                $roomNumber = isset($bathroom['room_number']) && $bathroom['room_number'] !== '' ? (int) $bathroom['room_number'] : null;

                // Only include bathrooms with a room number
                if ($roomNumber !== null) {
                    $bathroomData = [
                        'room_number' => $roomNumber,
                        'has_toilet' => (bool) ($bathroom['has_toilet'] ?? false),
                        'has_shower' => (bool) ($bathroom['has_shower'] ?? false),
                        'has_bathtub' => (bool) ($bathroom['has_bathtub'] ?? false),
                    ];
                    $bathrooms[] = $bathroomData;
                }
            }
            $this->merge(['bathrooms' => $bathrooms]);
        }
    }

    /**
     * Parse prohibited floors from string to array.
     */
    private function parseProhibitedFloors(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value) && $value !== '') {
            // Split by comma and filter out empty values, then convert to integers
            $floors = array_filter(array_map('trim', explode(',', $value)));

            return array_map('intval', $floors);
        }

        return [];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'name' => ['required', 'string', 'max:255'],
            'facade_area' => ['required', 'numeric', 'min:0'],
            'balcony_meters' => ['required', 'numeric', 'min:0'],
            'interior_balustrade_meters' => ['required', 'numeric', 'min:0'],
            'manual_price_table_id' => ['nullable', 'exists:price_tables,id'],
            'rooms' => ['required', 'array', 'min:1'],
            'rooms.*.name' => ['required', 'string', 'max:255'],
            'rooms.*.floor_space' => ['required', 'numeric', 'min:0'],
            'rooms.*.prohibited_floors' => ['nullable', 'array'],
            'bathrooms' => ['array'],
            'bathrooms.*.room_number' => ['required', 'integer', 'min:1'],
            'bathrooms.*.has_toilet' => ['boolean'],
            'bathrooms.*.has_shower' => ['boolean'],
            'bathrooms.*.has_bathtub' => ['boolean'],
        ];
    }
}
