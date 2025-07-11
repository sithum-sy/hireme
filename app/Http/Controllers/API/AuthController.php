<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\ServiceCategory;
use App\Services\ProviderProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected $providerProfileService;

    public function __construct(ProviderProfileService $providerProfileService)
    {
        $this->providerProfileService = $providerProfileService;
    }

    public function register(RegisterRequest $request)
    {
        try {
            DB::beginTransaction();

            $userData = $request->validated();

            // Hash password
            $userData['password'] = Hash::make($userData['password']);

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');
                $filename = 'profile_' . Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_pictures', $filename, 'public');
                $userData['profile_picture'] = $path;
            }

            // Create user
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
                'is_active' => true,
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

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Update last login on registration
            $user->updateLastLogin();

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
                    'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
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
                'message' => $user->role === 'service_provider'
                    ? 'Registration successful! Your profile is pending verification.'
                    : 'Registration successful!',
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

    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = Auth::user();

            // Check if user is active
            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated. Please contact support.'
                ], 403);
            }

            // Revoke all existing tokens
            $user->tokens()->delete();

            // Update last login timestamp
            $user->updateLastLogin();

            // Create new token
            $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

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
                    'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                    'created_by' => $user->created_by,
                    'was_created_by_admin' => $user->wasCreatedByAdmin(),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
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

    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            if ($user) {
                // Delete the current access token for the user (Sanctum)
                $user->tokens()->where('id', $user->currentAccessToken()->id)->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        $user = $request->user();

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
                'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'last_login_human' => $user->last_login_human,
                'created_by' => $user->created_by,
                'was_created_by_admin' => $user->wasCreatedByAdmin(),
            ]
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
            'data' => $responseData
        ], 200);
    }
}
