<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectBathroom>
 */
class ProjectBathroomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'construction_project_id' => \App\Models\ConstructionProject::factory(),
            'room_number' => fake()->numberBetween(1, 3),
            'has_toilet' => true,
            'has_shower' => fake()->boolean(),
            'has_bathtub' => fake()->boolean(),
        ];
    }
}
