<?php

namespace Database\Factories;

use App\Models\ProviderAvailability;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProviderAvailability>
 */
class ProviderAvailabilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = ProviderAvailability::class;

    public function definition()
    {
        $startHour = $this->faker->numberBetween(6, 14); // 6 AM to 2 PM
        $endHour = $this->faker->numberBetween($startHour + 2, 22); // At least 2 hours later, max 10 PM

        return [
            'provider_id' => User::factory()->create(['role' => 'service_provider'])->id,
            'day_of_week' => $this->faker->numberBetween(0, 6), // 0 = Sunday, 6 = Saturday
            'start_time' => sprintf('%02d:00:00', $startHour),
            'end_time' => sprintf('%02d:00:00', $endHour),
            'is_available' => $this->faker->boolean(90), // 90% chance of being available
        ];
    }

    public function weekday()
    {
        return $this->state(function (array $attributes) {
            return [
                'day_of_week' => $this->faker->numberBetween(1, 5), // Monday to Friday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
            ];
        });
    }

    public function weekend()
    {
        return $this->state(function (array $attributes) {
            return [
                'day_of_week' => $this->faker->randomElement([0, 6]), // Sunday or Saturday
                'start_time' => '10:00:00',
                'end_time' => '16:00:00',
            ];
        });
    }

    public function available()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_available' => true,
            ];
        });
    }

    public function unavailable()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_available' => false,
            ];
        });
    }
}
