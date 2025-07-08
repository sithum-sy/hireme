<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ServiceCategoryController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\AvailabilityController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\AppointmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Handle preflight OPTIONS requests
// Route::options('/{any}', function () {
//     return response('', 200)
//         ->header('Access-Control-Allow-Origin', '*')
//         ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
//         ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
// })->where('any', '.*');

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
// Public routes for checking provider availability
Route::get('/providers/{providerId}/availability/check', [AvailabilityController::class, 'checkAvailability']);
Route::get('/providers/{providerId}/availability/slots', [AvailabilityController::class, 'getAvailableSlots']);
// Public routes for provider profiles
Route::get('/providers/{providerId}/profile', [ProfileController::class, 'getPublicProviderProfile']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    // Profile management for all users
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    Route::delete('/profile/picture', [ProfileController::class, 'deleteProfilePicture']);

    // Appointment Management (All authenticated users)
    Route::get('/appointments', [AppointmentController::class, 'getAppointments']);
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'getAppointment']);
    Route::get('/appointments/upcoming', [AppointmentController::class, 'getUpcomingAppointments']);
    Route::get('/appointments/statistics', [AppointmentController::class, 'getStatistics']);
    Route::post('/appointments/{appointment}/review', [AppointmentController::class, 'addReview']);
    Route::post('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancelAppointment']);

    // Quote Management (All authenticated users)
    Route::get('/quotes', [AppointmentController::class, 'getQuotes']);
    Route::get('/quotes/{quote}', [AppointmentController::class, 'getQuote']);

    // Service provider routes
    Route::middleware('role:service_provider')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
        Route::patch('/services/{service}/toggle-status', [ServiceController::class, 'toggleStatus']);
        Route::get('/my-services', [ServiceController::class, 'myServices']);
        // Weekly availability
        Route::get('/availability/weekly', [AvailabilityController::class, 'getWeeklyAvailability']);
        Route::put('/availability/weekly', [AvailabilityController::class, 'updateWeeklyAvailability']);
        Route::get('/availability/summary', [AvailabilityController::class, 'getAvailabilitySummary']);

        // Blocked times
        Route::get('/availability/blocked-times', [AvailabilityController::class, 'getBlockedTimes']);
        Route::post('/availability/blocked-times', [AvailabilityController::class, 'createBlockedTime']);
        Route::delete('/availability/blocked-times/{blockedTime}', [AvailabilityController::class, 'deleteBlockedTime']);

        Route::put('/profile/provider', [ProfileController::class, 'updateProviderProfile']);
        Route::post('/profile/toggle-availability', [ProfileController::class, 'toggleAvailability']);
        Route::delete('/profile/provider/document', [ProfileController::class, 'deleteProviderDocument']);
        Route::get('/profile/provider/statistics', [ProfileController::class, 'getProviderStatistics']);

        Route::post('/appointments/{appointment}/respond', [AppointmentController::class, 'respondToAppointment']);
        Route::post('/quotes', [AppointmentController::class, 'createQuote']);
        Route::post('/quotes/{quote}/withdraw', [AppointmentController::class, 'withdrawQuote']);
    });

    // Client-specific routes
    Route::middleware('role:client')->group(function () {
        Route::post('/bookings', [AppointmentController::class, 'createBooking']);
        Route::post('/quotes/{quote}/respond', [AppointmentController::class, 'respondToQuote']);
    });

    // Admin routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        require __DIR__ . '/admin.php';
    });

    // Staff routes
    Route::prefix('staff')->middleware('staff')->group(function () {
        require __DIR__ . '/staff.php';
    });

    // Utility routes (for cron jobs or admin)
    Route::post('/quotes/mark-expired', [AppointmentController::class, 'markExpiredQuotes']);
});
