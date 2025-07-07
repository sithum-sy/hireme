<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Appointment::class;

    public function definition()
    {
        $appointmentDate = $this->faker->dateTimeBetween('now', '+30 days');
        $status = $this->faker->randomElement([
            'pending',
            'confirmed',
            'in_progress',
            'completed',
            'cancelled_by_client',
            'cancelled_by_provider'
        ]);

        return [
            'client_id' => User::factory()->create(['role' => 'client'])->id,
            'provider_id' => User::factory()->create(['role' => 'service_provider'])->id,
            'service_id' => Service::factory(),
            'appointment_date' => $appointmentDate->format('Y-m-d'),
            'appointment_time' => $this->faker->time('H:i:s'),
            'duration_hours' => $this->faker->randomElement([1, 1.5, 2, 3, 4]),
            'total_price' => $this->faker->randomFloat(2, 50, 300),
            'status' => $status,
            'client_address' => $this->faker->address(),
            'client_notes' => $this->faker->optional()->paragraph(),
            'provider_notes' => $this->faker->optional()->sentence(),
            'client_location' => [
                'lat' => $this->faker->latitude(),
                'lng' => $this->faker->longitude(),
            ],
            'client_rating' => $status === 'completed' ? $this->faker->randomFloat(1, 3.0, 5.0) : null,
            'client_review' => $status === 'completed' ? $this->faker->optional()->paragraph() : null,
            'provider_rating' => $status === 'completed' ? $this->faker->randomFloat(1, 3.0, 5.0) : null,
            'provider_review' => $status === 'completed' ? $this->faker->optional()->sentence() : null,
            'confirmed_at' => in_array($status, ['confirmed', 'in_progress', 'completed'])
                ? $this->faker->dateTimeBetween('-7 days', 'now') : null,
            'started_at' => in_array($status, ['in_progress', 'completed'])
                ? $appointmentDate : null,
            'completed_at' => $status === 'completed'
                ? $this->faker->dateTimeBetween($appointmentDate, 'now') : null,
            'cancelled_at' => str_contains($status, 'cancelled')
                ? $this->faker->dateTimeBetween('-7 days', 'now') : null,
        ];
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'confirmed_at' => null,
                'started_at' => null,
                'completed_at' => null,
                'cancelled_at' => null,
            ];
        });
    }

    public function confirmed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'confirmed',
                'confirmed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
                'started_at' => null,
                'completed_at' => null,
                'cancelled_at' => null,
            ];
        });
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            $completedAt = $this->faker->dateTimeBetween('-30 days', '-1 day');
            return [
                'status' => 'completed',
                'confirmed_at' => $this->faker->dateTimeBetween('-45 days', $completedAt),
                'started_at' => $completedAt,
                'completed_at' => $completedAt,
                'cancelled_at' => null,
                'client_rating' => $this->faker->randomFloat(1, 3.0, 5.0),
                'provider_rating' => $this->faker->randomFloat(1, 3.0, 5.0),
                'client_review' => $this->faker->paragraph(),
                'provider_review' => $this->faker->sentence(),
            ];
        });
    }

    public function upcoming()
    {
        return $this->state(function (array $attributes) {
            return [
                'appointment_date' => $this->faker->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
                'status' => $this->faker->randomElement(['pending', 'confirmed']),
            ];
        });
    }
}
