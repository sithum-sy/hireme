<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Route::get('/', function () {
//     return view('welcome');
// });

// Route::get('/', function () {
//     return view('app');
// });

// SPA Catch-all route - This should be the LAST route
Route::get('/{any}', function () {
    return view('app'); // or wherever your React app entry point is
})->where('any', '^(?!api).*$'); // Exclude API routes

// Include test routes in development
if (app()->environment('local')) {
    require __DIR__ . '/test.php';
}
