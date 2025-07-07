<?php

namespace Database\Factories;

use App\Models\BlockedTime;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlockedTimeFactory extends Factory
{
    protected $model = BlockedTime::class;

    public function definition()
    {
        $startDate = $this->faker->dateTimeBetween('now', '+30 days');
        $endDate = $this->faker->dateTimeBetween($startDate, $startDate->format('Y-m-d') . ' +7 days');
        $allDay = $this->faker->boolean(30);

        return [
            'provider_id' => User::factory()->create(['role' => 'service_provider'])->id,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'start_time' => $allDay ? null : $this->faker->time('H:i'),
            'end_time' => $allDay ? null : $this->faker->time('H:i'),
            'reason' => $this->faker->optional()->randomElement([
                'Vacation',
                'Sick leave',
                'Personal appointment',
                'Training',
                'Family time',
                'Maintenance'
            ]),
            'all_day' => $allDay,
        ];
    }

    public function allDay()
    {
        return $this->state(function (array $attributes) {
            return [
                'all_day' => true,
                'start_time' => null,
                'end_time' => null,
            ];
        });
    }

    public function vacation()
    {
        return $this->state(function (array $attributes) {
            return [
                'reason' => 'Vacation',
                'all_day' => true,
                'start_time' => null,
                'end_time' => null,
            ];
        });
    }

    public function today()
    {
        return $this->state(function (array $attributes) {
            return [
                'start_date' => now()->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
            ];
        });
    }
}
