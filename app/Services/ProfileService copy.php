<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Events\ProfileUpdated;
use App\Notifications\ProfileUpdateNotification;

class ProfileService
{
    /**
     * Role-based field configuration
     */
    private function getRoleConfiguration(string $role): array
    {
        $configurations = [
            'admin' => [
                'editable_fields' => ['first_name', 'last_name', 'contact_number'],
                'required_fields' => ['first_name', 'last_name'],
                'restricted_fields' => ['email', 'role', 'date_of_birth', 'address']
            ],
            'staff' => [
                'editable_fields' => ['first_name', 'last_name', 'contact_number', 'address'],
                'required_fields' => ['first_name', 'last_name'],
                'restricted_fields' => ['email', 'role', 'date_of_birth']
            ],
            'service_provider' => [
                'editable_fields' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'],
                'required_fields' => ['first_name', 'last_name', 'email'],
                'restricted_fields' => ['role']
            ],
            'client' => [
                'editable_fields' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'],
                'required_fields' => ['first_name', 'last_name', 'email'],
                'restricted_fields' => ['role']
            ]
        ];

        return $configurations[$role] ?? [];
    }

    /**
     * Validate profile field for specific role
     */
    public function validateProfileField(User $user, string $fieldName, $fieldValue): array
    {
        $roleConfig = $this->getRoleConfiguration($user->role);

        // Check if field is editable for this role
        $isEditable = in_array($fieldName, $roleConfig['editable_fields'] ?? []);

        if (!$isEditable) {
            return [
                'is_valid' => false,
                'is_editable' => false,
                'errors' => ["This field cannot be edited by your role."]
            ];
        }

        // Define validation rules for each field
        $fieldRules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
            'date_of_birth' => 'nullable|date|before:today|after:1900-01-01',
        ];

        $rule = $fieldRules[$fieldName] ?? 'nullable|string';

        $validator = Validator::make(
            [$fieldName => $fieldValue],
            [$fieldName => $rule]
        );

        return [
            'is_valid' => !$validator->fails(),
            'is_editable' => true,
            'errors' => $validator->errors()->get($fieldName)
        ];
    }

    /**
     * Upload profile image
     */
    public function uploadProfileImage(User $user, UploadedFile $image): string
    {
        // Delete old profile picture
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Generate unique filename
        $filename = 'profile_' . $user->id . '_' . time() . '.' . $image->getClientOriginalExtension();

        // Store the image
        $path = $image->storeAs('profile_pictures', $filename, 'public');

        // Update user record
        $user->update(['profile_picture' => $path]);

        // Fire event
        event(new ProfileUpdated($user, 'profile_image_updated'));

        return Storage::url($path);
    }

    /**
     * Update user basic profile with role-based restrictions
     */
    public function updateUserProfile(User $user, array $data): User
    {
        $roleConfig = $this->getRoleConfiguration($user->role);
        $editableFields = $roleConfig['editable_fields'] ?? [];

        // Filter data to only include editable fields
        $filteredData = array_intersect_key($data, array_flip($editableFields));

        // Handle profile picture upload separately if present
        if (isset($filteredData['profile_picture']) && $filteredData['profile_picture'] instanceof UploadedFile) {
            $this->uploadProfileImage($user, $filteredData['profile_picture']);
            unset($filteredData['profile_picture']);
        }

        if (!empty($filteredData)) {
            $user->update($filteredData);
        }

        $updatedUser = $user->fresh();

        // Fire event and send notification
        event(new ProfileUpdated($updatedUser, 'profile_updated', array_keys($filteredData)));
        $updatedUser->notify(new ProfileUpdateNotification('profile_updated'));

        return $updatedUser;
    }

    /**
     * Update provider profile
     */
    public function updateProviderProfile(User $user, array $data): ProviderProfile
    {
        if (!$user->providerProfile) {
            throw new \Exception('Provider profile not found');
        }

        $profile = $user->providerProfile;

        DB::beginTransaction();

        try {
            // Handle business license upload
            if (isset($data['business_license']) && $data['business_license'] instanceof UploadedFile) {
                // Delete old business license
                if ($profile->business_license) {
                    Storage::disk('public')->delete($profile->business_license);
                }

                $filename = 'license_' . $user->id . '_' . time() . '.' . $data['business_license']->getClientOriginalExtension();
                $data['business_license'] = $data['business_license']->storeAs('business_licenses', $filename, 'public');
            }

            // Handle certifications upload
            if (isset($data['certifications']) && is_array($data['certifications'])) {
                // Delete old certifications
                if ($profile->certifications) {
                    foreach ($profile->certifications as $oldCert) {
                        Storage::disk('public')->delete($oldCert);
                    }
                }

                $certificationPaths = [];
                foreach ($data['certifications'] as $index => $certification) {
                    if ($certification instanceof UploadedFile) {
                        $filename = 'cert_' . $user->id . '_' . time() . '_' . ($index + 1) . '.' . $certification->getClientOriginalExtension();
                        $certificationPaths[] = $certification->storeAs('certifications', $filename, 'public');
                    }
                }
                $data['certifications'] = $certificationPaths;
            }

            // Handle portfolio images upload
            if (isset($data['portfolio_images']) && is_array($data['portfolio_images'])) {
                // Delete old portfolio images
                if ($profile->portfolio_images) {
                    foreach ($profile->portfolio_images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }

                $portfolioPaths = [];
                foreach ($data['portfolio_images'] as $index => $image) {
                    if ($image instanceof UploadedFile) {
                        $filename = 'portfolio_' . $user->id . '_' . time() . '_' . ($index + 1) . '.' . $image->getClientOriginalExtension();
                        $portfolioPaths[] = $image->storeAs('portfolio', $filename, 'public');
                    }
                }
                $data['portfolio_images'] = $portfolioPaths;
            }

            $profile->update($data);

            DB::commit();

            // Fire event and send notification
            event(new ProfileUpdated($user, 'provider_profile_updated', array_keys($data)));
            $user->notify(new ProfileUpdateNotification('provider_documents_updated'));

            return $profile->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Change user password
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw new \Exception('Current password is incorrect');
        }

        $user->update(['password' => Hash::make($newPassword)]);

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        // Fire event and send notification
        event(new ProfileUpdated($user, 'password_changed'));
        $user->notify(new ProfileUpdateNotification('password_changed'));

        return true;
    }

    /**
     * Get user profile with provider profile if applicable
     */
    public function getUserProfile(User $user): array
    {
        $roleConfig = $this->getRoleConfiguration($user->role);

        $profileData = [
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
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
            ],
            'permissions' => [
                'editable_fields' => $roleConfig['editable_fields'] ?? [],
                'required_fields' => $roleConfig['required_fields'] ?? [],
                'restricted_fields' => $roleConfig['restricted_fields'] ?? [],
                'can_delete_account' => in_array($user->role, ['client', 'service_provider']),
                'can_change_email' => in_array($user->role, ['client', 'service_provider']),
                'can_upload_profile_picture' => true,
            ]
        ];

        // Add admin-specific data
        if ($user->role === 'admin') {
            $profileData['admin_info'] = [
                'created_users_count' => $user->createdUsers()->count(),
                'system_role' => 'System Administrator'
            ];
        }

        // Add staff-specific data
        if ($user->role === 'staff') {
            $profileData['staff_info'] = [
                'created_by' => $user->creator ? $user->creator->full_name : 'System',
                'created_by_id' => $user->created_by,
                'department' => 'Customer Support', // You can add this field to users table
                'permissions' => $user->permissions ?? [] // If you have a permissions system
            ];
        }

        // Add provider profile data if user is service provider
        if ($user->role === 'service_provider' && $user->providerProfile) {
            $profile = $user->providerProfile;
            $profileData['provider_profile'] = [
                'id' => $profile->id,
                'business_name' => $profile->business_name,
                'years_of_experience' => $profile->years_of_experience,
                'service_area_radius' => $profile->service_area_radius,
                'bio' => $profile->bio,
                'verification_status' => $profile->verification_status,
                'verification_notes' => $profile->verification_notes,
                'average_rating' => $profile->average_rating,
                'total_reviews' => $profile->total_reviews,
                'total_earnings' => $profile->total_earnings,
                'is_available' => $profile->is_available,
                'business_license_url' => $profile->business_license_url,
                'certification_urls' => $profile->certification_urls,
                'portfolio_image_urls' => $profile->portfolio_image_urls,
                'verified_at' => $profile->verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $profile->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $profile->updated_at->format('Y-m-d H:i:s'),
            ];

            // Add provider statistics
            $profileData['provider_statistics'] = [
                'total_services' => $user->services()->count(),
                'active_services' => $user->services()->where('is_active', true)->count(),
                'total_appointments' => $user->providerAppointments()->count(),
                'completed_appointments' => $user->providerAppointments()->where('status', 'completed')->count(),
                'pending_appointments' => $user->providerAppointments()->whereIn('status', ['pending', 'confirmed'])->count(),
                'this_month_earnings' => $user->providerAppointments()
                    ->where('status', 'completed')
                    ->whereMonth('completed_at', now()->month)
                    ->whereYear('completed_at', now()->year)
                    ->sum('total_price'),
                'total_quotes_sent' => $user->quotes()->count(),
                'accepted_quotes' => $user->quotes()->where('status', 'accepted')->count(),
            ];
        }

        // Add client-specific data
        if ($user->role === 'client') {
            $profileData['client_statistics'] = [
                'total_appointments' => $user->clientAppointments()->count(),
                'completed_appointments' => $user->clientAppointments()->where('status', 'completed')->count(),
                'total_spent' => $user->clientAppointments()->where('status', 'completed')->sum('total_price'),
                'favorite_providers' => [], // You can implement this feature
                'total_reviews_given' => $user->reviewsGiven()->count(),
            ];
        }

        return $profileData;
    }

    /**
     * Toggle provider availability
     */
    public function toggleProviderAvailability(User $user): ProviderProfile
    {
        if (!$user->providerProfile) {
            throw new \Exception('Provider profile not found');
        }

        $profile = $user->providerProfile;
        $newStatus = !$profile->is_available;

        $profile->update(['is_available' => $newStatus]);

        // Fire event
        event(new ProfileUpdated($user, 'availability_toggled', ['is_available' => $newStatus]));

        return $profile->fresh();
    }

    /**
     * Delete profile picture
     */
    public function deleteProfilePicture(User $user): bool
    {
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->update(['profile_picture' => null]);

            // Fire event
            event(new ProfileUpdated($user, 'profile_image_deleted'));

            return true;
        }

        return false;
    }

    /**
     * Delete provider document
     */
    public function deleteProviderDocument(User $user, string $documentType, int $index = null): bool
    {
        if (!$user->providerProfile) {
            throw new \Exception('Provider profile not found');
        }

        $profile = $user->providerProfile;

        switch ($documentType) {
            case 'business_license':
                if ($profile->business_license) {
                    Storage::disk('public')->delete($profile->business_license);
                    $profile->update(['business_license' => null]);

                    // Fire event
                    event(new ProfileUpdated($user, 'business_license_deleted'));

                    return true;
                }
                break;

            case 'certification':
                if ($profile->certifications && isset($profile->certifications[$index])) {
                    $certifications = $profile->certifications;
                    Storage::disk('public')->delete($certifications[$index]);
                    unset($certifications[$index]);
                    $profile->update(['certifications' => array_values($certifications)]);

                    // Fire event
                    event(new ProfileUpdated($user, 'certification_deleted', ['index' => $index]));

                    return true;
                }
                break;

            case 'portfolio_image':
                if ($profile->portfolio_images && isset($profile->portfolio_images[$index])) {
                    $portfolioImages = $profile->portfolio_images;
                    Storage::disk('public')->delete($portfolioImages[$index]);
                    unset($portfolioImages[$index]);
                    $profile->update(['portfolio_images' => array_values($portfolioImages)]);

                    // Fire event
                    event(new ProfileUpdated($user, 'portfolio_image_deleted', ['index' => $index]));

                    return true;
                }
                break;
        }

        return false;
    }

    /**
     * Get provider profile statistics
     */
    public function getProviderStatistics(User $user): array
    {
        if ($user->role !== 'service_provider') {
            throw new \Exception('User is not a service provider');
        }

        $currentMonth = now()->month;
        $currentYear = now()->year;
        $lastMonth = now()->subMonth();

        return [
            'services' => [
                'total' => $user->services()->count(),
                'active' => $user->services()->where('is_active', true)->count(),
                'inactive' => $user->services()->where('is_active', false)->count(),
                'average_rating' => $user->services()->avg('average_rating') ?: 0,
            ],
            'appointments' => [
                'total' => $user->providerAppointments()->count(),
                'completed' => $user->providerAppointments()->where('status', 'completed')->count(),
                'pending' => $user->providerAppointments()->whereIn('status', ['pending', 'confirmed'])->count(),
                'cancelled' => $user->providerAppointments()->where('status', 'like', 'cancelled%')->count(),
                'this_month' => $user->providerAppointments()
                    ->whereMonth('appointment_date', $currentMonth)
                    ->whereYear('appointment_date', $currentYear)
                    ->count(),
                'last_month' => $user->providerAppointments()
                    ->whereMonth('appointment_date', $lastMonth->month)
                    ->whereYear('appointment_date', $lastMonth->year)
                    ->count(),
            ],
            'earnings' => [
                'total' => $user->providerProfile->total_earnings ?? 0,
                'this_month' => $user->providerAppointments()
                    ->where('status', 'completed')
                    ->whereMonth('completed_at', $currentMonth)
                    ->whereYear('completed_at', $currentYear)
                    ->sum('total_price'),
                'last_month' => $user->providerAppointments()
                    ->where('status', 'completed')
                    ->whereMonth('completed_at', $lastMonth->month)
                    ->whereYear('completed_at', $lastMonth->year)
                    ->sum('total_price'),
                'average_per_appointment' => $user->providerAppointments()
                    ->where('status', 'completed')
                    ->avg('total_price') ?: 0,
            ],
            'ratings' => [
                'average' => $user->providerProfile->average_rating ?? 0,
                'total_reviews' => $user->providerProfile->total_reviews ?? 0,
                'five_stars' => $user->providerAppointments()->where('status', 'completed')->where('provider_rating', 5)->count(),
                'four_stars' => $user->providerAppointments()->where('status', 'completed')->where('provider_rating', 4)->count(),
                'three_stars' => $user->providerAppointments()->where('status', 'completed')->where('provider_rating', 3)->count(),
                'two_stars' => $user->providerAppointments()->where('status', 'completed')->where('provider_rating', 2)->count(),
                'one_star' => $user->providerAppointments()->where('status', 'completed')->where('provider_rating', 1)->count(),
            ],
            'quotes' => [
                'total_sent' => $user->quotes()->count(),
                'accepted' => $user->quotes()->where('status', 'accepted')->count(),
                'pending' => $user->quotes()->where('status', 'pending')->count(),
                'declined' => $user->quotes()->where('status', 'declined')->count(),
                'acceptance_rate' => $user->quotes()->count() > 0
                    ? round(($user->quotes()->where('status', 'accepted')->count() / $user->quotes()->count()) * 100, 1)
                    : 0,
            ],
            'performance' => [
                'response_time' => '2 hours', // You can calculate this based on quote response times
                'completion_rate' => $user->providerAppointments()->count() > 0
                    ? round(($user->providerAppointments()->where('status', 'completed')->count() / $user->providerAppointments()->count()) * 100, 1)
                    : 0,
                'customer_satisfaction' => $user->providerProfile->average_rating ?? 0,
            ]
        ];
    }

    /**
     * Deactivate user account
     */
    public function deactivateAccount(User $user, string $reason = null): bool
    {
        // Only clients and providers can deactivate their own accounts
        if (!in_array($user->role, ['client', 'service_provider'])) {
            throw new \Exception('Account deactivation not allowed for this role');
        }

        DB::beginTransaction();

        try {
            // Set account as inactive
            $user->update([
                'is_active' => false,
                'deactivated_at' => now(),
                'deactivation_reason' => $reason
            ]);

            // If provider, set as unavailable
            if ($user->role === 'service_provider' && $user->providerProfile) {
                $user->providerProfile->update(['is_available' => false]);
            }

            // Revoke all tokens
            $user->tokens()->delete();

            DB::commit();

            // Fire event
            event(new ProfileUpdated($user, 'account_deactivated', ['reason' => $reason]));

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reorder portfolio images
     */
    public function reorderPortfolioImages(User $user, array $imageOrder): ProviderProfile
    {
        if (!$user->providerProfile) {
            throw new \Exception('Provider profile not found');
        }

        $profile = $user->providerProfile;
        $currentImages = $profile->portfolio_images ?? [];

        // Validate that all indices exist
        foreach ($imageOrder as $index) {
            if (!isset($currentImages[$index])) {
                throw new \Exception('Invalid image index: ' . $index);
            }
        }

        // Reorder images based on provided order
        $reorderedImages = [];
        foreach ($imageOrder as $index) {
            $reorderedImages[] = $currentImages[$index];
        }

        $profile->update(['portfolio_images' => $reorderedImages]);

        // Fire event
        event(new ProfileUpdated($user, 'portfolio_reordered'));

        return $profile->fresh();
    }
}
