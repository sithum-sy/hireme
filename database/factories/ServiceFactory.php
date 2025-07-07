<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\User;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Service::class;

    public function definition()
    {
        $serviceTitles = [
            'Professional House Cleaning',
            'Deep Carpet Cleaning',
            'Plumbing Repair & Installation',
            'Emergency Plumbing Services',
            'Math Tutoring',
            'Piano Lessons',
            'Computer Repair',
            'Lawn Mowing Service',
            'Pet Sitting',
            'Elderly Care',
            'Event Photography',
            'Home Handyman Services'
        ];

        $areas = [
            'Downtown',
            'Uptown',
            'Midtown',
            'Westside',
            'Eastside',
            'North District',
            'South District',
            'City Center',
            'Suburbs'
        ];

        return [
            'provider_id' => User::factory()->create(['role' => 'service_provider'])->id,
            'category_id' => ServiceCategory::factory(),
            'title' => $this->faker->randomElement($serviceTitles),
            'description' => $this->faker->paragraph(4),
            'pricing_type' => $this->faker->randomElement(['hourly', 'fixed', 'custom']),
            'base_price' => $this->faker->randomFloat(2, 20, 200),
            'duration_hours' => $this->faker->randomElement([0.5, 1, 1.5, 2, 3, 4, 8]),
            'service_images' => [
                'services/' . $this->faker->uuid() . '.jpg',
                'services/' . $this->faker->uuid() . '.jpg',
            ],
            'requirements' => $this->faker->optional()->paragraph(),
            'includes' => $this->faker->paragraph(2),
            'service_areas' => $this->faker->randomElements($areas, $this->faker->numberBetween(1, 4)),
            'is_active' => $this->faker->boolean(85), // 85% chance of being active
            'views_count' => $this->faker->numberBetween(0, 500),
            'bookings_count' => $this->faker->numberBetween(0, 50),
            'average_rating' => $this->faker->randomFloat(2, 3.0, 5.0),
        ];
    }

    public function hourlyPricing()
    {
        return $this->state(function (array $attributes) {
            return [
                'pricing_type' => 'hourly',
                'base_price' => $this->faker->randomFloat(2, 15, 100),
                'duration_hours' => $this->faker->randomElement([1, 2, 3, 4]),
            ];
        });
    }

    public function fixedPricing()
    {
        return $this->state(function (array $attributes) {
            return [
                'pricing_type' => 'fixed',
                'base_price' => $this->faker->randomFloat(2, 50, 500),
                'duration_hours' => $this->faker->randomElement([1, 2, 4, 8]),
            ];
        });
    }

    public function popular()
    {
        return $this->state(function (array $attributes) {
            return [
                'views_count' => $this->faker->numberBetween(100, 1000),
                'bookings_count' => $this->faker->numberBetween(20, 100),
                'average_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            ];
        });
    }

    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }
}
