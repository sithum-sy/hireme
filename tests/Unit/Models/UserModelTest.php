<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_user_with_hashed_password()
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
            'contact_number' => '+94771234567',
            'address' => '123 Main Street, Colombo',
            'is_active' => true
        ];

        $user = User::create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('John', $user->first_name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertEquals('client', $user->role);
    }

    /** @test */
    public function it_generates_correct_full_name_attribute()
    {
        $user = User::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'role' => 'client'
        ]);

        $this->assertEquals('Jane Smith', $user->full_name);
    }

    /** @test */
    public function it_calculates_age_correctly_from_date_of_birth()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'date_of_birth' => now()->subYears(25)->format('Y-m-d')
        ]);

        $this->assertEquals(25, $user->age);
    }

    /** @test */
    public function it_identifies_admin_created_users()
    {
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $user = User::create([
            'first_name' => 'Regular',
            'last_name' => 'User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'created_by' => $admin->id
        ]);

        $this->assertTrue($user->wasCreatedByAdmin());
    }

    /** @test */
    public function service_provider_has_provider_profile_relationship()
    {
        $provider = User::create([
            'first_name' => 'Provider',
            'last_name' => 'User',
            'email' => 'provider@example.com',
            'password' => Hash::make('password'),
            'role' => 'service_provider'
        ]);

        $profile = ProviderProfile::create([
            'user_id' => $provider->id,
            'business_name' => 'Test Business',
            'years_of_experience' => 5,
            'service_area_radius' => 10,
            'verification_status' => 'pending'
        ]);

        $this->assertInstanceOf(ProviderProfile::class, $provider->providerProfile);
        $this->assertEquals($profile->id, $provider->providerProfile->id);
    }

    /** @test */
    public function it_updates_last_login_timestamp()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'client'
        ]);

        $this->assertNull($user->last_login_at);

        $user->updateLastLogin();

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    /** @test */
    public function it_verifies_email_correctly()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => null
        ]);

        $this->assertFalse($user->hasVerifiedEmail());

        $user->markEmailAsVerified();

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }
}