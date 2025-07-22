<?php

use Illuminate\Support\Facades\Route;

// Test route for geocoding functionality
Route::get('/test-geocoding', function () {
    try {
        // Test search
        $searchResponse = app('App\Http\Controllers\GeocodingController')->search(
            new \Illuminate\Http\Request(['q' => 'Colombo', 'limit' => 1])
        );
        
        // Test reverse geocoding
        $reverseResponse = app('App\Http\Controllers\GeocodingController')->reverse(
            new \Illuminate\Http\Request(['lat' => '6.9271', 'lon' => '79.8612'])
        );
        
        return response()->json([
            'status' => 'working',
            'search_test' => $searchResponse->getData(),
            'reverse_test' => $reverseResponse->getData(),
            'endpoints' => [
                'search' => '/api/geocoding/search?q=colombo',
                'reverse' => '/api/geocoding/reverse?lat=6.9271&lon=79.8612'
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
});
