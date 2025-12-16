<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectRoom>
 */
class ProjectRoomFactory extends Factory
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
            'name' => fake()->randomElement(['Living Room', 'Bedroom', 'Kitchen', 'Dining Room']),
            'floor_space' => fake()->randomFloat(2, 10, 50),
            'prohibited_floors' => [],
        ];
    }
}
