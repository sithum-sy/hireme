<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\staff\ServiceCategoryController;
use App\Http\Controllers\API\Provider\ServiceController;
use App\Http\Controllers\API\AvailabilityController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\ProviderProfileController;
use App\Http\Controllers\API\AppointmentController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\GeocodingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Email verification routes (public)
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);

// Password reset routes (public)  
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// CSRF token refresh route (public)
Route::post('/csrf-refresh', [AuthController::class, 'refreshCSRF']);

// Public geocoding routes (no auth required)
Route::prefix('geocoding')->group(function () {
    Route::get('/search', [GeocodingController::class, 'search']);
    Route::get('/reverse', [GeocodingController::class, 'reverse']);
});

// Public service routes
Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

// Public provider routes
// Route::get('/providers/{providerId}/availability/check', [AvailabilityController::class, 'checkAvailability']);
// Route::get('/providers/{providerId}/availability/slots', [AvailabilityController::class, 'getAvailableSlots']);
Route::get('/providers/{providerId}/public-profile', [ProfileController::class, 'getPublicProviderProfile']);


// Protected routes
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Base Profile Routes (All authenticated users)
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])->name('show');
        Route::put('/', [ProfileController::class, 'update'])->name('update');
        Route::get('/config', [ProfileController::class, 'getConfig'])->name('config');
        Route::post('/validate-field', [ProfileController::class, 'validateField'])->name('validate-field');

        // Image management
        Route::post('/image', [ProfileController::class, 'uploadImage'])->name('image.upload');
        Route::delete('/image', [ProfileController::class, 'deleteImage'])->name('image.delete');

        // Password management
        Route::post('/change-password', [ProfileController::class, 'changePassword'])->name('change-password');
    });

    // Provider Profile Routes (Service providers only)
    Route::prefix('provider-profile')->name('provider-profile.')->group(function () {
        Route::get('/', [ProviderProfileController::class, 'show'])->name('show');
        Route::put('/', [ProviderProfileController::class, 'update'])->name('update');
        Route::post('/toggle-availability', [ProviderProfileController::class, 'toggleAvailability'])->name('toggle-availability');
        Route::get('/statistics', [ProviderProfileController::class, 'getStatistics'])->name('statistics');

        // Document management
        Route::post('/documents', [ProviderProfileController::class, 'uploadDocuments'])->name('documents.upload');
        Route::delete('/documents', [ProviderProfileController::class, 'deleteDocument'])->name('documents.delete');
    });

    // Appointment Management (all authenticated users)
    // Route::prefix('appointments')->group(function () {
    //     Route::get('/', [AppointmentController::class, 'getAppointments']);
    //     Route::post('/check-availability', [AppointmentController::class, 'checkAvailability']);
    //     Route::get('/upcoming', [AppointmentController::class, 'getUpcomingAppointments']);
    //     Route::get('/statistics', [AppointmentController::class, 'getStatistics']);
    //     Route::get('/{appointment}', [AppointmentController::class, 'getAppointment']);
    //     Route::post('/{appointment}/review', [AppointmentController::class, 'addReview']);
    //     Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancelAppointment']);
    // });

    // Quote Management (all authenticated users)
    // Route::prefix('quotes')->group(function () {
    //     Route::get('/', [AppointmentController::class, 'getQuotes']);
    //     Route::get('/{quote}', [AppointmentController::class, 'getQuote']);
    // });

    // Review Management
    Route::prefix('appointments/{appointment}')->group(function () {
        Route::post('review', [ReviewController::class, 'submitReview']);
        Route::get('reviews', [ReviewController::class, 'getAppointmentReviews']);
    });

    // Notification Management (all authenticated users)
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::get('/recent', [NotificationController::class, 'recent']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::post('/{notification}/mark-read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        
        // Notification preferences
        Route::get('/preferences', [NotificationController::class, 'getPreferences']);
        Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
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



    // Route::prefix('location')->group(function () {
    //     Route::get('/service-areas', [LocationController::class, 'getAllServiceAreas']);
    //     Route::post('/nearby-areas', [LocationController::class, 'getNearbyServiceAreas']);
    // });

    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);

    // Test route to verify auth is working
    // Route::get('/test-auth', function () {
    //     return response()->json(['message' => 'Authentication working', 'user' => auth()->user()]);
    // });

    // Utility routes
    // Route::post('/quotes/mark-expired', [AppointmentController::class, 'markExpiredQuotes']);
});
