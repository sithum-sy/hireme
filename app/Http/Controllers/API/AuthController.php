<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\ServiceCategory;
use App\Services\ProviderProfileService;
use App\Notifications\VerifyEmailNotification;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * AuthController - Handles user authentication and account management
 * 
 * Manages user registration, login, logout, email verification, and password reset
 * functionality for the HireMe service marketplace. Implements secure authentication
 * flow with email verification requirements and Sanctum token-based API authentication.
 */
class AuthController extends Controller
{
    protected $providerProfileService;

    public function __construct(ProviderProfileService $providerProfileService)
    {
        $this->providerProfileService = $providerProfileService;
    }

    /**
     * Register new user with email verification requirement
     * Creates user account but keeps it inactive until email is verified
     */
    public function register(RegisterRequest $request)
    {
        try {
            DB::beginTransaction();

            $userData = $request->validated();

            // Hash password for secure storage
            $userData['password'] = Hash::make($userData['password']);

            // Handle profile picture upload with UUID naming for uniqueness
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

            // Create user - IMPORTANT: NOT ACTIVE until email verified
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

            // Create provider profile if user is service provider
            $providerProfile = null;
            if ($user->role === 'service_provider') {
                $providerProfile = $this->providerProfileService->createProviderProfile($user, $userData);

                // Associate with service categories if provided
                if (isset($userData['service_categories'])) {
                    // This will be used later when we implement services
                    // For now, we just validate that categories exist
                    ServiceCategory::whereIn('id', $userData['service_categories'])->get();
                }
            }

            // Generate secure email verification token with user email and timestamp
            $token = hash('sha256', Str::random(60) . $user->email . time());
            
            // Store verification token in database for validation
            DB::table('email_verification_tokens')->insert([
                'email' => $user->email,
                'token' => $token,
                'created_at' => now(),
            ]);

            // Send verification email to user
            $user->notify(new VerifyEmailNotification($token));

            // Prepare response data (no auth token until email verified)
            $responseData = [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'email_verified' => false,
                    'requires_verification' => true,
                ]
            ];

            // Add provider profile data if applicable
            if ($providerProfile) {
                $responseData['provider_profile'] = [
                    'business_name' => $providerProfile->business_name,
                    'years_of_experience' => $providerProfile->years_of_experience,
                    'service_area_radius' => $providerProfile->service_area_radius,
                    'bio' => $providerProfile->bio,
                    'verification_status' => $providerProfile->verification_status,
                    'business_license_url' => $providerProfile->business_license_url,
                    'certification_urls' => $providerProfile->certification_urls,
                    'portfolio_image_urls' => $providerProfile->portfolio_image_urls,
                    'is_available' => $providerProfile->is_available,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please check your email and click the verification link before logging in.',
                'data' => $responseData
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

    /**
     * Authenticate user with strict email verification and account status checks
     * Implements "remember me" functionality with different token expiration times
     */
    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();
            
            // Extract remember me option and remove it from credentials
            $rememberMe = $request->boolean('remember', false);
            unset($credentials['remember']);

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password. Please check your credentials and try again.'
                ], 401);
            }

            $user = Auth::user();

            // CRITICAL: Check if email is verified FIRST - security requirement
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

            // Check if user account is active (admin can deactivate accounts)
            if (!$user->is_active) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact support for assistance.'
                ], 403);
            }

            // Revoke all existing tokens for security (prevent multiple concurrent sessions)
            $user->tokens()->delete();

            // Update last login timestamp for activity tracking
            $user->updateLastLogin();

            // Create new token with different expiration based on remember me preference
            $tokenName = $rememberMe ? 'long-term-token' : 'session-token';
            $expiresAt = $rememberMe ? now()->addDays(30) : now()->addHours(2);
            
            $token = $user->createToken($tokenName, ['*'], $expiresAt)->plainTextToken;

            // Prepare response data
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
                    // 'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'profile_picture' => $user->profile_picture ? asset($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                    'created_by' => $user->created_by,
                    'was_created_by_admin' => $user->wasCreatedByAdmin(),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'token_name' => $tokenName,
                'expires_at' => $expiresAt->toDateTimeString(),
                'remembered' => $rememberMe,
            ];

            // Add creator information if user was created by admin
            if ($user->creator) {
                $responseData['creator'] = [
                    'id' => $user->creator->id,
                    'name' => $user->creator->full_name,
                    'role' => $user->creator->role,
                ];
            }

            // Add provider profile data if user is service provider
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

    // public function logout(Request $request)
    // {
    //     try {
    //         $user = $request->user();
    //         if ($user) {
    //             // Delete the current access token for the user (Sanctum)
    //             $user->tokens()->where('id', $user->currentAccessToken()->id)->delete();
    //         }

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Logout successful'
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Logout failed',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Logout user and revoke authentication tokens
     * Handles different Sanctum token types (PersonalAccessToken vs TransientToken)
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            if ($user) {
                // Get the current token
                $currentToken = $user->currentAccessToken();

                if ($currentToken) {
                    // Handle different token types - Sanctum can use different token implementations
                    if (!($currentToken instanceof \Laravel\Sanctum\TransientToken)) {
                        if ($currentToken instanceof \Laravel\Sanctum\PersonalAccessToken) {
                            $currentToken->delete();
                        }
                    } else {
                        // It's a TransientToken, delete all user tokens
                        $user->tokens()->delete();
                    }
                } else {
                    // No current token, delete all user tokens
                    $user->tokens()->delete();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);
        } catch (\Exception $e) {
            Log::warning('Logout encountered an error but proceeding:', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'token_class' => $request->user()?->currentAccessToken() ? get_class($request->user()->currentAccessToken()) : 'null'
            ]);

            // Always return success for logout - frontend should clear data
            return response()->json([
                'success' => true,
                'message' => 'Logout completed'
            ], 200);
        }
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();

            // Fix the token logging to handle TransientToken
            $currentToken = $user->currentAccessToken();
            $tokenId = null;
            if ($currentToken && !($currentToken instanceof \Laravel\Sanctum\TransientToken)) {
                $tokenId = $currentToken->id;
            }

            Log::info('User endpoint called', [
                'token_id' => $tokenId,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'token_class' => get_class($currentToken),
                'request_token' => $request->bearerToken()
            ]);

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
                    // 'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'profile_picture' => $user->profile_picture ? asset($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                    'last_login_human' => $user->last_login_human ?? 'Never logged in',
                    'created_by' => $user->created_by,
                    'created_at' => $user->created_at,
                    'was_created_by_admin' => $user->wasCreatedByAdmin(),
                ]
            ];

            // Add creator information if user was created by admin - with error handling
            try {
                if ($user->creator) {
                    $responseData['creator'] = [
                        'id' => $user->creator->id,
                        'name' => $user->creator->full_name,
                        'role' => $user->creator->role,
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error loading creator data: ' . $e->getMessage());
            }

            // Add provider profile data if user is service provider - with error handling
            try {
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
            } catch (\Exception $e) {
                Log::warning('Error loading provider profile data: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data' => $responseData
            ], 200);
        } catch (\Exception $e) {
            Log::error('User endpoint error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load user data',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Verify user email address using token from verification email
     * Activates user account after successful email verification
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email'
        ]);

        try {
            // Find the verification token in database
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

            // Check if token is expired (60 minutes expiration policy)
            if (Carbon::parse($verificationToken->created_at)->addMinutes(60)->isPast()) {
                // Delete expired token for security
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

            // Mark email as verified and activate user account
            $user->markEmailAsVerified();
            $user->update(['is_active' => true]);

            // Delete the used token for security (one-time use)
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

    /**
     * Validate password reset token without consuming it
     */
    public function validateResetToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email'
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
                    'message' => 'Invalid reset token.',
                    'error_code' => 'INVALID_TOKEN'
                ], 400);
            }

            // Check if token is expired (60 minutes)
            if (Carbon::parse($resetToken->created_at)->addMinutes(60)->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reset token has expired. Please request a new password reset.',
                    'error_code' => 'TOKEN_EXPIRED'
                ], 400);
            }

            // Token is valid
            return response()->json([
                'success' => true,
                'message' => 'Token is valid',
                'data' => [
                    'email' => $request->email,
                    'expires_at' => Carbon::parse($resetToken->created_at)->addMinutes(60)->toDateTimeString()
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token validation failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred during token validation'
            ], 500);
        }
    }

    /**
     * Refresh CSRF token
     */
    public function refreshCSRF(Request $request)
    {
        // Regenerate the session to get a fresh CSRF token
        $request->session()->regenerateToken();
        
        return response()->json([
            'success' => true,
            'message' => 'CSRF token refreshed',
            'csrf_token' => csrf_token()
        ]);
    }
}
