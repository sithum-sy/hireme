<?php

namespace Database\Factories;

use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServiceCategory>
 */
class ServiceCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = ServiceCategory::class;

    public function definition()
    {
        $name = $this->faker->words(2, true);
        $icons = [
            'fas fa-broom',
            'fas fa-tools',
            'fas fa-bolt',
            'fas fa-graduation-cap',
            'fas fa-heart',
            'fas fa-paw',
            'fas fa-seedling',
            'fas fa-car',
            'fas fa-laptop-code',
            'fas fa-hammer',
            'fas fa-spa',
            'fas fa-calendar-alt'
        ];
        $colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'icon' => $this->faker->randomElement($icons),
            'color' => $this->faker->randomElement($colors),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }

    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }
}
