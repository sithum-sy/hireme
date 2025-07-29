<?php
// routes/client.php

// use App\Http\Controllers\API\AppointmentController;
use App\Http\Controllers\API\AvailabilityController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Client\ServiceController;
use App\Http\Controllers\API\Client\ProviderController;
use App\Http\Controllers\API\Client\DashboardController;
use App\Http\Controllers\API\Client\AppointmentController;
use App\Http\Controllers\API\Client\QuoteController;
use App\Http\Controllers\API\Client\ReportController;

/*
|--------------------------------------------------------------------------
| Client API Routes
|--------------------------------------------------------------------------
| Routes specific to clients for service discovery and booking
*/

// Service Discovery & Search
Route::prefix('services')->group(function () {
    Route::get('/search', [ServiceController::class, 'searchServices']);
    Route::get('/', [ServiceController::class, 'index']);
    Route::get('/popular', [ServiceController::class, 'getPopularServices']);
    Route::get('/recent', [ServiceController::class, 'getRecentServices']);
    Route::get('/categories', [ServiceController::class, 'getCategories']);
    Route::get('/{service}', [ServiceController::class, 'show']);
    Route::get('/{service}/similar', [ServiceController::class, 'getSimilarServices']);
    Route::get('/{service}/availability', [ServiceController::class, 'checkAvailability']);
    Route::get('/{service}/reviews', [ServiceController::class, 'getServiceReviews']);
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
    Route::get('/{provider}/availability/working-hours', [ProviderController::class, 'getWorkingHours']);
});

// Booking/Appointment Management
Route::prefix('appointments')->group(function () {
    Route::post('/', [AppointmentController::class, 'store']); // Create appointment (your existing)
    Route::get('/', [AppointmentController::class, 'index']); // List appointments (enhanced)
    Route::get('/{appointment}', [AppointmentController::class, 'show']); // Get appointment details (enhanced)
    Route::put('/{appointment}', [AppointmentController::class, 'update']); // Update appointment (pending only)
    Route::post('/{appointment}/reschedule-request', [AppointmentController::class, 'requestReschedule']); // Request reschedule
    Route::patch('/{appointment}/cancel', [AppointmentController::class, 'cancel']); // Cancel appointment (enhanced)

    // NEW payment and review endpoints
    Route::post('/{appointment}/pay', [AppointmentController::class, 'payInvoice']); // Pay invoice
    Route::post('/{appointment}/review', [AppointmentController::class, 'submitReview']); // Submit review

    Route::post('/{appointment}/create-invoice', [AppointmentController::class, 'createInvoice']);
});

// Booking Management
Route::prefix('bookings')->group(function () {
    Route::post('/', [AppointmentController::class, 'store']); // Create new booking
    // Route::get('/', [AppointmentController::class, 'index']); // List user's bookings
    Route::get('/{booking}', [AppointmentController::class, 'show']); // Get booking details
    Route::patch('/{booking}/cancel', [AppointmentController::class, 'cancel']); // Cancel booking
});



// Quote Management
Route::prefix('quotes')->group(function () {
    Route::post('/request', [QuoteController::class, 'store']); // Create quote request
    Route::get('/', [QuoteController::class, 'index']); // List user's quotes
    Route::get('/{quote}', [QuoteController::class, 'show']); // Get quote details
    Route::patch('/{quote}/accept', [QuoteController::class, 'accept']); // Accept quote
    Route::patch('/{quote}/decline', [QuoteController::class, 'decline']); // Decline quote
    Route::post('/{quote}/create-appointment', [QuoteController::class, 'createAppointmentFromQuote']);
});

// Search Analytics & Suggestions
Route::prefix('search')->group(function () {
    Route::get('/suggestions', [ServiceController::class, 'getSearchSuggestions']);
    Route::get('/popular', [ServiceController::class, 'getPopularSearches']);
    Route::post('/track', [ServiceController::class, 'trackSearch']);
});

// Dashboard
Route::prefix('dashboard')->group(function () {
    Route::get('/stats', [DashboardController::class, 'getStats']);
    Route::get('/recommendations', [DashboardController::class, 'getRecommendations']);
    Route::get('/recent-activity', [DashboardController::class, 'getRecentActivity']);
});

// Client Reports
Route::prefix('reports')->group(function () {
    Route::get('/personal-activity', [ReportController::class, 'personalActivity']);
    Route::get('/spending-analysis', [ReportController::class, 'spendingAnalysis']);
    Route::get('/service-history', [ReportController::class, 'serviceHistory']);
    Route::get('/preferences', [ReportController::class, 'preferences']);
    Route::get('/transaction-history', [ReportController::class, 'transactionHistory']);
});
