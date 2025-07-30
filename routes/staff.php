<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Staff\ServiceCategoryController;
use App\Http\Controllers\API\Staff\DashboardController;
use App\Http\Controllers\API\Staff\ReportController;
use App\Http\Controllers\API\Staff\UserController;
use App\Http\Controllers\API\Staff\ServiceController;
use App\Http\Controllers\API\Staff\AppointmentController;

/*
|--------------------------------------------------------------------------
| Staff API Routes
|--------------------------------------------------------------------------
|
| Staff routes that work with your existing Sanctum authentication system.
| These routes are prefixed with /api/staff and use the staff middleware.
|
*/

// Staff API Routes - using Sanctum authentication
Route::middleware(['auth:sanctum', 'staff'])->group(function () {

    // Dashboard Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/stats', [DashboardController::class, 'getStats']);
        Route::get('/tasks', [DashboardController::class, 'getTasks']);
        Route::get('/activities', [DashboardController::class, 'getActivities']);
        Route::get('/activity-stats', [DashboardController::class, 'getActivityStats']);
        Route::get('/staff-activity', [DashboardController::class, 'getStaffActivitySummary']);
        Route::get('/quick-actions', [DashboardController::class, 'getQuickActions']);
        Route::get('/overview', [DashboardController::class, 'getOverview']);
        Route::post('/clear-cache', [DashboardController::class, 'clearCache']);
        Route::get('/export', [DashboardController::class, 'exportData']);
    });

    // Service Category Management
    Route::prefix('service-categories')->group(function () {
        Route::get('/', [ServiceCategoryController::class, 'index']);
        Route::post('/', [ServiceCategoryController::class, 'store']);
        Route::get('/{category}', [ServiceCategoryController::class, 'show']);
        Route::put('/{category}', [ServiceCategoryController::class, 'update']);
        Route::delete('/{category}', [ServiceCategoryController::class, 'destroy']);
        Route::patch('/{category}/toggle-status', [ServiceCategoryController::class, 'toggleStatus']);
        Route::patch('/sort-order', [ServiceCategoryController::class, 'updateSortOrder']);
        Route::get('/{category}/analytics', [ServiceCategoryController::class, 'analytics']);
    });

    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/clients', [UserController::class, 'clients']);
        Route::get('/providers', [UserController::class, 'providers']);
        Route::get('/statistics', [UserController::class, 'statistics']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });

    // Service Management
    Route::prefix('services')->group(function () {
        Route::get('/', [ServiceController::class, 'index']);
        Route::get('/statistics', [ServiceController::class, 'statistics']);
        Route::get('/{service}', [ServiceController::class, 'show']);
        Route::patch('/{service}/toggle-status', [ServiceController::class, 'toggleStatus']);
        Route::delete('/{service}', [ServiceController::class, 'destroy']);
    });

    // Appointment Management
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);
        Route::get('/statistics', [AppointmentController::class, 'statistics']);
        Route::get('/{appointment}', [AppointmentController::class, 'show']);
        Route::patch('/{appointment}/status', [AppointmentController::class, 'updateStatus']);
        Route::delete('/{appointment}', [AppointmentController::class, 'destroy']);
    });

    // Staff Reports & Analytics
    Route::prefix('reports')->group(function () {
        Route::get('/analytics', [ReportController::class, 'analytics']);
    });
});
