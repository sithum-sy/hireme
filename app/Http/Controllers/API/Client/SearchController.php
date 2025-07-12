<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceSearch;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    /**
     * Search services with location-based filtering
     */
    public function searchServices(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:service_categories,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'min_rating' => 'nullable|numeric|between:1,5',
            'pricing_type' => 'nullable|in:hourly,fixed,custom',
            'sort_by' => 'nullable|in:distance,price,rating,popularity,recent',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $filters = $request->only([
            'search',
            'category_id',
            'min_price',
            'max_price',
            'min_rating',
            'pricing_type'
        ]);

        $query = Service::with(['category', 'provider.providerProfile'])
            ->advancedSearch($filters);

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->radius ?? 15;

            $query->servingLocation($lat, $lng);
        }

        // Sorting
        switch ($request->sort_by) {
            case 'distance':
                // Already sorted by distance in servingLocation scope
                break;
            case 'price':
                $query->orderBy('base_price');
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
                break;
            case 'popularity':
                $query->orderByDesc('views_count')->orderByDesc('bookings_count');
                break;
            case 'recent':
                $query->orderByDesc('created_at');
                break;
            default:
                if (!($request->latitude && $request->longitude)) {
                    $query->orderByDesc('created_at');
                }
        }

        $perPage = $request->get('per_page', 12);
        $services = $query->paginate($perPage);

        // Track search for analytics
        if ($request->search || $request->category_id) {
            ServiceSearch::trackSearch(
                $request->search,
                $filters,
                $request->latitude,
                $request->longitude,
                $request->radius,
                $services->total(),
                Auth::id()
            );
        }

        return response()->json([
            'success' => true,
            'data' => $services->through(function ($service) {
                return $this->formatServiceForClient($service);
            }),
            'meta' => [
                'total' => $services->total(),
                'per_page' => $services->perPage(),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'search_info' => [
                    'location_based' => $request->latitude && $request->longitude,
                    'radius' => $request->radius ?? 15,
                    'filters_applied' => count(array_filter($filters))
                ]
            ]
        ]);
    }

    /**
     * Get search suggestions for autocomplete
     */
    public function getSearchSuggestions(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['success' => true, 'data' => []]);
        }

        // Service title suggestions
        $serviceSuggestions = Service::where('title', 'like', "%{$query}%")
            ->where('is_active', true)
            ->limit(5)
            ->get(['id', 'title'])
            ->map(function ($service) {
                return [
                    'type' => 'service',
                    'id' => $service->id,
                    'text' => $service->title,
                    'category' => 'Services'
                ];
            });

        // Category suggestions
        $categorySuggestions = ServiceCategory::where('name', 'like', "%{$query}%")
            ->where('is_active', true)
            ->limit(3)
            ->get(['id', 'name'])
            ->map(function ($category) {
                return [
                    'type' => 'category',
                    'id' => $category->id,
                    'text' => $category->name,
                    'category' => 'Categories'
                ];
            });

        $suggestions = $serviceSuggestions->concat($categorySuggestions);

        return response()->json([
            'success' => true,
            'data' => $suggestions
        ]);
    }

    /**
     * Get popular searches
     */
    public function getPopularSearches()
    {
        $popularSearches = ServiceSearch::getPopularSearches(10);

        return response()->json([
            'success' => true,
            'data' => $popularSearches
        ]);
    }

    /**
     * Track search (for analytics)
     */
    public function trackSearch(Request $request)
    {
        $request->validate([
            'search_term' => 'nullable|string|max:255',
            'filters' => 'nullable|array',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius' => 'nullable|integer',
            'results_count' => 'nullable|integer'
        ]);

        ServiceSearch::trackSearch(
            $request->search_term,
            $request->filters,
            $request->latitude,
            $request->longitude,
            $request->radius,
            $request->results_count ?? 0,
            Auth::id()
        );

        return response()->json(['success' => true]);
    }

    /**
     * Format service for client response
     */
    private function formatServiceForClient($service)
    {
        return [
            'id' => $service->id,
            'title' => $service->title,
            'description' => \Str::limit($service->description, 150),
            'category' => [
                'id' => $service->category->id,
                'name' => $service->category->name,
                'icon' => $service->category->icon,
                'color' => $service->category->color,
            ],
            'provider' => [
                'id' => $service->provider->id,
                'name' => $service->provider->full_name,
                'business_name' => $service->provider->providerProfile?->business_name,
                'average_rating' => $service->provider->providerProfile?->average_rating ?? 0,
                'total_reviews' => $service->provider->providerProfile?->total_reviews ?? 0,
                'verified' => $service->provider->providerProfile?->isVerified() ?? false,
            ],
            'pricing_type' => $service->pricing_type,
            'base_price' => $service->base_price,
            'formatted_price' => $service->formatted_price,
            'duration_hours' => $service->duration_hours,
            'average_rating' => $service->average_rating,
            'views_count' => $service->views_count,
            'bookings_count' => $service->bookings_count,
            'first_image_url' => $service->first_image_url,
            'location' => $service->location,
            'distance' => isset($service->distance) ? round($service->distance, 2) : null,
            'service_areas' => $service->service_areas,
            'created_at' => $service->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
