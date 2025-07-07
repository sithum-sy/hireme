<?php

namespace Database\Factories;

use App\Models\ProviderProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProviderProfile>
 */
class ProviderProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = ProviderProfile::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'business_name' => $this->faker->company(),
            'business_license' => 'licenses/' . $this->faker->uuid() . '.pdf',
            'years_of_experience' => $this->faker->numberBetween(1, 20),
            'service_area_radius' => $this->faker->numberBetween(5, 50),
            'bio' => $this->faker->paragraph(3),
            'certifications' => [
                'certifications/' . $this->faker->uuid() . '.pdf',
                'certifications/' . $this->faker->uuid() . '.pdf',
            ],
            'portfolio_images' => [
                'portfolio/' . $this->faker->uuid() . '.jpg',
                'portfolio/' . $this->faker->uuid() . '.jpg',
                'portfolio/' . $this->faker->uuid() . '.jpg',
            ],
            'verification_status' => $this->faker->randomElement(['pending', 'verified', 'rejected']),
            'verification_notes' => $this->faker->optional()->sentence(),
            'average_rating' => $this->faker->randomFloat(2, 3.0, 5.0),
            'total_reviews' => $this->faker->numberBetween(0, 100),
            'total_earnings' => $this->faker->randomFloat(2, 0, 10000),
            'is_available' => $this->faker->boolean(80), // 80% chance of being available
            'verified_at' => $this->faker->optional(0.7)->dateTimeThisYear(),
        ];
    }

    public function verified()
    {
        return $this->state(function (array $attributes) {
            return [
                'verification_status' => 'verified',
                'verified_at' => $this->faker->dateTimeThisYear(),
            ];
        });
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'verification_status' => 'pending',
                'verified_at' => null,
            ];
        });
    }

    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'verification_status' => 'rejected',
                'verified_at' => null,
                'verification_notes' => 'Documentation incomplete or invalid.',
            ];
        });
    }

    public function highRated()
    {
        return $this->state(function (array $attributes) {
            return [
                'average_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
                'total_reviews' => $this->faker->numberBetween(20, 100),
            ];
        });
    }
}
