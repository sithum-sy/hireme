<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_registers_new_user_successfully()
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'client',
            'contact_number' => '+94771234567',
            'address' => '123 Main Street, Colombo',
            'date_of_birth' => '1995-05-15'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'user' => [
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                            'role',
                            'requires_verification'
                        ]
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'first_name' => 'John',
            'is_active' => false // Should be inactive until email verified
        ]);

        $this->assertDatabaseHas('email_verification_tokens', [
            'email' => 'john@example.com'
        ]);
    }

    /** @test */
    public function it_prevents_registration_with_duplicate_email()
    {
        User::create([
            'first_name' => 'Existing',
            'last_name' => 'User',
            'email' => 'existing@example.com',
            'password' => Hash::make('password'),
            'role' => 'client'
        ]);

        $userData = [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'client',
            'contact_number' => '+94771234568',
            'address' => '456 Second Street, Kandy'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function it_logs_in_verified_user_successfully()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
            'email_verified_at' => now(),
            'is_active' => true
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'user',
                        'token',
                        'token_type',
                        'expires_at'
                    ]
                ]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    /** @test */
    public function it_prevents_login_for_unverified_email()
    {
        User::create([
            'first_name' => 'Unverified',
            'last_name' => 'User',
            'email' => 'unverified@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
            'email_verified_at' => null,
            'is_active' => false
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'unverified@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(403)
                ->assertJson([
                    'success' => false,
                    'error_code' => 'EMAIL_NOT_VERIFIED'
                ]);
    }

    /** @test */
    public function it_prevents_login_with_invalid_credentials()
    {
        User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => Hash::make('correct_password'),
            'role' => 'client',
            'email_verified_at' => now(),
            'is_active' => true
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password'
        ]);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false
                ]);
    }

    /** @test */
    public function it_verifies_email_with_valid_token()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'verify@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => null,
            'is_active' => false
        ]);

        $token = hash('sha256', 'verification-token-12345');
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now()
        ]);

        $response = $this->postJson('/api/verify-email', [
            'email' => $user->email,
            'token' => 'verification-token-12345'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'email_verified' => true,
                        'can_login' => true
                    ]
                ]);

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertTrue($user->fresh()->is_active);
    }

    /** @test */
    public function it_handles_expired_verification_tokens()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'expired@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => null,
            'is_active' => false
        ]);

        $token = hash('sha256', 'expired-token');
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now()->subHours(2) // Expired token (assuming 1 hour expiry)
        ]);

        $response = $this->postJson('/api/verify-email', [
            'email' => $user->email,
            'token' => 'expired-token'
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'error_code' => 'TOKEN_EXPIRED'
                ]);
    }

    /** @test */
    public function it_logs_out_user_successfully()
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'logout@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => now(),
            'is_active' => true
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Logout successful'
                ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id
        ]);
    }

    /** @test */
    public function it_returns_authenticated_user_data()
    {
        $user = User::create([
            'first_name' => 'Authenticated',
            'last_name' => 'User',
            'email' => 'auth@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => now(),
            'is_active' => true
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/user');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'user' => [
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                            'role'
                        ]
                    ]
                ]);
    }

    /** @test */
    public function it_sends_password_reset_email()
    {
        $user = User::create([
            'first_name' => 'Reset',
            'last_name' => 'User',
            'email' => 'reset@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => now(),
            'is_active' => true
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'reset@example.com'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'reset@example.com'
        ]);
    }

    /** @test */
    public function it_rate_limits_verification_email_requests()
    {
        $user = User::create([
            'first_name' => 'Rate',
            'last_name' => 'Limited',
            'email' => 'ratelimit@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'email_verified_at' => null,
            'is_active' => false
        ]);

        // Insert a recent verification token
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => 'recent-token',
            'created_at' => now()->subMinute() // 1 minute ago
        ]);

        $response = $this->postJson('/api/resend-verification', [
            'email' => 'ratelimit@example.com'
        ]);

        $response->assertStatus(429)
                ->assertJson([
                    'success' => false,
                    'error_code' => 'RATE_LIMITED'
                ]);
    }
}