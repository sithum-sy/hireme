<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

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

// Test route for email functionality
Route::get('/test-email', function () {
    try {
        Mail::raw('Test email from HireMe - SMTP Connection Test', function ($message) {
            $message->to('test@example.com')
                   ->subject('Test Email - SMTP Check');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Email sent successfully!',
            'config' => [
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'encryption' => config('mail.mailers.smtp.encryption'),
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'config' => [
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'encryption' => config('mail.mailers.smtp.encryption'),
            ]
        ], 500);
    }
});
