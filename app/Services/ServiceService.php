<?php

namespace App\Services;

use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ServiceService
{
    /**
     * Create a new service
     */
    public function createService(User $provider, array $data): Service
    {
        // Handle service images upload
        $imagePaths = [];
        if (isset($data['service_images']) && is_array($data['service_images'])) {
            foreach ($data['service_images'] as $index => $image) {
                if ($image instanceof UploadedFile) {
                    $imagePaths[] = $this->uploadServiceImage($image, $provider->id, $index);
                }
            }
        }

        // Create service
        $service = Service::create([
            'provider_id' => $provider->id,
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'pricing_type' => $data['pricing_type'],
            'base_price' => $data['base_price'],
            'duration_hours' => $data['duration_hours'],
            'requirements' => $data['requirements'] ?? null,
            'includes' => $data['includes'],
            'service_areas' => $data['service_areas'],
            'service_images' => $imagePaths,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $service->load(['category', 'provider']);
    }

    /**
     * Update an existing service
     */
    public function updateService(Service $service, array $data): Service
    {
        DB::beginTransaction();

        try {
            // Handle service images update
            if (isset($data['service_images']) && is_array($data['service_images'])) {
                // Delete old images
                if ($service->service_images) {
                    foreach ($service->service_images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }

                // Upload new images
                $imagePaths = [];
                foreach ($data['service_images'] as $index => $image) {
                    if ($image instanceof UploadedFile) {
                        $imagePaths[] = $this->uploadServiceImage($image, $service->provider_id, $index);
                    }
                }
                $data['service_images'] = $imagePaths;
            }

            // Update service
            $service->update($data);

            DB::commit();

            return $service->load(['category', 'provider']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a service and its associated files
     */
    public function deleteService(Service $service): bool
    {
        DB::beginTransaction();

        try {
            // Delete service images
            if ($service->service_images) {
                foreach ($service->service_images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            // Delete the service
            $deleted = $service->delete();

            DB::commit();

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Toggle service active status
     */
    public function toggleServiceStatus(Service $service): Service
    {
        $service->update(['is_active' => !$service->is_active]);
        return $service;
    }

    /**
     * Upload service image
     */
    private function uploadServiceImage(UploadedFile $image, int $providerId, int $index): string
    {
        $filename = 'service_' . $providerId . '_' . time() . '_' . $index . '.' . $image->getClientOriginalExtension();
        return $image->storeAs('services', $filename, 'public');
    }

    /**
     * Get services with filters
     */
    public function getServicesWithFilters(array $filters = [])
    {
        $query = Service::with(['category', 'provider.providerProfile'])
            ->active();

        // Apply filters
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['pricing_type'])) {
            $query->where('pricing_type', $filters['pricing_type']);
        }

        if (isset($filters['min_price'])) {
            $query->where('base_price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('base_price', '<=', $filters['max_price']);
        }

        if (isset($filters['service_area'])) {
            $query->whereJsonContains('service_areas', $filters['service_area']);
        }

        if (isset($filters['min_rating'])) {
            $query->where('average_rating', '>=', $filters['min_rating']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        switch ($sortBy) {
            case 'price':
                $query->orderBy('base_price', $sortOrder);
                break;
            case 'rating':
                $query->orderBy('average_rating', $sortOrder);
                break;
            case 'popularity':
                $query->orderBy('views_count', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', $sortOrder);
        }

        return $query;
    }
}
