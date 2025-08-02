<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\provider\ServiceController;
use App\Http\Controllers\API\AvailabilityController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\Provider\AppointmentController;
use App\Http\Controllers\API\Provider\QuoteController;
use App\Http\Controllers\API\Provider\DashboardController;
use App\Http\Controllers\API\Provider\ReportController;
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
    Route::get('/{service}/appointments', [ServiceController::class, 'getServiceAppointments']);
    Route::get('/{service}/reviews', [ServiceController::class, 'getServiceReviews']);
    Route::post('/', [ServiceController::class, 'store']);
    Route::match(['PUT', 'POST'], '/{service}', [ServiceController::class, 'update']);
    Route::delete('/{service}', [ServiceController::class, 'destroy']);
    Route::patch('/{service}/toggle-status', [ServiceController::class, 'toggleStatus']);
});

// Service Categories (for forms)
Route::get('/service-categories', [ServiceController::class, 'getServiceCategories']);

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
    Route::get('/', [AppointmentController::class, 'index']);
    Route::get('/today', [AppointmentController::class, 'today']);
    Route::get('/config', [AppointmentController::class, 'getConfig']);
    Route::get('/{appointment}', [AppointmentController::class, 'show']);
    Route::patch('/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::post('/{appointment}/complete', [AppointmentController::class, 'completeService']); // Add this
    Route::post('/{appointment}/start', [AppointmentController::class, 'startService']);
    Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancelAppointment']);

    // Reschedule request management
    Route::post('/{appointment}/reschedule-request/approve', [AppointmentController::class, 'approveReschedule']);
    Route::post('/{appointment}/reschedule-request/decline', [AppointmentController::class, 'declineReschedule']);

    Route::get('/dashboard/today', [AppointmentController::class, 'todayForDashboard']);
    Route::get('/dashboard/upcoming', [AppointmentController::class, 'upcomingForDashboard']);
    Route::get('/dashboard/past', [AppointmentController::class, 'pastForDashboard']);
    Route::get('/dashboard/cancelled', [AppointmentController::class, 'cancelledForDashboard']);
    Route::get('/dashboard/stats', [AppointmentController::class, 'dashboardStats']);
});

// Quote Management
Route::prefix('quotes')->group(function () {
    Route::get('/', [QuoteController::class, 'index']);
    Route::get('/available', [QuoteController::class, 'getAvailableRequests']);
    Route::get('/service-categories', [QuoteController::class, 'getServiceCategories']);
    Route::get('/{quote}', [QuoteController::class, 'show']);
    Route::patch('/{quote}', [QuoteController::class, 'update']);
    Route::delete('/{quote}', [QuoteController::class, 'withdraw']);
    Route::patch('/{quote}/send', [QuoteController::class, 'send']);
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
Route::prefix('dashboard')->group(function () {
    Route::get('/business-statistics', [DashboardController::class, 'getBusinessStatistics']);
    Route::get('/metrics', [DashboardController::class, 'getDashboardMetrics']);
    Route::get('/earnings', [DashboardController::class, 'getEarningsData']);
});

Route::get('/dashboard/stats', [ProfileController::class, 'getProviderDashboardStats']);
// Route::get('/analytics/earnings', [AppointmentController::class, 'getEarningsAnalytics']);
Route::get('/analytics/performance', [ProfileController::class, 'getPerformanceAnalytics']);

// Provider Reports
Route::prefix('reports')->group(function () {
    Route::get('/analytics', [ReportController::class, 'analytics']);
});
