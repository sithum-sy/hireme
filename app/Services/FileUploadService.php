<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class FileUploadService
{
    protected ActivityService $activityService;
    protected ?ImageManager $imageManager;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;

        // Initialize ImageManager with better error handling
        try {
            // Check if GD extension is available
            if (!extension_loaded('gd')) {
                Log::warning('GD PHP extension is not installed. Image processing will be disabled.');
                Log::info('To enable image processing: 1) Edit php.ini 2) Uncomment extension=gd 3) Restart Apache');
                $this->imageManager = null;
                return;
            }
            
            $this->imageManager = new ImageManager(new Driver());
            Log::info('ImageManager initialized successfully with GD driver.');
        } catch (\Exception $e) {
            // Log the error but don't fail the service
            Log::warning('ImageManager initialization failed: ' . $e->getMessage());
            Log::info('Image uploads will still work but images will not be resized/optimized.');
            $this->imageManager = null;
        }
    }
    /**
     * Upload profile image
     */
    public function uploadProfileImage(User $user, UploadedFile $file): string
    {
        // Delete existing profile image
        $this->deleteProfileImage($user);

        // Generate unique filename
        $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = 'profile-images/' . $filename;

        // Resize and optimize image (maintain aspect ratio)
        if ($this->imageManager) {
            try {
                $image = $this->imageManager->read($file)
                    ->scaleDown(width: 400, height: 400)
                    ->toJpeg(85);

                // Store the processed image
                Storage::disk('public')->put($path, (string) $image);
            } catch (\Exception $e) {
                Log::warning('Image processing failed, storing original: ' . $e->getMessage());
                // Fallback: store original file
                $file->storeAs('profile-images', $filename, 'public');
            }
        } else {
            // Fallback: store original file without processing
            $file->storeAs('profile-images', $filename, 'public');
        }

        // Update user profile picture path
        $user->update(['profile_picture' => $path]);

        // Log the upload
        $this->activityService->logUserActivity(
            'profile_image_upload',
            $user,
            [
                'action' => 'profile_image_uploaded',
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientOriginalExtension()
            ]
        );

        return $path;
    }

    /**
     * Delete profile image
     */
    public function deleteProfileImage(User $user): void
    {
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->update(['profile_picture' => null]);

            $this->activityService->logUserActivity(
                'profile_image_delete',
                $user,
                [
                    'action' => 'profile_image_deleted',
                    'deleted_path' => $user->profile_picture
                ]
            );
        }
    }

    /**
     * Upload provider documents
     */
    public function uploadProviderDocuments(User $user, array $files): array
    {
        $uploadedFiles = [];
        $profile = $user->providerProfile;

        if (!$profile) {
            throw new \Exception('Provider profile not found');
        }

        // Upload business license
        if (isset($files['business_license'])) {
            $path = $this->uploadBusinessLicense($profile, $files['business_license']);
            $uploadedFiles['business_license'] = $path;
        }

        // Upload certifications
        if (isset($files['certifications'])) {
            $paths = $this->uploadCertifications($profile, $files['certifications']);
            $uploadedFiles['certifications'] = $paths;
        }

        // Upload portfolio images
        if (isset($files['portfolio_images'])) {
            $paths = $this->uploadPortfolioImages($profile, $files['portfolio_images']);
            $uploadedFiles['portfolio_images'] = $paths;
        }

        return $uploadedFiles;
    }

    /**
     * Upload business license
     */
    protected function uploadBusinessLicense(ProviderProfile $profile, UploadedFile $file): string
    {
        // Delete existing business license
        if ($profile->business_license_path) {
            Storage::disk('public')->delete($profile->business_license_path);
        }

        $filename = 'business_license_' . $profile->user_id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = 'provider-documents/business-licenses/' . $filename;

        // Store the file
        $file->storeAs('provider-documents/business-licenses', $filename, 'public');

        // Update profile
        $profile->update([
            'business_license_path' => $path,
            'business_license_uploaded_at' => now(),
        ]);

        return $path;
    }

    /**
     * Upload certifications
     */
    protected function uploadCertifications(ProviderProfile $profile, array $files): array
    {
        $paths = [];
        $existingPaths = $profile->certification_paths ?
            json_decode($profile->certification_paths, true) : [];

        foreach ($files as $file) {
            $filename = 'certification_' . $profile->user_id . '_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = 'provider-documents/certifications/' . $filename;

            $file->storeAs('provider-documents/certifications', $filename, 'public');
            $paths[] = $path;
        }

        // Merge with existing paths
        $allPaths = array_merge($existingPaths, $paths);

        // Update profile
        $profile->update([
            'certification_paths' => json_encode($allPaths),
        ]);

        return $paths;
    }

    /**
     * Upload portfolio images
     */
    protected function uploadPortfolioImages(ProviderProfile $profile, array $files): array
    {
        $paths = [];
        $existingPaths = $profile->portfolio_image_paths ?
            json_decode($profile->portfolio_image_paths, true) : [];

        foreach ($files as $file) {
            $filename = 'portfolio_' . $profile->user_id . '_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = 'provider-documents/portfolio/' . $filename;

            // Resize and optimize image (maintain aspect ratio)
            if ($this->imageManager) {
                try {
                    $image = $this->imageManager->read($file)
                        ->scaleDown(width: 1200, height: 1200)
                        ->toJpeg(90);

                    Storage::disk('public')->put($path, (string) $image);

                    // Generate thumbnail (maintain aspect ratio)
                    $thumbnailPath = 'provider-documents/portfolio/thumbnails/' . $filename;
                    $thumbnail = $this->imageManager->read($file)
                        ->scaleDown(width: 300, height: 300)
                        ->toJpeg(80);

                    Storage::disk('public')->put($thumbnailPath, (string) $thumbnail);
                } catch (\Exception $e) {
                    Log::warning('Portfolio image processing failed, storing original: ' . $e->getMessage());
                    // Fallback: store original file
                    $file->storeAs('provider-documents/portfolio', $filename, 'public');
                }
            } else {
                // Fallback: store original file without processing
                $file->storeAs('provider-documents/portfolio', $filename, 'public');
            }

            $paths[] = $path;
        }

        // Merge with existing paths
        $allPaths = array_merge($existingPaths, $paths);

        // Update profile
        $profile->update([
            'portfolio_image_paths' => json_encode($allPaths),
        ]);

        return $paths;
    }

    /**
     * Delete provider document
     */
    public function deleteProviderDocument(User $user, string $documentType, ?int $index = null): void
    {
        $profile = $user->providerProfile;

        if (!$profile) {
            throw new \Exception('Provider profile not found');
        }

        switch ($documentType) {
            case 'business_license':
                if ($profile->business_license_path) {
                    Storage::disk('public')->delete($profile->business_license_path);
                    $profile->update([
                        'business_license_path' => null,
                        'business_license_uploaded_at' => null,
                    ]);
                }
                break;

            case 'certification':
                $this->deleteCertification($profile, $index);
                break;

            case 'portfolio_image':
                $this->deletePortfolioImage($profile, $index);
                break;

            default:
                throw new \Exception('Invalid document type');
        }

        $this->activityService->log(
            'document_delete',
            "Deleted {$documentType} document for provider {$user->full_name}",
            $profile,
            [
                'action' => 'document_deleted',
                'document_type' => $documentType,
                'index' => $index,
                'user_id' => $user->id
            ]
        );
    }

    /**
     * Delete specific certification
     */
    protected function deleteCertification(ProviderProfile $profile, ?int $index): void
    {
        if (is_null($index)) {
            return;
        }

        $paths = $profile->certification_paths ?
            json_decode($profile->certification_paths, true) : [];

        if (isset($paths[$index])) {
            Storage::disk('public')->delete($paths[$index]);
            unset($paths[$index]);

            $profile->update([
                'certification_paths' => json_encode(array_values($paths)),
            ]);
        }
    }

    /**
     * Delete specific portfolio image
     */
    protected function deletePortfolioImage(ProviderProfile $profile, ?int $index): void
    {
        if (is_null($index)) {
            return;
        }

        $paths = $profile->portfolio_image_paths ?
            json_decode($profile->portfolio_image_paths, true) : [];

        if (isset($paths[$index])) {
            Storage::disk('public')->delete($paths[$index]);

            // Also delete thumbnail
            $thumbnailPath = str_replace('portfolio/', 'portfolio/thumbnails/', $paths[$index]);
            Storage::disk('public')->delete($thumbnailPath);

            unset($paths[$index]);

            $profile->update([
                'portfolio_image_paths' => json_encode(array_values($paths)),
            ]);
        }
    }
}
