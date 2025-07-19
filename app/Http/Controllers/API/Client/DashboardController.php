<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceSearch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    /**
     * Get client dashboard statistics
     */
    public function getStats()
    {
        try {
            $user = Auth::user();

            // Get appointment statistics using existing AppointmentService
            $appointmentService = app(\App\Services\AppointmentService::class);
            $appointmentStats = $appointmentService->getAppointmentStatistics($user);

            // Get additional client-specific stats
            $additionalStats = [
                'services_viewed' => $this->getServicesViewedCount($user),
                'searches_performed' => $this->getSearchesCount($user),
                'favorite_categories' => $this->getFavoriteCategories($user),
                'total_spent' => $this->getTotalSpent($user),
                'average_rating_given' => $this->getAverageRatingGiven($user),
            ];

            // Combine all statistics
            $stats = array_merge($appointmentStats, $additionalStats);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get personalized recommendations for client
     */
    public function getRecommendations(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:20'
        ]);

        try {
            $user = Auth::user();
            $limit = $request->get('limit', 10);
            $recommendations = [];

            // 1. Based on previous bookings (same categories)
            $previousCategories = $this->getPreviousBookingCategories($user);
            if (!empty($previousCategories)) {
                $categoryRecommendations = $this->getRecommendationsByCategories(
                    $previousCategories,
                    $request,
                    ceil($limit * 0.4)
                );
                $recommendations = array_merge($recommendations, $categoryRecommendations);
            }

            // 2. Based on search history
            $searchHistory = $this->getRecentSearchTerms($user);
            if (!empty($searchHistory)) {
                $searchRecommendations = $this->getRecommendationsBySearchHistory(
                    $searchHistory,
                    $request,
                    ceil($limit * 0.3)
                );
                $recommendations = array_merge($recommendations, $searchRecommendations);
            }

            // 3. Popular services in user's area
            $popularServices = $this->getPopularServicesInArea($request, ceil($limit * 0.3));
            $recommendations = array_merge($recommendations, $popularServices);

            // Remove duplicates and limit results
            $uniqueRecommendations = collect($recommendations)
                ->unique('id')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'recommendations' => $uniqueRecommendations,
                    'recommendation_reasons' => [
                        'previous_bookings' => !empty($previousCategories),
                        'search_history' => !empty($searchHistory),
                        'popular_in_area' => true,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recommendations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activity for client
     */
    public function getRecentActivity(Request $request)
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $user = Auth::user();
            $limit = $request->get('limit', 20);
            $activities = [];

            // Recent appointments
            $recentAppointments = $user->clientAppointments()
                ->with(['service:id,title', 'provider:id,first_name,last_name'])
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get();

            foreach ($recentAppointments as $appointment) {
                $activities[] = [
                    'id' => 'appointment_' . $appointment->id,
                    'type' => 'appointment',
                    'action' => $this->getAppointmentAction($appointment),
                    'title' => $appointment->service->title,
                    'description' => 'with ' . $appointment->provider->full_name,
                    'status' => $appointment->status,
                    'date' => $appointment->created_at,
                    'formatted_date' => $appointment->created_at->diffForHumans(),
                    'link' => "/client/appointments/{$appointment->id}",
                ];
            }

            // Recent searches
            $recentSearches = ServiceSearch::where('user_id', $user->id)
                ->whereNotNull('search_term')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();

            foreach ($recentSearches as $search) {
                $activities[] = [
                    'id' => 'search_' . $search->id,
                    'type' => 'search',
                    'action' => 'searched',
                    'title' => "'{$search->search_term}'",
                    'description' => $search->results_count . ' results found',
                    'date' => $search->created_at,
                    'formatted_date' => $search->created_at->diffForHumans(),
                    'link' => "/client/services/search?q=" . urlencode($search->search_term),
                ];
            }

            // Sort all activities by date
            $sortedActivities = collect($activities)
                ->sortByDesc('date')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $sortedActivities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Private helper methods

    private function getServicesViewedCount($user)
    {
        // This would require tracking service views per user
        // For now, return 0 or implement view tracking
        return 0;
    }

    private function getSearchesCount($user)
    {
        return ServiceSearch::where('user_id', $user->id)->count();
    }

    private function getFavoriteCategories($user)
    {
        // Get categories from user's appointment history
        return $user->clientAppointments()
            ->with('service.category')
            ->get()
            ->pluck('service.category.name')
            ->filter()
            ->countBy()
            ->sortDesc()
            ->take(3)
            ->keys()
            ->values();
    }

    private function getTotalSpent($user)
    {
        return $user->clientAppointments()
            ->where('status', 'completed')
            ->sum('total_price');
    }

    private function getAverageRatingGiven($user)
    {
        try {
            return $user->reviewsGiven()
                ->where('review_type', \App\Models\Review::TYPE_CLIENT_TO_PROVIDER)
                ->avg('rating') ?: 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getPreviousBookingCategories($user)
    {
        return $user->clientAppointments()
            ->with('service.category')
            ->get()
            ->pluck('service.category_id')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    private function getRecentSearchTerms($user)
    {
        return ServiceSearch::where('user_id', $user->id)
            ->whereNotNull('search_term')
            ->orderByDesc('created_at')
            ->limit(5)
            ->pluck('search_term')
            ->unique()
            ->values()
            ->toArray();
    }

    private function getRecommendationsByCategories($categories, $request, $limit)
    {
        $query = Service::with(['category', 'provider.providerProfile'])
            ->whereIn('category_id', $categories)
            ->where('is_active', true)
            ->orderByDesc('average_rating')
            ->orderByDesc('bookings_count');

        if ($request->latitude && $request->longitude) {
            $query->servingLocation($request->latitude, $request->longitude);
        }

        return $query->limit($limit)
            ->get()
            ->map(function ($service) {
                return $this->formatServiceForRecommendation($service, 'previous_bookings');
            })
            ->toArray();
    }

    private function getRecommendationsBySearchHistory($searchTerms, $request, $limit)
    {
        $query = Service::with(['category', 'provider.providerProfile'])
            ->where('is_active', true)
            ->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->orWhere('title', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                }
            });

        if ($request->latitude && $request->longitude) {
            $query->servingLocation($request->latitude, $request->longitude);
        }

        return $query->orderByDesc('average_rating')
            ->limit($limit)
            ->get()
            ->map(function ($service) {
                return $this->formatServiceForRecommendation($service, 'search_history');
            })
            ->toArray();
    }

    private function getPopularServicesInArea($request, $limit)
    {
        $query = Service::with(['category', 'provider.providerProfile'])
            ->where('is_active', true)
            ->orderByDesc('views_count')
            ->orderByDesc('bookings_count');

        if ($request->latitude && $request->longitude) {
            $query->servingLocation($request->latitude, $request->longitude);
        }

        return $query->limit($limit)
            ->get()
            ->map(function ($service) {
                return $this->formatServiceForRecommendation($service, 'popular_in_area');
            })
            ->toArray();
    }

    private function formatServiceForRecommendation($service, $reason)
    {
        return [
            'id' => $service->id,
            'title' => $service->title,
            'description' => Str::limit($service->description, 100),
            'category' => $service->category->name,
            'provider_name' => $service->provider->full_name,
            'business_name' => $service->provider->providerProfile?->business_name,
            'average_rating' => $service->average_rating,
            'base_price' => $service->base_price,
            'formatted_price' => $service->formatted_price,
            'first_image_url' => $service->first_image_url,
            'recommendation_reason' => $reason,
            'distance' => isset($service->distance) ? round($service->distance, 2) : null,
        ];
    }

    private function getAppointmentAction($appointment)
    {
        switch ($appointment->status) {
            case 'pending':
                return 'requested';
            case 'confirmed':
                return 'confirmed';
            case 'completed':
                return 'completed';
            case 'cancelled_by_client':
                return 'cancelled';
            case 'cancelled_by_provider':
                return 'cancelled by provider';
            default:
                return 'updated';
        }
    }
}
