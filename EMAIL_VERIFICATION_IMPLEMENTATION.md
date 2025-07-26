# Email Verification & Password Reset Implementation Guide
## HireMe Laravel + React Application

---

## 📋 Overview

This document provides a complete implementation guide for adding email verification and password reset functionality to the HireMe application. The implementation ensures that **all users must verify their email address before being able to log in**.

### Features Implemented
- ✅ **Mandatory Email Verification** - Users cannot login until email is verified
- ✅ **Password Reset via Email** - Secure password reset flow
- ✅ **Mailtrap Integration** - Email testing in development
- ✅ **Token-based Security** - Secure verification and reset tokens
- ✅ **Frontend Integration** - React components for email flows
- ✅ **Comprehensive Error Handling** - User-friendly error messages

---

## 🎯 Current State Analysis

### Issues Found in Existing AuthController
- ❌ No email verification requirement
- ❌ Users immediately active after registration (`'is_active' => true`)
- ❌ No password reset functionality
- ❌ `email_verified_at` field exists but unused
- ❌ Login doesn't check email verification status

### Database Schema Requirements
- ✅ `users.email_verified_at` - Already exists
- ➕ `email_verification_tokens` - New table needed
- ➕ `password_reset_tokens` - New table needed

---

## 🏗️ Implementation Steps

### Step 1: Mailtrap Configuration

#### 1.1 Get Mailtrap Credentials
1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Create a new inbox for testing
3. Go to **Email Testing** → **Inboxes** → **Your Inbox**
4. Click **SMTP Settings** → **Laravel 9+**
5. Copy the provided credentials

#### 1.2 Update Environment Configuration

**Update `.env` file:**
```env
# Mailtrap SMTP Configuration
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username_here
MAIL_PASSWORD=your_mailtrap_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@hireme.com"
MAIL_FROM_NAME="HireMe"

# Frontend URL for email verification links
FRONTEND_URL=http://localhost:3000
```

**Add to `config/app.php`:**
```php
'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
```

### Step 2: Database Schema Updates

#### 2.1 Create Migration for Email Tables

```bash
php artisan make:migration create_email_verification_and_password_reset_tables
```

**Migration file content:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Email verification tokens table
        Schema::create('email_verification_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('token')->index();
            $table->timestamp('created_at')->nullable();
        });

        // Password reset tokens table
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_verification_tokens');
        Schema::dropIfExists('password_reset_tokens');
    }
};
```

#### 2.2 Run Migration
```bash
php artisan migrate
```

### Step 3: Update User Model

#### 3.1 Implement MustVerifyEmail Interface

**Update `app/Models/User.php`:**

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    // ... existing code ...

    /**
     * Email verification helper methods
     */
    
    /**
     * Determine if the user has verified their email address.
     */
    public function hasVerifiedEmail()
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Mark the given user's email as verified.
     */
    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    /**
     * Generate a unique email verification token.
     */
    public function generateEmailVerificationToken()
    {
        return hash('sha256', Str::random(60) . $this->email . time());
    }

    /**
     * Send the email verification notification.
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification($this->generateEmailVerificationToken()));
    }

    // ... rest of existing code ...
}
```

### Step 4: Create Email Notification Classes

#### 4.1 Email Verification Notification

```bash
php artisan make:notification VerifyEmailNotification
```

**Update `app/Notifications/VerifyEmailNotification.php`:**

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
                    ->subject('Verify Your Email Address - HireMe')
                    ->greeting('Hello ' . $notifiable->first_name . '!')
                    ->line('Welcome to HireMe! Please verify your email address to complete your registration.')
                    ->line('Click the button below to verify your email address:')
                    ->action('Verify Email Address', $verificationUrl)
                    ->line('This verification link will expire in 60 minutes.')
                    ->line('If you did not create an account with HireMe, no further action is required.')
                    ->salutation('Best regards, The HireMe Team');
    }

    /**
     * Generate the email verification URL.
     */
    protected function verificationUrl($notifiable)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        
        return $frontendUrl . '/verify-email?' . http_build_query([
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'token' => $this->token,
            'email' => $notifiable->email,
        ];
    }
}
```

#### 4.2 Password Reset Notification

```bash
php artisan make:notification ResetPasswordNotification
```

**Update `app/Notifications/ResetPasswordNotification.php`:**

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = $this->resetUrl($notifiable);

        return (new MailMessage)
                    ->subject('Reset Your Password - HireMe')
                    ->greeting('Hello ' . $notifiable->first_name . '!')
                    ->line('You are receiving this email because we received a password reset request for your account.')
                    ->line('Click the button below to reset your password:')
                    ->action('Reset Password', $resetUrl)
                    ->line('This password reset link will expire in 60 minutes.')
                    ->line('If you did not request a password reset, no further action is required and your password will remain unchanged.')
                    ->salutation('Best regards, The HireMe Team');
    }

    /**
     * Generate the password reset URL.
     */
    protected function resetUrl($notifiable)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        
        return $frontendUrl . '/reset-password?' . http_build_query([
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'token' => $this->token,
            'email' => $notifiable->email,
        ];
    }
}
```

### Step 5: Update AuthController

#### 5.1 Add Required Imports

**Add to top of `app/Http/Controllers/API/AuthController.php`:**

```php
use App\Notifications\VerifyEmailNotification;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
```

#### 5.2 Update Registration Method

**Replace the existing `register` method:**

```php
public function register(RegisterRequest $request)
{
    try {
        DB::beginTransaction();

        $userData = $request->validated();

        // Hash password
        $userData['password'] = Hash::make($userData['password']);

        // Handle profile picture upload (existing code)
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'profile_' . Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Create the profile_pictures directory if it doesn't exist
            $profileDir = public_path('images/profile_pictures');
            if (!file_exists($profileDir)) {
                mkdir($profileDir, 0755, true);
            }

            // Move the uploaded file to public/images/profile_pictures
            $file->move($profileDir, $filename);
            $userData['profile_picture'] = 'images/profile_pictures/' . $filename;
        }

        // Create user - NOT ACTIVE until email verified
        $user = User::create([
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'email' => $userData['email'],
            'password' => $userData['password'],
            'role' => $userData['role'],
            'address' => $userData['address'],
            'contact_number' => $userData['contact_number'],
            'date_of_birth' => $userData['date_of_birth'],
            'profile_picture' => $userData['profile_picture'] ?? null,
            'is_active' => false, // User inactive until email verified
            'email_verified_at' => null, // Not verified yet
        ]);

        // Create provider profile if user is service provider (existing code)
        $providerProfile = null;
        if ($user->role === 'service_provider') {
            $providerProfile = $this->providerProfileService->createProviderProfile($user, $userData);

            // Associate with service categories if provided
            if (isset($userData['service_categories'])) {
                ServiceCategory::whereIn('id', $userData['service_categories'])->get();
            }
        }

        // Generate email verification token
        $token = hash('sha256', Str::random(60) . $user->email . time());
        
        // Store verification token
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Send verification email
        $user->notify(new VerifyEmailNotification($token));

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Please check your email and click the verification link before logging in.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'email_verified' => false,
                    'requires_verification' => true,
                ]
            ]
        ], 201);
        
    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Registration failed',
            'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred during registration'
        ], 500);
    }
}
```

#### 5.3 Update Login Method

**Replace the existing `login` method:**

```php
public function login(LoginRequest $request)
{
    try {
        $credentials = $request->validated();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password. Please check your credentials and try again.'
            ], 401);
        }

        $user = Auth::user();

        // CRITICAL: Check if email is verified FIRST
        if (!$user->hasVerifiedEmail()) {
            Auth::logout(); // Logout the user immediately
            
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email address before logging in. Check your inbox for the verification link.',
                'error_code' => 'EMAIL_NOT_VERIFIED',
                'data' => [
                    'email' => $user->email,
                    'can_resend_verification' => true
                ]
            ], 403);
        }

        // Check if user is active
        if (!$user->is_active) {
            Auth::logout();
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support for assistance.'
            ], 403);
        }

        // Revoke all existing tokens
        $user->tokens()->delete();

        // Update last login timestamp
        $user->updateLastLogin();

        // Create new token
        $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

        // Prepare response data (existing code)
        $responseData = [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'address' => $user->address,
                'contact_number' => $user->contact_number,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'age' => $user->age,
                'profile_picture' => $user->profile_picture ? asset($user->profile_picture) : null,
                'is_active' => $user->is_active,
                'email_verified' => $user->hasVerifiedEmail(),
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'created_by' => $user->created_by,
                'was_created_by_admin' => $user->wasCreatedByAdmin(),
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ];

        // Add creator information if user was created by admin (existing code)
        if ($user->creator) {
            $responseData['creator'] = [
                'id' => $user->creator->id,
                'name' => $user->creator->full_name,
                'role' => $user->creator->role,
            ];
        }

        // Add provider profile data if user is service provider (existing code)
        if ($user->role === 'service_provider' && $user->providerProfile) {
            $profile = $user->providerProfile;
            $responseData['provider_profile'] = [
                'business_name' => $profile->business_name,
                'years_of_experience' => $profile->years_of_experience,
                'service_area_radius' => $profile->service_area_radius,
                'bio' => $profile->bio,
                'verification_status' => $profile->verification_status,
                'average_rating' => $profile->average_rating,
                'total_reviews' => $profile->total_reviews,
                'total_earnings' => $profile->total_earnings,
                'business_license_url' => $profile->business_license_url,
                'certification_urls' => $profile->certification_urls,
                'portfolio_image_urls' => $profile->portfolio_image_urls,
                'is_available' => $profile->is_available,
                'verified_at' => $profile->verified_at?->format('Y-m-d H:i:s'),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => $responseData
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Login failed',
            'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred during login'
        ], 500);
    }
}
```

#### 5.4 Add New Authentication Methods

**Add these methods to the `AuthController` class:**

```php
/**
 * Verify user email address
 */
public function verifyEmail(Request $request)
{
    $request->validate([
        'token' => 'required|string',
        'email' => 'required|email'
    ]);

    try {
        // Find the verification token
        $verificationToken = DB::table('email_verification_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$verificationToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification token.',
                'error_code' => 'INVALID_TOKEN'
            ], 400);
        }

        // Check if token is expired (60 minutes)
        if (Carbon::parse($verificationToken->created_at)->addMinutes(60)->isPast()) {
            // Delete expired token
            DB::table('email_verification_tokens')
                ->where('email', $request->email)
                ->where('token', $request->token)
                ->delete();
                
            return response()->json([
                'success' => false,
                'message' => 'Verification token has expired. Please request a new verification email.',
                'error_code' => 'TOKEN_EXPIRED',
                'data' => [
                    'can_resend' => true,
                    'email' => $request->email
                ]
            ], 400);
        }

        // Find user and verify email
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified.',
                'error_code' => 'ALREADY_VERIFIED'
            ], 400);
        }

        // Mark email as verified and activate user
        $user->markEmailAsVerified();
        $user->update(['is_active' => true]);

        // Delete the used token
        DB::table('email_verification_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully! You can now log in to your account.',
            'data' => [
                'email_verified' => true,
                'can_login' => true
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Email verification failed',
            'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred during verification'
        ], 500);
    }
}

/**
 * Resend email verification
 */
public function resendVerification(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email'
    ]);

    try {
        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified.',
                'error_code' => 'ALREADY_VERIFIED'
            ], 400);
        }

        // Check rate limiting (optional but recommended)
        $recentToken = DB::table('email_verification_tokens')
            ->where('email', $user->email)
            ->where('created_at', '>', Carbon::now()->subMinutes(2))
            ->first();

        if ($recentToken) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait at least 2 minutes before requesting another verification email.',
                'error_code' => 'RATE_LIMITED'
            ], 429);
        }

        // Delete old tokens for this email
        DB::table('email_verification_tokens')
            ->where('email', $user->email)
            ->delete();

        // Generate new token
        $token = hash('sha256', Str::random(60) . $user->email . time());
        
        DB::table('email_verification_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Send verification email
        $user->notify(new VerifyEmailNotification($token));

        return response()->json([
            'success' => true,
            'message' => 'Verification email sent! Please check your inbox and spam folder.',
            'data' => [
                'email' => $user->email,
                'expires_in_minutes' => 60
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send verification email',
            'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred while sending verification email'
        ], 500);
    }
}

/**
 * Send password reset email
 */
public function forgotPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email'
    ]);

    try {
        $user = User::where('email', $request->email)->first();

        // Check rate limiting
        $recentToken = DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->where('created_at', '>', Carbon::now()->subMinutes(2))
            ->first();

        if ($recentToken) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait at least 2 minutes before requesting another password reset email.',
                'error_code' => 'RATE_LIMITED'
            ], 429);
        }

        // Generate reset token
        $token = Str::random(60);
        $hashedToken = hash('sha256', $token);
        
        // Delete old tokens for this email
        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->delete();

        // Store reset token
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => $hashedToken,
            'created_at' => now(),
        ]);

        // Send reset email
        $user->notify(new ResetPasswordNotification($token));

        return response()->json([
            'success' => true,
            'message' => 'Password reset email sent! Please check your inbox and spam folder.',
            'data' => [
                'email' => $user->email,
                'expires_in_minutes' => 60
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send password reset email',
            'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred while sending reset email'
        ], 500);
    }
}

/**
 * Reset user password
 */
public function resetPassword(Request $request)
{
    $request->validate([
        'token' => 'required|string',
        'email' => 'required|email|exists:users,email',
        'password' => 'required|string|min:8|confirmed'
    ]);

    try {
        $hashedToken = hash('sha256', $request->token);

        // Find reset token
        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $hashedToken)
            ->first();

        if (!$resetToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.',
                'error_code' => 'INVALID_TOKEN'
            ], 400);
        }

        // Check if token is expired (60 minutes)
        if (Carbon::parse($resetToken->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('token', $hashedToken)
                ->delete();
                
            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired. Please request a new password reset.',
                'error_code' => 'TOKEN_EXPIRED',
                'data' => [
                    'can_request_new' => true
                ]
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete used token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully! Please log in with your new password.',
            'data' => [
                'password_reset' => true,
                'tokens_revoked' => true
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Password reset failed',
            'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred during password reset'
        ], 500);
    }
}
```

### Step 6: API Routes Configuration

#### 6.1 Add Routes to `routes/api.php`

**Add these routes to your existing API routes:**

```php
use App\Http\Controllers\API\AuthController;

// Existing auth routes...
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// NEW: Email verification routes (public)
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);

// NEW: Password reset routes (public)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes...
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    // ... other protected routes
});
```

### Step 7: Frontend Integration (React)

#### 7.1 Email Verification Page Component

**Create `resources/js/pages/VerifyEmail.jsx`:**

```jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link. Please check the link in your email.');
            return;
        }

        verifyEmail(token, email);
    }, [searchParams]);

    const verifyEmail = async (token, email) => {
        try {
            setStatus('verifying');
            const response = await axios.post('/api/verify-email', { token, email });
            
            setStatus('success');
            setMessage(response.data.message);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Email verified! You can now log in.',
                        type: 'success' 
                    }
                });
            }, 3000);
            
        } catch (error) {
            setStatus('error');
            const errorData = error.response?.data;
            setMessage(errorData?.message || 'Email verification failed.');
            
            // Check if user can resend verification
            if (errorData?.error_code === 'TOKEN_EXPIRED' && errorData?.data?.can_resend) {
                setCanResend(true);
            }
        }
    };

    const handleResendVerification = async () => {
        const email = searchParams.get('email');
        if (!email) return;

        try {
            setResending(true);
            await axios.post('/api/resend-verification', { email });
            
            setMessage('New verification email sent! Please check your inbox.');
            setCanResend(false);
            
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to resend verification email.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <div className="text-center">
                                    {/* Logo */}
                                    <h3 className="text-primary mb-4">HireMe</h3>
                                    
                                    {/* Verifying State */}
                                    {status === 'verifying' && (
                                        <>
                                            <div className="spinner-border text-primary mb-4" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <h4 className="mb-3">Verifying Your Email</h4>
                                            <p className="text-muted">
                                                Please wait while we verify your email address...
                                            </p>
                                        </>
                                    )}
                                    
                                    {/* Success State */}
                                    {status === 'success' && (
                                        <>
                                            <div className="text-success mb-4">
                                                <i className="fas fa-check-circle fa-4x"></i>
                                            </div>
                                            <h4 className="text-success mb-3">Email Verified!</h4>
                                            <div className="alert alert-success">
                                                {message}
                                            </div>
                                            <p className="text-muted">
                                                Redirecting you to login page...
                                            </p>
                                            <div className="progress mt-3">
                                                <div 
                                                    className="progress-bar bg-success" 
                                                    role="progressbar" 
                                                    style={{ width: '100%', animationDuration: '3s' }}
                                                ></div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Error State */}
                                    {status === 'error' && (
                                        <>
                                            <div className="text-danger mb-4">
                                                <i className="fas fa-exclamation-circle fa-4x"></i>
                                            </div>
                                            <h4 className="text-danger mb-3">Verification Failed</h4>
                                            <div className="alert alert-danger">
                                                {message}
                                            </div>
                                            
                                            {/* Resend verification option */}
                                            {canResend && (
                                                <div className="mt-4">
                                                    <button 
                                                        className="btn btn-primary"
                                                        onClick={handleResendVerification}
                                                        disabled={resending}
                                                    >
                                                        {resending ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            'Resend Verification Email'
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {/* Back to login */}
                                            <div className="mt-3">
                                                <Link to="/login" className="btn btn-outline-primary">
                                                    Back to Login
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
```

#### 7.2 Password Reset Page Component

**Create `resources/js/pages/ResetPassword.jsx`:**

```jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid password reset link. Please request a new password reset.');
        }
    }, [token, email]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear errors when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token || !email) {
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await axios.post('/api/reset-password', {
                token,
                email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });

            setMessage(response.data.message);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Password reset successfully! Please log in with your new password.',
                        type: 'success' 
                    }
                });
            }, 3000);
            
        } catch (error) {
            const errorData = error.response?.data;
            setError(errorData?.message || 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h3 className="text-primary">HireMe</h3>
                                    <h4 className="text-dark">Reset Your Password</h4>
                                    {email && (
                                        <p className="text-muted">
                                            Resetting password for: <strong>{email}</strong>
                                        </p>
                                    )}
                                </div>

                                {/* Success Message */}
                                {message && (
                                    <div className="alert alert-success text-center">
                                        <i className="fas fa-check-circle me-2"></i>
                                        {message}
                                        <div className="mt-2 small">
                                            Redirecting to login...
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                )}

                                {/* Reset Form */}
                                {!message && token && email && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">
                                                New Password *
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                minLength="8"
                                                placeholder="Enter your new password"
                                            />
                                            <div className="form-text">
                                                Must be at least 8 characters long
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="password_confirmation" className="form-label">
                                                Confirm New Password *
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Confirm your new password"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Resetting Password...
                                                </>
                                            ) : (
                                                'Reset Password'
                                            )}
                                        </button>
                                    </form>
                                )}

                                {/* Invalid Link State */}
                                {(!token || !email) && (
                                    <div className="text-center">
                                        <div className="alert alert-danger">
                                            Invalid password reset link. Please request a new password reset.
                                        </div>
                                        <Link to="/forgot-password" className="btn btn-primary">
                                            Request New Password Reset
                                        </Link>
                                    </div>
                                )}

                                {/* Back to Login */}
                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-decoration-none">
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
```

#### 7.3 Forgot Password Page Component

**Create `resources/js/pages/ForgotPassword.jsx`:**

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await axios.post('/api/forgot-password', { email });
            setMessage(response.data.message);
            
        } catch (error) {
            const errorData = error.response?.data;
            setError(errorData?.message || 'Failed to send password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h3 className="text-primary">HireMe</h3>
                                    <h4 className="text-dark">Forgot Password?</h4>
                                    <p className="text-muted">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                {/* Success Message */}
                                {message && (
                                    <div className="alert alert-success">
                                        <i className="fas fa-check-circle me-2"></i>
                                        {message}
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                )}

                                {/* Forgot Password Form */}
                                {!message && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="form-label">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                required
                                                placeholder="Enter your email address"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Sending Reset Link...
                                                </>
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </button>
                                    </form>
                                )}

                                {/* Success State - Option to resend */}
                                {message && (
                                    <div className="text-center">
                                        <button
                                            onClick={() => {
                                                setMessage('');
                                                setEmail('');
                                            }}
                                            className="btn btn-outline-primary"
                                        >
                                            Send Another Reset Link
                                        </button>
                                    </div>
                                )}

                                {/* Back to Login */}
                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-decoration-none">
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
```

#### 7.4 Update Login Component

**Modify your existing login component to handle email verification:**

```jsx
// Add to your existing login component
const [showResendVerification, setShowResendVerification] = useState(false);
const [unverifiedEmail, setUnverifiedEmail] = useState('');
const [resendingVerification, setResendingVerification] = useState(false);

const handleLogin = async (credentials) => {
    try {
        setLoading(true);
        const response = await axios.post('/api/login', credentials);
        
        // Handle successful login
        const { token, user } = response.data.data;
        localStorage.setItem('auth_token', token);
        // ... rest of login logic
        
    } catch (error) {
        const errorData = error.response?.data;
        
        // Handle email not verified error
        if (errorData?.error_code === 'EMAIL_NOT_VERIFIED') {
            setShowResendVerification(true);
            setUnverifiedEmail(errorData.data?.email || credentials.email);
            setError(errorData.message);
        } else {
            setError(errorData?.message || 'Login failed');
        }
    } finally {
        setLoading(false);
    }
};

const handleResendVerification = async () => {
    try {
        setResendingVerification(true);
        await axios.post('/api/resend-verification', { email: unverifiedEmail });
        
        setMessage('Verification email sent! Please check your inbox.');
        setShowResendVerification(false);
        setError('');
        
    } catch (error) {
        setError(error.response?.data?.message || 'Failed to send verification email');
    } finally {
        setResendingVerification(false);
    }
};

// Add to your login form JSX:
{showResendVerification && (
    <div className="alert alert-warning">
        <p className="mb-2">Your email address is not verified.</p>
        <button
            onClick={handleResendVerification}
            className="btn btn-sm btn-outline-primary"
            disabled={resendingVerification}
        >
            {resendingVerification ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Sending...
                </>
            ) : (
                'Resend Verification Email'
            )}
        </button>
    </div>
)}

// Add forgot password link to your login form:
<div className="text-center mt-3">
    <Link to="/forgot-password" className="text-decoration-none">
        Forgot your password?
    </Link>
</div>
```

#### 7.5 Update React Router

**Add routes to your router configuration:**

```jsx
// In your main router file (App.jsx or Routes.jsx)
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';

// Add these routes
<Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
```

### Step 8: Testing & Validation

#### 8.1 Test Email Verification Flow

1. **Register a new user**
   ```bash
   # Use your registration form or API directly
   curl -X POST http://localhost:8000/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "Test",
       "last_name": "User",
       "email": "test@example.com",
       "password": "password123",
       "password_confirmation": "password123",
       "role": "client",
       "contact_number": "1234567890",
       "date_of_birth": "1990-01-01",
       "address": "Test Address"
     }'
   ```

2. **Check Mailtrap inbox** for verification email

3. **Try to login before verification** - should fail with email verification error

4. **Click verification link** in Mailtrap email

5. **Try to login after verification** - should succeed

#### 8.2 Test Password Reset Flow

1. **Request password reset**
   ```bash
   curl -X POST http://localhost:8000/api/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Check Mailtrap inbox** for reset email

3. **Click reset link** and set new password

4. **Login with new password**

#### 8.3 Test Edge Cases

- **Expired verification tokens** (manually modify database)
- **Invalid tokens**
- **Already verified emails**
- **Rate limiting** (send multiple requests quickly)
- **Non-existent email addresses**

### Step 9: Production Considerations

#### 9.1 Queue Configuration

**For production, set up queues for email sending:**

```bash
# Install Redis or use database queues
composer require predis/predis

# Update .env
QUEUE_CONNECTION=redis
```

**Update notification classes to use queues:**
```php
class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;
    
    public $queue = 'emails';
    public $delay = 10; // Delay in seconds
}
```

#### 9.2 Production Email Service

**Replace Mailtrap with production email service:**

```env
# For production - use services like SendGrid, Mailgun, etc.
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="HireMe"
```

#### 9.3 Security Enhancements

**Add rate limiting middleware:**
```php
// In routes/api.php
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});
```

**Add CAPTCHA for sensitive operations:**
```php
// Add to form validation
'captcha' => 'required|captcha'
```

---

## 🔒 Security Features

### Token Security
- **Hashed tokens** stored in database
- **60-minute expiration** for all email tokens
- **Rate limiting** prevents spam (2-minute cooldown)
- **Single-use tokens** automatically deleted after use

### Data Protection
- **Password hashing** with Laravel's Hash facade
- **Token revocation** on password reset
- **Email validation** before sending tokens
- **SQL injection protection** through Eloquent ORM

### User Experience
- **Clear error messages** with actionable steps
- **Resend verification** option when needed
- **Progressive enhancement** with loading states
- **Mobile-responsive** email templates

---

## 📚 Troubleshooting

### Common Issues

#### 1. Emails Not Sending
```bash
# Check mail configuration
php artisan config:clear
php artisan queue:work --verbose

# Test email manually
php artisan tinker
> Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });
```

#### 2. Token Validation Errors
```sql
-- Check tokens in database
SELECT * FROM email_verification_tokens WHERE email = 'test@example.com';
SELECT * FROM password_reset_tokens WHERE email = 'test@example.com';
```

#### 3. Frontend Route Issues
```jsx
// Ensure routes are properly configured
// Check browser console for navigation errors
// Verify API base URL configuration
```

#### 4. CORS Issues
```php
// In config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000'],
```

---

## 📋 Summary

This implementation provides:

✅ **Mandatory email verification** - Users cannot login until verified  
✅ **Secure password reset** - Token-based with expiration  
✅ **Production-ready** - Queue support, rate limiting, security  
✅ **User-friendly** - Clear messages and responsive design  
✅ **Well-tested** - Comprehensive error handling  

The system ensures that **every user must verify their email before accessing the application**, improving security and ensuring valid email addresses in your user database.

---

**Document Version**: 1.0  
**Created**: July 24, 2025  
**Last Updated**: July 24, 2025  
**Next Review**: August 24, 2025