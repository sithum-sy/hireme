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
        
        // Create the profile_pictures directory if it doesn't exist
        $profileDir = public_path('images/profile_pictures');
        if (!file_exists($profileDir)) {
            mkdir($profileDir, 0755, true);
        }

        $relativePath = 'images/profile_pictures/' . $filename;

        // Resize and optimize image (maintain aspect ratio)
        if ($this->imageManager) {
            try {
                $image = $this->imageManager->read($file)
                    ->scaleDown(width: 400, height: 400)
                    ->toJpeg(85);

                // Store the processed image directly to public/images/profile_pictures
                file_put_contents(public_path($relativePath), (string) $image);
            } catch (\Exception $e) {
                Log::warning('Image processing failed, storing original: ' . $e->getMessage());
                // Fallback: store original file
                $file->move($profileDir, $filename);
            }
        } else {
            // Fallback: store original file without processing
            $file->move($profileDir, $filename);
        }

        // Update user profile picture path
        $user->update(['profile_picture' => $relativePath]);

        // Log the upload
        $this->activityService->logUserActivity(
            'profile_image_upload',
            $user,
            [
                'action' => 'profile_image_uploaded',
                'file_path' => $relativePath,
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientOriginalExtension()
            ]
        );

        return $relativePath;
    }

    /**
     * Delete profile image
     */
    public function deleteProfileImage(User $user): void
    {
        if ($user->profile_picture) {
            $fullPath = public_path($user->profile_picture);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            $this->activityService->logUserActivity(
                'profile_image_delete',
                $user,
                [
                    'action' => 'profile_image_deleted',
                    'deleted_path' => $user->profile_picture
                ]
            );
            
            $user->update(['profile_picture' => null]);
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
            $fullPath = public_path($profile->business_license_path);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }

        $filename = 'business_license_' . $profile->user_id . '_' . time() . '.' . $file->getClientOriginalExtension();
        
        // Create the business_licenses directory if it doesn't exist
        $businessDir = public_path('images/provider_documents/business_licenses');
        if (!file_exists($businessDir)) {
            mkdir($businessDir, 0755, true);
        }

        $relativePath = 'images/provider_documents/business_licenses/' . $filename;

        // Move the file to public/images/provider_documents/business_licenses
        $file->move($businessDir, $filename);

        // Update profile
        $profile->update([
            'business_license_path' => $relativePath,
            'business_license_uploaded_at' => now(),
        ]);

        return $relativePath;
    }

    /**
     * Upload certifications
     */
    protected function uploadCertifications(ProviderProfile $profile, array $files): array
    {
        $paths = [];
        $existingPaths = $profile->certification_paths ?
            json_decode($profile->certification_paths, true) : [];

        // Create the certifications directory if it doesn't exist
        $certDir = public_path('images/provider_documents/certifications');
        if (!file_exists($certDir)) {
            mkdir($certDir, 0755, true);
        }

        foreach ($files as $file) {
            $filename = 'certification_' . $profile->user_id . '_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $relativePath = 'images/provider_documents/certifications/' . $filename;

            // Move the file to public/images/provider_documents/certifications
            $file->move($certDir, $filename);
            $paths[] = $relativePath;
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

        // Create the portfolio directories if they don't exist
        $portfolioDir = public_path('images/provider_documents/portfolio');
        $thumbnailDir = public_path('images/provider_documents/portfolio/thumbnails');
        if (!file_exists($portfolioDir)) {
            mkdir($portfolioDir, 0755, true);
        }
        if (!file_exists($thumbnailDir)) {
            mkdir($thumbnailDir, 0755, true);
        }

        foreach ($files as $file) {
            $filename = 'portfolio_' . $profile->user_id . '_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $relativePath = 'images/provider_documents/portfolio/' . $filename;
            $thumbnailRelativePath = 'images/provider_documents/portfolio/thumbnails/' . $filename;

            // Resize and optimize image (maintain aspect ratio)
            if ($this->imageManager) {
                try {
                    $image = $this->imageManager->read($file)
                        ->scaleDown(width: 1200, height: 1200)
                        ->toJpeg(90);

                    // Store main image
                    file_put_contents(public_path($relativePath), (string) $image);

                    // Generate thumbnail (maintain aspect ratio)
                    $thumbnail = $this->imageManager->read($file)
                        ->scaleDown(width: 300, height: 300)
                        ->toJpeg(80);

                    // Store thumbnail
                    file_put_contents(public_path($thumbnailRelativePath), (string) $thumbnail);
                } catch (\Exception $e) {
                    Log::warning('Portfolio image processing failed, storing original: ' . $e->getMessage());
                    // Fallback: store original file
                    $file->move($portfolioDir, $filename);
                }
            } else {
                // Fallback: store original file without processing
                $file->move($portfolioDir, $filename);
            }

            $paths[] = $relativePath;
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
                    $fullPath = public_path($profile->business_license_path);
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
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
            $fullPath = public_path($paths[$index]);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
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
            // Delete main image
            $fullPath = public_path($paths[$index]);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            // Also delete thumbnail
            $thumbnailPath = str_replace('portfolio/', 'portfolio/thumbnails/', $paths[$index]);
            $fullThumbnailPath = public_path($thumbnailPath);
            if (file_exists($fullThumbnailPath)) {
                unlink($fullThumbnailPath);
            }

            unset($paths[$index]);

            $profile->update([
                'portfolio_image_paths' => json_encode(array_values($paths)),
            ]);
        }
    }
}
