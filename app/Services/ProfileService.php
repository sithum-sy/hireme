<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Events\ProfileUpdated;
use App\Notifications\ProfileUpdateNotification;

class ProfileService
{
    /**
     * Update user basic profile
     */
    public function updateUserProfile(User $user, array $data): User
    {
        $originalData = $user->toArray();

        // Handle profile picture upload
        if (isset($data['profile_picture']) && $data['profile_picture'] instanceof UploadedFile) {
            // Delete old profile picture
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            $filename = 'profile_' . $user->id . '_' . time() . '.' . $data['profile_picture']->getClientOriginalExtension();
            $data['profile_picture'] = $data['profile_picture']->storeAs('profile_pictures', $filename, 'public');
        }

        $user->update($data);
        $updatedUser = $user->fresh();

        // Fire event and send notification
        event(new ProfileUpdated($updatedUser, 'profile_updated', array_keys($data)));
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
            ]
        ];

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
                'active_services' => $user->services()->active()->count(),
                'total_appointments' => $user->providerAppointments()->count(),
                'completed_appointments' => $user->providerAppointments()->completed()->count(),
                'pending_appointments' => $user->providerAppointments()->pending()->count(),
                'this_month_earnings' => $user->providerAppointments()
                    ->completed()
                    ->whereMonth('completed_at', now()->month)
                    ->whereYear('completed_at', now()->year)
                    ->sum('total_price'),
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
        $profile->update(['is_available' => !$profile->is_available]);

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
                    return true;
                }
                break;

            case 'certification':
                if ($profile->certifications && isset($profile->certifications[$index])) {
                    $certifications = $profile->certifications;
                    Storage::disk('public')->delete($certifications[$index]);
                    unset($certifications[$index]);
                    $profile->update(['certifications' => array_values($certifications)]);
                    return true;
                }
                break;

            case 'portfolio_image':
                if ($profile->portfolio_images && isset($profile->portfolio_images[$index])) {
                    $portfolioImages = $profile->portfolio_images;
                    Storage::disk('public')->delete($portfolioImages[$index]);
                    unset($portfolioImages[$index]);
                    $profile->update(['portfolio_images' => array_values($portfolioImages)]);
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
                'active' => $user->services()->active()->count(),
                'inactive' => $user->services()->where('is_active', false)->count(),
            ],
            'appointments' => [
                'total' => $user->providerAppointments()->count(),
                'completed' => $user->providerAppointments()->completed()->count(),
                'pending' => $user->providerAppointments()->pending()->count(),
                'confirmed' => $user->providerAppointments()->confirmed()->count(),
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
                    ->completed()
                    ->whereMonth('completed_at', $currentMonth)
                    ->whereYear('completed_at', $currentYear)
                    ->sum('total_price'),
                'last_month' => $user->providerAppointments()
                    ->completed()
                    ->whereMonth('completed_at', $lastMonth->month)
                    ->whereYear('completed_at', $lastMonth->year)
                    ->sum('total_price'),
            ],
            'ratings' => [
                'average' => $user->providerProfile->average_rating ?? 0,
                'total_reviews' => $user->providerProfile->total_reviews ?? 0,
                'five_stars' => $user->providerAppointments()->completed()->where('provider_rating', 5)->count(),
                'four_stars' => $user->providerAppointments()->completed()->where('provider_rating', 4)->count(),
                'three_stars' => $user->providerAppointments()->completed()->where('provider_rating', 3)->count(),
                'two_stars' => $user->providerAppointments()->completed()->where('provider_rating', 2)->count(),
                'one_star' => $user->providerAppointments()->completed()->where('provider_rating', 1)->count(),
            ],
        ];
    }
}
