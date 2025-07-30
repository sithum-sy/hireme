<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class GeocodingController extends Controller
{
    /**
     * Search for locations using Nominatim API
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q');
            $countryCode = $request->get('countrycodes', 'lk');
            $limit = $request->get('limit', 5);

            if (empty($query)) {
                return response()->json(['error' => 'Query parameter is required'], 400);
            }

            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'HireMe-ServiceApp/1.0 (Laravel)'
                ])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'format' => 'json',
                    'q' => $query,
                    'countrycodes' => $countryCode,
                    'limit' => $limit,
                    'addressdetails' => 1,
                    'accept-language' => 'en'
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'External API request failed'], 500);
        } catch (\Exception $e) {
            Log::error('Geocoding search failed: ' . $e->getMessage());
            return response()->json(['error' => 'Service unavailable'], 503);
        }
    }

    /**
     * Reverse geocode coordinates to address
     */
    public function reverse(Request $request): JsonResponse
    {
        try {
            $lat = $request->get('lat');
            $lon = $request->get('lon');

            if (empty($lat) || empty($lon)) {
                return response()->json(['error' => 'Latitude and longitude are required'], 400);
            }

            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'HireMe-ServiceApp/1.0 (Laravel)'
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'json',
                    'lat' => $lat,
                    'lon' => $lon,
                    'addressdetails' => 1,
                    'accept-language' => 'en',
                    'zoom' => 16
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'External API request failed'], 500);
        } catch (\Exception $e) {
            Log::error('Reverse geocoding failed: ' . $e->getMessage());
            return response()->json(['error' => 'Service unavailable'], 503);
        }
    }
}
