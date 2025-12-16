<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ConstructionProject>
 */
class ConstructionProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => \App\Models\Customer::factory(),
            'name' => fake()->words(3, true).' Project',
            'facade_area' => fake()->randomFloat(2, 50, 500),
            'balcony_meters' => fake()->randomFloat(2, 0, 50),
            'interior_balustrade_meters' => fake()->randomFloat(2, 0, 100),
        ];
    }
}
