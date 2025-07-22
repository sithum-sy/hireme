<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProviderProfileService
{
    // protected ActivityService $activityService;

    // public function __construct(ActivityService $activityService)
    // {
    //     $this->activityService = $activityService;
    // }
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
            // $this->activityService->logUserActivity(
            //     'update',
            //     $user,
            //     [
            //         'action' => 'provider_profile_updated',
            //         'updated_fields' => array_keys($data),
            //         'user_role' => $user->role
            //     ]
            // );

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
    public function createProviderProfile(User $user, array $userData = []): ProviderProfile
    {
        // Extract provider-specific data from userData
        $providerData = [
            'user_id' => $user->id,
            'bio' => $userData['bio'] ?? '',
            'years_of_experience' => $userData['years_of_experience'] ?? 0,
            'service_area_radius' => $userData['service_area_radius'] ?? 10,
            'business_name' => $userData['business_name'] ?? null,
            'is_available' => true,
            'verification_status' => 'pending',
        ];

        // Handle file uploads if present
        if (!empty($userData['business_license'])) {
            // Store business license file
            $filename = 'business_license_' . Str::uuid() . '.' . $userData['business_license']->getClientOriginalExtension();
            
            // Create the business_licenses directory if it doesn't exist
            $businessDir = public_path('images/provider_documents/business_licenses');
            if (!file_exists($businessDir)) {
                mkdir($businessDir, 0755, true);
            }
            
            $relativePath = 'images/provider_documents/business_licenses/' . $filename;
            $userData['business_license']->move($businessDir, $filename);
            $providerData['business_license'] = $relativePath;
        }

        if (!empty($userData['certifications'])) {
            $certificationPaths = [];
            
            // Create the certifications directory if it doesn't exist
            $certDir = public_path('images/provider_documents/certifications');
            if (!file_exists($certDir)) {
                mkdir($certDir, 0755, true);
            }
            
            foreach ($userData['certifications'] as $cert) {
                $filename = 'cert_' . Str::uuid() . '.' . $cert->getClientOriginalExtension();
                $relativePath = 'images/provider_documents/certifications/' . $filename;
                $cert->move($certDir, $filename);
                $certificationPaths[] = $relativePath;
            }
            $providerData['certifications'] = $certificationPaths;
        }

        if (!empty($userData['portfolio_images'])) {
            $portfolioPaths = [];
            
            // Create the portfolio directory if it doesn't exist
            $portfolioDir = public_path('images/provider_documents/portfolio');
            if (!file_exists($portfolioDir)) {
                mkdir($portfolioDir, 0755, true);
            }
            
            foreach ($userData['portfolio_images'] as $image) {
                $filename = 'portfolio_' . Str::uuid() . '.' . $image->getClientOriginalExtension();
                $relativePath = 'images/provider_documents/portfolio/' . $filename;
                $image->move($portfolioDir, $filename);
                $portfolioPaths[] = $relativePath;
            }
            $providerData['portfolio_images'] = $portfolioPaths;
        }

        return ProviderProfile::create($providerData);
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
                    asset($profile->business_license_path) : null,
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
                'url' => asset($path),
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
                'url' => asset($path),
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
        // Check if thumbnail exists, otherwise return original
        $thumbnailPath = str_replace('portfolio/', 'portfolio/thumbnails/', $path);
        if (file_exists(public_path($thumbnailPath))) {
            return asset($thumbnailPath);
        }
        
        // Fallback to original image
        return asset($path);
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
