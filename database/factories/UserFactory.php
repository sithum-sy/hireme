<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\ProviderProfile;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => $this->faker->optional(0.8)->dateTimeThisYear(),
            'password' => bcrypt('password123'), // Default password for testing
            'role' => $this->faker->randomElement(['client', 'service_provider']),
            'address' => $this->faker->address(),
            'contact_number' => $this->faker->phoneNumber(),
            'date_of_birth' => $this->faker->date('Y-m-d', '-18 years'), // At least 18 years old
            'profile_picture' => $this->faker->optional(0.3)->randomElement([
                'profile_pictures/sample1.jpg',
                'profile_pictures/sample2.jpg',
                'profile_pictures/sample3.jpg',
            ]),
            'is_active' => $this->faker->boolean(95), // 95% chance of being active
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a client user.
     */
    public function client(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'client',
        ]);
    }

    /**
     * Create a service provider user with provider profile.
     */
    public function serviceProvider(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'service_provider',
        ])->afterCreating(function (User $user) {
            // Automatically create a provider profile when creating a service provider
            ProviderProfile::factory()->create([
                'user_id' => $user->id,
            ]);
        });
    }

    /**
     * Create a verified service provider.
     */
    public function verifiedServiceProvider(): static
    {
        return $this->serviceProvider()->afterCreating(function (User $user) {
            // Update the provider profile to be verified
            $user->providerProfile->update([
                'verification_status' => 'verified',
                'verified_at' => now(),
                'average_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
                'total_reviews' => $this->faker->numberBetween(5, 50),
            ]);
        });
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'admin',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Create a staff user.
     */
    public function staff(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => 'staff',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Create an active user.
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Create an inactive user.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a user with a profile picture.
     */
    public function withProfilePicture(): static
    {
        return $this->state(fn(array $attributes) => [
            'profile_picture' => 'profile_pictures/' . $this->faker->uuid() . '.jpg',
        ]);
    }

    /**
     * Create a user with specific credentials for testing.
     */
    public function withCredentials(string $email, string $password = 'password123'): static
    {
        return $this->state(fn(array $attributes) => [
            'email' => $email,
            'password' => bcrypt($password),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Create a user with a specific role and email.
     */
    public function roleWithEmail(string $role, string $email): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => $role,
            'email' => $email,
            'password' => bcrypt('password123'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Create a young adult user (18-25 years old).
     */
    public function youngAdult(): static
    {
        return $this->state(fn(array $attributes) => [
            'date_of_birth' => $this->faker->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Create a middle-aged user (26-50 years old).
     */
    public function middleAged(): static
    {
        return $this->state(fn(array $attributes) => [
            'date_of_birth' => $this->faker->dateTimeBetween('-50 years', '-26 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Create a senior user (51+ years old).
     */
    public function senior(): static
    {
        return $this->state(fn(array $attributes) => [
            'date_of_birth' => $this->faker->dateTimeBetween('-80 years', '-51 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (User $user) {
            // Set default profile picture path if none provided
            if (!$user->profile_picture && $this->faker->boolean(30)) {
                $user->profile_picture = 'profile_pictures/default-' . $user->role . '.jpg';
            }
        })->afterCreating(function (User $user) {
            // Log user creation in development
            if (app()->environment('local')) {
                \Log::info("Created user: {$user->email} ({$user->role})");
            }
        });
    }
}
