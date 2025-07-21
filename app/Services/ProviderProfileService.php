<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Support\Facades\DB;

class ProviderProfileService
{
    protected ActivityService $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }
    /**
     * Get provider profile data
     */
    public function getProviderProfile(User $user): array
    {
        if ($user->role !== 'service_provider') {
            throw new \Exception('User is not a service provider');
        }

        $profile = $user->providerProfile;
        if (!$profile) {
            // Create provider profile if it doesn't exist
            $profile = $this->createProviderProfile($user);
        }

        return [
            'user' => $user->toArray(),
            'provider_profile' => $profile->toArray(),
            'statistics' => $this->getProviderStatistics($user),
            'verification' => $this->getVerificationStatus($profile),
            'documents' => $this->getDocuments($profile),
        ];
    }

    /**
     * Update provider profile
     */
    public function updateProviderProfile(User $user, array $data): array
    {
        DB::beginTransaction();

        try {
            // Update user fields
            $userFields = ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'];
            $userData = array_intersect_key($data, array_flip($userFields));

            if (!empty($userData)) {
                $user->update($userData);
            }

            // Update provider profile fields
            $providerFields = [
                'business_name',
                'bio',
                'years_of_experience',
                'service_area_radius',
                'is_available'
            ];
            $providerData = array_intersect_key($data, array_flip($providerFields));

            if (!empty($providerData)) {
                $profile = $user->providerProfile ?? $this->createProviderProfile($user);
                $profile->update($providerData);
            }

            // Log the update
            $this->activityService->logUserActivity(
                'update',
                $user,
                [
                    'action' => 'provider_profile_updated',
                    'updated_fields' => array_keys($data),
                    'user_role' => $user->role
                ]
            );

            DB::commit();

            return $this->getProviderProfile($user);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create provider profile
     */
    protected function createProviderProfile(User $user): ProviderProfile
    {
        return ProviderProfile::create([
            'user_id' => $user->id,
            'bio' => '',
            'years_of_experience' => 0,
            'service_area_radius' => 10,
            'is_available' => true,
            'verification_status' => 'pending',
        ]);
    }

    /**
     * Get provider statistics
     */
    public function getProviderStatistics(User $user): array
    {
        return [
            'total_services' => $user->services()->count(),
            'active_services' => $user->services()->where('is_active', true)->count(),
            'total_appointments' => $user->appointments()->count(),
            'completed_appointments' => $user->appointments()->where('status', 'completed')->count(),
            'pending_appointments' => $user->appointments()->where('status', 'pending')->count(),
            'cancelled_appointments' => $user->appointments()->where('status', 'cancelled')->count(),
            'today_appointments' => $user->appointments()->whereDate('scheduled_at', today())->count(),
            'this_week_appointments' => $user->appointments()
                ->whereBetween('scheduled_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'this_month_appointments' => $user->appointments()
                ->whereMonth('scheduled_at', now()->month)
                ->count(),
            'monthly_earnings' => $user->payments()
                ->whereMonth('created_at', now()->month)
                ->where('status', 'completed')
                ->sum('amount'),
            'total_earnings' => $user->payments()
                ->where('status', 'completed')
                ->sum('amount'),
            'average_rating' => round($user->reviews()->avg('rating') ?? 0, 1),
            'total_reviews' => $user->reviews()->count(),
            'five_star_reviews' => $user->reviews()->where('rating', 5)->count(),
            'response_rate' => $this->calculateResponseRate($user),
            'completion_rate' => $this->calculateCompletionRate($user),
        ];
    }

    /**
     * Get verification status
     */
    protected function getVerificationStatus(ProviderProfile $profile): array
    {
        return [
            'status' => $profile->verification_status,
            'verified_at' => $profile->verified_at,
            'verification_notes' => $profile->verification_notes,
            'documents_submitted' => $this->getDocumentSubmissionStatus($profile),
            'requirements_met' => $this->checkVerificationRequirements($profile),
        ];
    }

    /**
     * Get documents information
     */
    protected function getDocuments(ProviderProfile $profile): array
    {
        return [
            'business_license' => [
                'uploaded' => !empty($profile->business_license_path),
                'url' => $profile->business_license_path ?
                    asset('storage/' . $profile->business_license_path) : null,
                'uploaded_at' => $profile->business_license_uploaded_at,
            ],
            'certifications' => $this->getCertifications($profile),
            'portfolio_images' => $this->getPortfolioImages($profile),
        ];
    }

    /**
     * Get certifications
     */
    protected function getCertifications(ProviderProfile $profile): array
    {
        if (empty($profile->certification_paths)) {
            return [];
        }

        $paths = json_decode($profile->certification_paths, true) ?? [];

        return array_map(function ($path) {
            return [
                'url' => asset('storage/' . $path),
                'filename' => basename($path),
                'uploaded_at' => null, // You might want to store individual upload dates
            ];
        }, $paths);
    }

    /**
     * Get portfolio images
     */
    protected function getPortfolioImages(ProviderProfile $profile): array
    {
        if (empty($profile->portfolio_image_paths)) {
            return [];
        }

        $paths = json_decode($profile->portfolio_image_paths, true) ?? [];

        return array_map(function ($path) {
            return [
                'url' => asset('storage/' . $path),
                'thumbnail_url' => $this->getThumbnailUrl($path),
                'filename' => basename($path),
                'uploaded_at' => null,
            ];
        }, $paths);
    }

    /**
     * Get thumbnail URL
     */
    protected function getThumbnailUrl(string $path): string
    {
        // Implement thumbnail generation logic
        // For now, return the original image
        return asset('storage/' . $path);
    }

    /**
     * Calculate response rate
     */
    protected function calculateResponseRate(User $user): float
    {
        $totalRequests = $user->serviceRequests()->count();
        if ($totalRequests === 0) {
            return 100.0;
        }

        $respondedRequests = $user->serviceRequests()
            ->whereNotNull('responded_at')
            ->count();

        return round(($respondedRequests / $totalRequests) * 100, 1);
    }

    /**
     * Calculate completion rate
     */
    protected function calculateCompletionRate(User $user): float
    {
        $totalAppointments = $user->appointments()->count();
        if ($totalAppointments === 0) {
            return 100.0;
        }

        $completedAppointments = $user->appointments()
            ->where('status', 'completed')
            ->count();

        return round(($completedAppointments / $totalAppointments) * 100, 1);
    }

    /**
     * Get document submission status
     */
    protected function getDocumentSubmissionStatus(ProviderProfile $profile): array
    {
        return [
            'business_license' => !empty($profile->business_license_path),
            'certifications' => !empty($profile->certification_paths),
            'portfolio_images' => !empty($profile->portfolio_image_paths),
        ];
    }

    /**
     * Check verification requirements
     */
    protected function checkVerificationRequirements(ProviderProfile $profile): array
    {
        return [
            'profile_complete' => $this->isProfileComplete($profile),
            'documents_uploaded' => !empty($profile->business_license_path),
            'services_added' => $profile->user->services()->count() > 0,
            'bio_adequate' => strlen($profile->bio) >= 50,
        ];
    }

    /**
     * Check if profile is complete
     */
    protected function isProfileComplete(ProviderProfile $profile): bool
    {
        $user = $profile->user;

        return !empty($user->first_name) &&
            !empty($user->last_name) &&
            !empty($user->email) &&
            !empty($user->contact_number) &&
            !empty($user->address) &&
            !empty($profile->bio) &&
            $profile->years_of_experience >= 0 &&
            $profile->service_area_radius > 0;
    }
}
