<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\AvailabilityController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\AppointmentController;
use App\Http\Controllers\API\staff\ServiceCategoryController;
use App\Http\Controllers\API\Provider\InvoiceController;

/*
|--------------------------------------------------------------------------
| Provider API Routes
|--------------------------------------------------------------------------
| Routes specific to service providers
*/

// Service Management
Route::prefix('services')->group(function () {
    Route::get('/my-services', [ServiceController::class, 'myServices']);
    Route::get('/{service}/edit', [ServiceController::class, 'edit']);
    Route::post('/', [ServiceController::class, 'store']);
    Route::match(['PUT', 'POST'], '/{service}', [ServiceController::class, 'update']);
    Route::delete('/{service}', [ServiceController::class, 'destroy']);
    Route::patch('/{service}/toggle-status', [ServiceController::class, 'toggleStatus']);
});

// Service Categories (for forms)
Route::get('/service-categories', [ServiceCategoryController::class, 'index']);

// Availability Management
Route::prefix('availability')->group(function () {
    // Weekly availability
    Route::get('/weekly', [AvailabilityController::class, 'getWeeklyAvailability']);
    // Route::post('/weekly', [AvailabilityController::class, 'createWeeklyAvailability']);
    Route::post('/weekly', [AvailabilityController::class, 'saveWeeklyAvailability']);
    Route::put('/weekly', [AvailabilityController::class, 'updateWeeklyAvailability']);
    Route::get('/summary', [AvailabilityController::class, 'getAvailabilitySummary']);

    Route::post('/availability/test', [AvailabilityController::class, 'testSave']);

    // Blocked times
    Route::get('/blocked-times', [AvailabilityController::class, 'getBlockedTimes']);
    Route::post('/blocked-times', [AvailabilityController::class, 'createBlockedTime']);
    Route::delete('/blocked-times/{blockedTime}', [AvailabilityController::class, 'deleteBlockedTime']);
});

// Provider Profile Management
Route::prefix('profile')->group(function () {
    Route::put('/provider', [ProfileController::class, 'updateProviderProfile']);
    Route::post('/toggle-availability', [ProfileController::class, 'toggleAvailability']);
    Route::delete('/provider/document', [ProfileController::class, 'deleteProviderDocument']);
    Route::get('/provider/statistics', [ProfileController::class, 'getProviderStatistics']);
});

// Appointment Management
Route::prefix('appointments')->group(function () {
    Route::get('/', [App\Http\Controllers\API\Provider\AppointmentController::class, 'index']);
    Route::get('/today', [App\Http\Controllers\API\Provider\AppointmentController::class, 'today']);
    Route::get('/{appointment}', [App\Http\Controllers\API\Provider\AppointmentController::class, 'show']);
    Route::patch('/{appointment}/status', [App\Http\Controllers\API\Provider\AppointmentController::class, 'updateStatus']);
    Route::post('/{appointment}/complete', [App\Http\Controllers\API\Provider\AppointmentController::class, 'completeService']); // Add this
    Route::post('/{appointment}/start', [App\Http\Controllers\API\Provider\AppointmentController::class, 'startService']);
    Route::post('/{appointment}/cancel', [App\Http\Controllers\API\Provider\AppointmentController::class, 'cancelAppointment']);
    Route::get('/dashboard/today', [App\Http\Controllers\API\Provider\AppointmentController::class, 'todayForDashboard']);
    Route::get('/dashboard/upcoming', [App\Http\Controllers\API\Provider\AppointmentController::class, 'upcomingForDashboard']);
    Route::get('/dashboard/past', [App\Http\Controllers\API\Provider\AppointmentController::class, 'pastForDashboard']);
    Route::get('/dashboard/cancelled', [App\Http\Controllers\API\Provider\AppointmentController::class, 'cancelledForDashboard']);
    Route::get('/dashboard/stats', [App\Http\Controllers\API\Provider\AppointmentController::class, 'dashboardStats']);
});

// Quote Management
Route::prefix('quotes')->group(function () {
    Route::get('/', [App\Http\Controllers\API\Provider\QuoteController::class, 'index']);
    Route::get('/available', [App\Http\Controllers\API\Provider\QuoteController::class, 'getAvailableRequests']); // Changed from /requests/available
    Route::get('/{quote}', [App\Http\Controllers\API\Provider\QuoteController::class, 'show']);
    Route::patch('/{quote}', [App\Http\Controllers\API\Provider\QuoteController::class, 'update']);
    Route::delete('/{quote}', [App\Http\Controllers\API\Provider\QuoteController::class, 'withdraw']);
    Route::patch('/{quote}/send', [App\Http\Controllers\API\Provider\QuoteController::class, 'send']);
});


// Invoice Management
Route::prefix('invoices')->group(function () {
    Route::get('/', [InvoiceController::class, 'index']);
    Route::get('/statistics', [InvoiceController::class, 'statistics']);
    Route::get('/earnings', [InvoiceController::class, 'earnings']);
    Route::get('/{invoice}', [InvoiceController::class, 'show']);
    Route::post('/', [InvoiceController::class, 'store']);
    Route::patch('/{invoice}', [InvoiceController::class, 'update']);
    Route::patch('/{invoice}/send', [InvoiceController::class, 'send']);
    Route::patch('/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
    Route::patch('/{invoice}/confirm-cash', [InvoiceController::class, 'confirmCashReceived']);
});

// Provider Dashboard & Analytics
Route::get('/dashboard/stats', [ProfileController::class, 'getProviderDashboardStats']);
Route::get('/analytics/earnings', [AppointmentController::class, 'getEarningsAnalytics']);
Route::get('/analytics/performance', [ProfileController::class, 'getPerformanceAnalytics']);
