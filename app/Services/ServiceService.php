<?php

namespace App\Services;

use App\Models\Service;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServiceService
{
    /**
     * Create a new service
     */
    // public function createService(User $provider, array $data): Service
    // {
    //     // Handle service images upload
    //     $imagePaths = [];
    //     if (isset($data['service_images']) && is_array($data['service_images'])) {
    //         foreach ($data['service_images'] as $index => $image) {
    //             if ($image instanceof UploadedFile) {
    //                 $imagePaths[] = $this->uploadServiceImage($image, $provider->id, $index);
    //             }
    //         }
    //     }

    //     // Create service
    //     $service = Service::create([
    //         'provider_id' => $provider->id,
    //         'category_id' => $data['category_id'],
    //         'title' => $data['title'],
    //         'description' => $data['description'],
    //         'pricing_type' => $data['pricing_type'],
    //         'base_price' => $data['base_price'],
    //         'duration_hours' => $data['duration_hours'],
    //         'requirements' => $data['requirements'] ?? null,
    //         'includes' => $data['includes'],
    //         'service_areas' => $data['service_areas'],
    //         'service_images' => $imagePaths,
    //         'is_active' => $data['is_active'] ?? true,
    //     ]);

    //     return $service->load(['category', 'provider']);
    // }
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

        // Create service with ALL fields including location
        $service = Service::create([
            'provider_id' => $provider->id,
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'pricing_type' => $data['pricing_type'],
            'base_price' => $data['base_price'],
            'duration_hours' => $data['duration_hours'],
            'custom_pricing_description' => $data['custom_pricing_description'] ?? null,

            // LOCATION FIELDS - ADD THESE!
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'location_address' => $data['location_address'] ?? null,
            'location_city' => $data['location_city'] ?? null,
            'location_neighborhood' => $data['location_neighborhood'] ?? null,
            'service_radius' => $data['service_radius'] ?? 15,

            // OTHER FIELDS
            'requirements' => $data['requirements'] ?? null,
            'includes' => $data['includes'] ?? null,
            'service_areas' => $data['service_areas'] ?? [],
            'service_images' => $imagePaths,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $service->load(['category', 'provider']);
    }

    /**
     * Update an existing service
     */
    // public function updateService(Service $service, array $data)
    // {
    //     DB::beginTransaction();

    //     try {
    //         // Process service areas
    //         if (isset($data['service_areas'])) {
    //             if (is_string($data['service_areas'])) {
    //                 $serviceAreas = json_decode($data['service_areas'], true);
    //                 $data['service_areas'] = is_array($serviceAreas) ? $serviceAreas : [];
    //             }
    //         }

    //         // Handle existing images
    //         $existingImages = [];
    //         if (isset($data['existing_images']) && is_string($data['existing_images'])) {
    //             $existingImages = json_decode($data['existing_images'], true) ?: [];
    //         }

    //         // Handle new image uploads
    //         $newImages = [];
    //         if (request()->hasFile('service_images')) {
    //             foreach (request()->file('service_images') as $image) {
    //                 $newImages[] = $this->uploadServiceImage($image);
    //             }
    //         }

    //         // Combine existing and new images
    //         $allImages = array_merge($existingImages, $newImages);
    //         $data['service_images'] = $allImages;

    //         // Remove fields that shouldn't be directly updated
    //         unset($data['existing_images']);

    //         // Update the service
    //         $service->update($data);

    //         DB::commit();

    //         return $service->fresh(['category']);
    //     } catch (\Exception $e) {
    //         DB::rollback();
    //         \Log::error('Service update failed:', [
    //             'service_id' => $service->id,
    //             'error' => $e->getMessage()
    //         ]);
    //         throw $e;
    //     }
    // }
    public function updateService(Service $service, array $data)
    {
        DB::beginTransaction();

        try {
            Log::info('=== UPDATING SERVICE ===', [
                'service_id' => $service->id,
                'data_received' => $data,
                'location_fields' => [
                    'latitude' => $data['latitude'] ?? 'missing',
                    'longitude' => $data['longitude'] ?? 'missing',
                    'location_address' => $data['location_address'] ?? 'missing',
                    'location_city' => $data['location_city'] ?? 'missing',
                ]
            ]);

            // Process service areas
            if (isset($data['service_areas'])) {
                if (is_string($data['service_areas'])) {
                    $serviceAreas = json_decode($data['service_areas'], true);
                    $data['service_areas'] = is_array($serviceAreas) ? $serviceAreas : [];
                }
            }

            // Handle existing images
            $existingImages = [];
            if (isset($data['existing_images']) && is_string($data['existing_images'])) {
                $existingImages = json_decode($data['existing_images'], true) ?: [];
            }

            // Handle new image uploads
            $newImages = [];
            if (request()->hasFile('service_images')) {
                foreach (request()->file('service_images') as $image) {
                    $newImages[] = $this->uploadServiceImage($image, $service->provider_id);
                }
            }

            // Combine existing and new images
            $allImages = array_merge($existingImages, $newImages);
            $data['service_images'] = $allImages;

            // Remove fields that shouldn't be directly updated
            unset($data['existing_images']);

            // Update the service
            $service->update($data);

            Log::info('=== SERVICE UPDATED SUCCESSFULLY ===', [
                'service_id' => $service->id,
                'location_data_updated' => [
                    'latitude' => $service->latitude,
                    'longitude' => $service->longitude,
                    'location_address' => $service->location_address,
                    'location_city' => $service->location_city,
                ]
            ]);

            DB::commit();

            return $service->fresh(['category']);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Service update failed:', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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
            // Delete service images from public/images/services
            if ($service->service_images) {
                foreach ($service->service_images as $imagePath) {
                    if ($imagePath) {
                        $fullPath = public_path($imagePath);
                        if (file_exists($fullPath)) {
                            unlink($fullPath);
                        }
                    }
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
    private function uploadServiceImage($image, $providerId = null, $index = null)
    {
        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
        
        // Create the services directory if it doesn't exist
        $serviceDir = public_path('images/services');
        if (!file_exists($serviceDir)) {
            mkdir($serviceDir, 0755, true);
        }

        $relativePath = 'images/services/' . $filename;

        // Move the file to public/images/services
        $image->move($serviceDir, $filename);

        return $relativePath; // Return the relative path from public
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
