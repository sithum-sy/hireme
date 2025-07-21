<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UploadImageRequest;
use App\Services\ProfileService;
use App\Services\FileUploadService;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    protected ProfileService $profileService;
    protected FileUploadService $fileUploadService;
    protected ActivityService $activityService;

    public function __construct(
        ProfileService $profileService,
        FileUploadService $fileUploadService,
        ActivityService $activityService
    ) {
        $this->profileService = $profileService;
        $this->fileUploadService = $fileUploadService;
        $this->activityService = $activityService;
    }

    /**
     * Get user profile data
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $profileData = $this->profileService->getProfileData($user);

            return response()->json([
                'success' => true,
                'data' => $profileData,
                'message' => 'Profile data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            $updatedProfile = $this->profileService->updateProfile($user, $data);

            return response()->json([
                'success' => true,
                'data' => $updatedProfile,
                'message' => 'Profile updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload profile image
     */
    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $file = $request->file('image');

            $imagePath = $this->fileUploadService->uploadProfileImage($user, $file);

            return response()->json([
                'success' => true,
                'data' => [
                    'image_url' => $imagePath,
                    'full_url' => asset('storage/' . $imagePath)
                ],
                'message' => 'Profile image uploaded successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload profile image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete profile image
     */
    public function deleteImage(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $this->fileUploadService->deleteProfileImage($user);

            return response()->json([
                'success' => true,
                'message' => 'Profile image deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete profile image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            // Verify current password
            if (!Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is incorrect.']
                ]);
            }

            // Update password
            $user->update([
                'password' => Hash::make($data['new_password'])
            ]);

            // Log password change
            $this->activityService->logUserActivity(
                'password_change',
                $user,
                [
                    'action' => 'password_changed',
                    'changed_at' => now(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get profile configuration for role
     */
    public function getConfig(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $config = $this->profileService->getProfileConfig($user->role);

            return response()->json([
                'success' => true,
                'data' => $config,
                'message' => 'Profile configuration retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile configuration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate field value
     */
    public function validateField(Request $request): JsonResponse
    {
        try {
            $fieldName = $request->input('field');
            $value = $request->input('value');
            $user = $request->user();

            $isValid = $this->profileService->validateField($user, $fieldName, $value);

            return response()->json([
                'success' => $isValid,
                'message' => $isValid ? 'Field is valid' : 'Field validation failed'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Field validation failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
