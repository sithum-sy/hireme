<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateProviderProfileRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    protected $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    /**
     * Get user profile
     */
    public function getProfile()
    {
        try {
            $user = Auth::user();
            $profileData = $this->profileService->getUserProfile($user);

            return response()->json([
                'success' => true,
                'data' => $profileData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user basic profile
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        try {
            $user = Auth::user();
            $updatedUser = $this->profileService->updateUserProfile($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'user' => [
                        'id' => $updatedUser->id,
                        'first_name' => $updatedUser->first_name,
                        'last_name' => $updatedUser->last_name,
                        'full_name' => $updatedUser->full_name,
                        'email' => $updatedUser->email,
                        'address' => $updatedUser->address,
                        'contact_number' => $updatedUser->contact_number,
                        'date_of_birth' => $updatedUser->date_of_birth?->format('Y-m-d'),
                        'profile_picture' => $updatedUser->profile_picture ? \Storage::url($updatedUser->profile_picture) : null,
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update provider profile (Service providers only)
     */
    public function updateProviderProfile(UpdateProviderProfileRequest $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can update provider profile'
                ], 403);
            }

            $updatedProfile = $this->profileService->updateProviderProfile($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Provider profile updated successfully',
                'data' => [
                    'provider_profile' => [
                        'business_name' => $updatedProfile->business_name,
                        'years_of_experience' => $updatedProfile->years_of_experience,
                        'service_area_radius' => $updatedProfile->service_area_radius,
                        'bio' => $updatedProfile->bio,
                        'verification_status' => $updatedProfile->verification_status,
                        'business_license_url' => $updatedProfile->business_license_url,
                        'certification_urls' => $updatedProfile->certification_urls,
                        'portfolio_image_urls' => $updatedProfile->portfolio_image_urls,
                        'is_available' => $updatedProfile->is_available,
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update provider profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        try {
            $user = Auth::user();

            $this->profileService->changePassword(
                $user,
                $request->current_password,
                $request->new_password
            );

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully. Please log in again with your new password.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Toggle provider availability (Service providers only)
     */
    public function toggleAvailability()
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can toggle availability'
                ], 403);
            }

            $updatedProfile = $this->profileService->toggleProviderAvailability($user);

            return response()->json([
                'success' => true,
                'message' => 'Availability status updated successfully',
                'data' => [
                    'is_available' => $updatedProfile->is_available,
                    'status' => $updatedProfile->is_available ? 'Available' : 'Unavailable'
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete profile picture
     */
    public function deleteProfilePicture()
    {
        try {
            $user = Auth::user();
            $deleted = $this->profileService->deleteProfilePicture($user);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Profile picture deleted successfully'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'No profile picture to delete'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete provider document (Service providers only)
     */
    public function deleteProviderDocument(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can delete documents'
                ], 403);
            }

            $request->validate([
                'document_type' => 'required|in:business_license,certification,portfolio_image',
                'index' => 'nullable|integer|min:0',
            ]);

            $deleted = $this->profileService->deleteProviderDocument(
                $user,
                $request->document_type,
                $request->index
            );

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Document deleted successfully'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Document not found or could not be deleted'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get provider statistics (Service providers only)
     */
    public function getProviderStatistics()
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access statistics'
                ], 403);
            }

            $statistics = $this->profileService->getProviderStatistics($user);

            return response()->json([
                'success' => true,
                'data' => $statistics
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public provider profile (Public endpoint)
     */
    public function getPublicProviderProfile($providerId)
    {
        try {
            $provider = \App\Models\User::with(['providerProfile', 'services.category'])
                ->where('id', $providerId)
                ->where('role', 'service_provider')
                ->firstOrFail();

            if (!$provider->providerProfile || !$provider->providerProfile->isVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Provider profile not found or not verified'
                ], 404);
            }

            $profile = $provider->providerProfile;

            $publicProfile = [
                'id' => $provider->id,
                'name' => $provider->full_name,
                'business_name' => $profile->business_name,
                'bio' => $profile->bio,
                'years_of_experience' => $profile->years_of_experience,
                'service_area_radius' => $profile->service_area_radius,
                'average_rating' => $profile->average_rating,
                'total_reviews' => $profile->total_reviews,
                'is_available' => $profile->is_available,
                'verification_status' => $profile->verification_status,
                'portfolio_image_urls' => $profile->portfolio_image_urls,
                'services' => $provider->services->where('is_active', true)->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'title' => $service->title,
                        'description' => \Str::limit($service->description, 100),
                        'category' => $service->category->name,
                        'pricing_type' => $service->pricing_type,
                        'formatted_price' => $service->formatted_price,
                        'average_rating' => $service->average_rating,
                        'first_image_url' => $service->first_image_url,
                    ];
                })->values(),
                'recent_reviews' => $provider->providerAppointments()
                    ->completed()
                    ->whereNotNull('provider_rating')
                    ->with('client:id,first_name')
                    ->latest('completed_at')
                    ->take(5)
                    ->get()
                    ->map(function ($appointment) {
                        return [
                            'client_name' => $appointment->client->first_name,
                            'rating' => $appointment->provider_rating,
                            'review' => $appointment->provider_review,
                            'date' => $appointment->completed_at->format('M j, Y'),
                        ];
                    }),
            ];

            return response()->json([
                'success' => true,
                'data' => $publicProfile
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch provider profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
