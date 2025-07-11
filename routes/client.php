<?php
// routes/client.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Client\SearchController;
use App\Http\Controllers\API\Client\ServiceController;
use App\Http\Controllers\API\Client\ProviderController;
use App\Http\Controllers\API\Client\DashboardController;

/*
|--------------------------------------------------------------------------
| Client API Routes
|--------------------------------------------------------------------------
| Routes specific to clients for service discovery and booking
*/

// Service Discovery & Search
Route::prefix('services')->group(function () {
    Route::get('/search', [SearchController::class, 'searchServices']);
    Route::get('/', [ServiceController::class, 'index']);
    Route::get('/popular', [ServiceController::class, 'getPopularServices']);
    Route::get('/recent', [ServiceController::class, 'getRecentServices']);
    Route::get('/categories', [ServiceController::class, 'getCategories']);
    Route::get('/{service}', [ServiceController::class, 'show']);
    Route::get('/{service}/similar', [ServiceController::class, 'getSimilarServices']);
    Route::get('/{service}/availability', [ServiceController::class, 'checkAvailability']);
});

// Provider Discovery  
Route::prefix('providers')->group(function () {
    Route::get('/', [ProviderController::class, 'index']);
    Route::get('/search', [ProviderController::class, 'search']);
    Route::get('/{provider}', [ProviderController::class, 'show']);
    Route::get('/{provider}/services', [ProviderController::class, 'getServices']);
    Route::get('/{provider}/availability', [ProviderController::class, 'getAvailability']);
    Route::get('/providers/{provider}/reviews', [ProviderController::class, 'getReviews']);
});

// Search Analytics & Suggestions
Route::prefix('search')->group(function () {
    Route::get('/suggestions', [SearchController::class, 'getSearchSuggestions']);
    Route::get('/popular', [SearchController::class, 'getPopularSearches']);
    Route::post('/track', [SearchController::class, 'trackSearch']);
});

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('/dashboard/recommendations', [DashboardController::class, 'getRecommendations']);
Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);
