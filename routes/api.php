<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\staff\ServiceCategoryController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\AvailabilityController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\AppointmentController;
use App\Http\Controllers\API\LocationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public service routes
Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

// Public provider routes
Route::get('/providers/{providerId}/availability/check', [AvailabilityController::class, 'checkAvailability']);
Route::get('/providers/{providerId}/availability/slots', [AvailabilityController::class, 'getAvailableSlots']);
Route::get('/providers/{providerId}/profile', [ProfileController::class, 'getPublicProviderProfile']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Profile management (all users)
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getProfile']);
        Route::put('/', [ProfileController::class, 'updateProfile']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::delete('/picture', [ProfileController::class, 'deleteProfilePicture']);
    });

    // Appointment Management (all authenticated users)
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'getAppointments']);
        Route::get('/upcoming', [AppointmentController::class, 'getUpcomingAppointments']);
        Route::get('/statistics', [AppointmentController::class, 'getStatistics']);
        Route::get('/{appointment}', [AppointmentController::class, 'getAppointment']);
        Route::post('/{appointment}/review', [AppointmentController::class, 'addReview']);
        Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancelAppointment']);
    });

    // Quote Management (all authenticated users)
    Route::prefix('quotes')->group(function () {
        Route::get('/', [AppointmentController::class, 'getQuotes']);
        Route::get('/{quote}', [AppointmentController::class, 'getQuote']);
    });

    // Service Provider Routes
    Route::prefix('provider')->middleware('role:service_provider')->group(function () {
        require __DIR__ . '/provider.php';
    });

    // Client-specific routes
    Route::prefix('client')->middleware(['auth:sanctum', 'role:client'])->group(function () {
        require __DIR__ . '/client.php';
    });

    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        require __DIR__ . '/admin.php';
    });

    // Staff routes
    Route::prefix('staff')->middleware('role:staff')->group(function () {
        require __DIR__ . '/staff.php';
    });


    Route::prefix('location')->group(function () {
        Route::get('/service-areas', [LocationController::class, 'getAllServiceAreas']);
        Route::post('/nearby-areas', [LocationController::class, 'getNearbyServiceAreas']);
    });

    // Utility routes
    Route::post('/quotes/mark-expired', [AppointmentController::class, 'markExpiredQuotes']);
});
