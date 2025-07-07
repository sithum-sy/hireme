<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    /**
     * Get all active service categories
     */
    public function index()
    {
        try {
            $categories = ServiceCategory::active()
                ->ordered()
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'icon' => $category->icon,
                        'color' => $category->color,
                        'services_count' => $category->activeServices()->count(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categories
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single service category
     */
    public function show(ServiceCategory $serviceCategory)
    {
        try {
            $category = [
                'id' => $serviceCategory->id,
                'name' => $serviceCategory->name,
                'slug' => $serviceCategory->slug,
                'description' => $serviceCategory->description,
                'icon' => $serviceCategory->icon,
                'color' => $serviceCategory->color,
                'services_count' => $serviceCategory->activeServices()->count(),
                'services' => $serviceCategory->activeServices()
                    ->with(['provider:id,first_name,last_name', 'providerProfile:user_id,average_rating,total_reviews'])
                    ->get()
                    ->map(function ($service) {
                        return [
                            'id' => $service->id,
                            'title' => $service->title,
                            'description' => substr($service->description, 0, 150) . '...',
                            'pricing_type' => $service->pricing_type,
                            'formatted_price' => $service->formatted_price,
                            'average_rating' => $service->average_rating,
                            'provider_name' => $service->provider->full_name,
                            'provider_rating' => $service->providerProfile->average_rating ?? 0,
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
