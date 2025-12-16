<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => \App\Models\Category::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'additional_cost' => fake()->randomFloat(2, 10, 1000),
            'requires_quantity' => false,
            'consultation_required' => false,
            'is_standard' => false,
            'hidden_until' => null,
        ];
    }
}
