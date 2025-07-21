<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    public function getNearbyServiceAreas(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:200'
        ]);

        try {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->radius ?? 10; // Default 10km radius

            $nearbyAreas = $this->locationService->getNearbyServiceAreas(
                $latitude,
                $longitude,
                $radius
            );

            return response()->json([
                'success' => true,
                'data' => $nearbyAreas,
                'location' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'radius' => $radius
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting nearby service areas:', [
                'error' => $e->getMessage(),
                'latitude' => $request->latitude ?? null,
                'longitude' => $request->longitude ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get nearby service areas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllServiceAreas()
    {
        try {
            $allAreas = $this->locationService->getAllServiceAreas();

            return response()->json([
                'success' => true,
                'data' => $allAreas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get service areas'
            ], 500);
        }
    }
}
