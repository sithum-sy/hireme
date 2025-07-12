<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\AvailabilityController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\AppointmentController;
use App\Http\Controllers\API\staff\ServiceCategoryController;

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

// Appointment & Quote Management
Route::prefix('appointments')->group(function () {
    Route::post('/{appointment}/respond', [AppointmentController::class, 'respondToAppointment']);
});

Route::prefix('quotes')->group(function () {
    Route::post('/', [AppointmentController::class, 'createQuote']);
    Route::post('/{quote}/withdraw', [AppointmentController::class, 'withdrawQuote']);
});

// Provider Dashboard & Analytics
Route::get('/dashboard/stats', [ProfileController::class, 'getProviderDashboardStats']);
Route::get('/analytics/earnings', [AppointmentController::class, 'getEarningsAnalytics']);
Route::get('/analytics/performance', [ProfileController::class, 'getPerformanceAnalytics']);
