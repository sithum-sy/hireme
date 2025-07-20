<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProviderProfileService
{
    /**
     * Create provider profile with uploaded files
     */
    public function createProviderProfile(User $user, array $data): ProviderProfile
    {
        // Handle business license upload
        $businessLicensePath = null;
        if (isset($data['business_license']) && $data['business_license'] instanceof UploadedFile) {
            $businessLicensePath = $this->uploadFile(
                $data['business_license'],
                'business_licenses',
                'license_' . $user->id
            );
        }

        // Handle certifications upload
        $certificationPaths = [];
        if (isset($data['certifications']) && is_array($data['certifications'])) {
            foreach ($data['certifications'] as $index => $certification) {
                if ($certification instanceof UploadedFile) {
                    $certificationPaths[] = $this->uploadFile(
                        $certification,
                        'certifications',
                        'cert_' . $user->id . '_' . ($index + 1)
                    );
                }
            }
        }

        // Handle portfolio images upload
        $portfolioPaths = [];
        if (isset($data['portfolio_images']) && is_array($data['portfolio_images'])) {
            foreach ($data['portfolio_images'] as $index => $image) {
                if ($image instanceof UploadedFile) {
                    $portfolioPaths[] = $this->uploadFile(
                        $image,
                        'portfolio',
                        'portfolio_' . $user->id . '_' . ($index + 1)
                    );
                }
            }
        }

        // Create provider profile
        $providerProfile = ProviderProfile::create([
            'user_id' => $user->id,
            'business_name' => $data['business_name'] ?? null,
            'business_license' => $businessLicensePath,
            'years_of_experience' => $data['years_of_experience'] ?? 0,
            'service_area_radius' => $data['service_area_radius'] ?? 10,
            'bio' => $data['bio'] ?? null,
            'certifications' => $certificationPaths,
            'portfolio_images' => $portfolioPaths,
            'verification_status' => 'pending',
            'is_available' => true,
        ]);

        return $providerProfile;
    }

    /**
     * Upload file and return storage path
     */
    private function uploadFile(UploadedFile $file, string $directory, string $prefix = null): string
    {
        $filename = ($prefix ? $prefix . '_' : '') . Str::uuid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs($directory, $filename, 'public');
    }

    /**
     * Update provider profile
     */
    public function updateProviderProfile(ProviderProfile $profile, array $data): ProviderProfile
    {
        // Handle business license update
        if (isset($data['business_license']) && $data['business_license'] instanceof UploadedFile) {
            // Delete old file
            if ($profile->business_license) {
                Storage::disk('public')->delete($profile->business_license);
            }

            $data['business_license'] = $this->uploadFile(
                $data['business_license'],
                'business_licenses',
                'license_' . $profile->user_id
            );
        }

        // Handle certifications update
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
                    $certificationPaths[] = $this->uploadFile(
                        $certification,
                        'certifications',
                        'cert_' . $profile->user_id . '_' . ($index + 1)
                    );
                }
            }
            $data['certifications'] = $certificationPaths;
        }

        // Handle portfolio images update
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
                    $portfolioPaths[] = $this->uploadFile(
                        $image,
                        'portfolio',
                        'portfolio_' . $profile->user_id . '_' . ($index + 1)
                    );
                }
            }
            $data['portfolio_images'] = $portfolioPaths;
        }

        $profile->update($data);
        return $profile->fresh();
    }

    /**
     * Delete provider profile and associated files
     */
    public function deleteProviderProfile(ProviderProfile $profile): bool
    {
        // Delete business license
        if ($profile->business_license) {
            Storage::disk('public')->delete($profile->business_license);
        }

        // Delete certifications
        if ($profile->certifications) {
            foreach ($profile->certifications as $cert) {
                Storage::disk('public')->delete($cert);
            }
        }

        // Delete portfolio images
        if ($profile->portfolio_images) {
            foreach ($profile->portfolio_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        return $profile->delete();
    }
}
