<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class FileUploadService
{
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

        // Resize and optimize image
        $image = Image::make($file)
            ->resize(400, 400, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })
            ->encode('jpg', 85);

        // Store the image
        Storage::disk('public')->put($path, $image);

        // Update user profile picture path
        $user->update(['profile_picture' => $path]);

        // Log the upload
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->withProperties(['action' => 'profile_image_uploaded'])
            ->log('Profile image uploaded');

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

            activity()
                ->performedOn($user)
                ->causedBy($user)
                ->withProperties(['action' => 'profile_image_deleted'])
                ->log('Profile image deleted');
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

            // Resize and optimize image
            $image = Image::make($file)
                ->resize(1200, 1200, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })
                ->encode('jpg', 90);

            Storage::disk('public')->put($path, $image);

            // Generate thumbnail
            $thumbnailPath = 'provider-documents/portfolio/thumbnails/' . $filename;
            $thumbnail = Image::make($file)
                ->resize(300, 300, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })
                ->encode('jpg', 80);

            Storage::disk('public')->put($thumbnailPath, $thumbnail);

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

        activity()
            ->performedOn($profile)
            ->causedBy($user)
            ->withProperties([
                'action' => 'document_deleted',
                'document_type' => $documentType,
                'index' => $index
            ])
            ->log('Provider document deleted');
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
