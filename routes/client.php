<?php
// routes/client.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Client\SearchController;
use App\Http\Controllers\API\Client\ServiceController;
use App\Http\Controllers\API\Client\ProviderController;
use App\Http\Controllers\API\Client\DashboardController;
use App\Http\Controllers\API\Client\BookingController;

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
    Route::get('/{provider}/availability/slots', [ProviderController::class, 'getAvailableSlots']);
    Route::get('/{provider}/availability/weekly', [ProviderController::class, 'getWeeklyAvailability']);
    Route::get('/{provider}/availability/check', [ProviderController::class, 'checkAvailability']);
});

// Booking Management
Route::prefix('bookings')->group(function () {
    Route::post('/', [BookingController::class, 'store']); // Create new booking
    Route::get('/', [BookingController::class, 'index']); // List user's bookings
    Route::get('/{booking}', [BookingController::class, 'show']); // Get booking details
    Route::patch('/{booking}/cancel', [BookingController::class, 'cancel']); // Cancel booking
});

// Quote Management
Route::prefix('quotes')->group(function () {
    Route::post('/request', [QuoteController::class, 'store']); // Create quote request
    Route::get('/', [QuoteController::class, 'index']); // List user's quotes
    Route::get('/{quote}', [QuoteController::class, 'show']); // Get quote details
    Route::patch('/{quote}/accept', [QuoteController::class, 'accept']); // Accept quote
    Route::patch('/{quote}/decline', [QuoteController::class, 'decline']); // Decline quote
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
