<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Admin\DashboardController;
use App\Http\Controllers\API\Admin\StaffController;
use App\Http\Controllers\API\Admin\UserController;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| Admin routes that work with your existing Sanctum authentication system.
| These routes are prefixed with /api/admin and use the admin middleware.
|
*/

// Admin API Routes - using Sanctum authentication
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Staff Management
    Route::prefix('staff')->group(function () {
        Route::get('/', [StaffController::class, 'index']);
        Route::post('/', [StaffController::class, 'store']);
        Route::get('/{staff}', [StaffController::class, 'show']);
        Route::put('/{staff}', [StaffController::class, 'update']);
        Route::delete('/{staff}', [StaffController::class, 'destroy']);
        Route::patch('/{staff}/toggle-status', [StaffController::class, 'toggleStatus']);
    });

    // User Management (All Users Overview)
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/stats', [UserController::class, 'getStats']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
    });

    // System Reports
    Route::prefix('reports')->group(function () {
        Route::get('/overview', [DashboardController::class, 'getOverviewReport']);
        Route::get('/users', [UserController::class, 'getUsersReport']);
        Route::get('/activities', [DashboardController::class, 'getActivitiesReport']);
    });
});
