<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Staff\ServiceCategoryController;
use App\Http\Controllers\API\Staff\DashboardController;

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

    // Future staff routes will be added here:
    // - User management
    // - Appointment management
    // - Dispute resolution
    // - Reports and analytics
});
