<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Configuration>
 */
class ConfigurationFactory extends Factory
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
            'name' => fake()->words(2, true).' Configuration',
            'is_completed' => false,
            'is_locked' => false,
            'last_position' => null,
        ];
    }
}
