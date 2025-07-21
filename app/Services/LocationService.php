<?php

namespace App\Services;

class LocationService
{
    // Sri Lankan administrative divisions
    private $sriLankanProvinces = [
        'Western Province' => [
            'districts' => ['Colombo', 'Gampaha', 'Kalutara'],
            'major_cities' => ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Panadura', 'Kesbewa', 'Maharagama', 'Moratuwa', 'Sri Jayawardenepura Kotte']
        ],
        'Central Province' => [
            'districts' => ['Kandy', 'Matale', 'Nuwara Eliya'],
            'major_cities' => ['Kandy', 'Matale', 'Nuwara Eliya', 'Dambulla', 'Hatton', 'Gampola']
        ],
        'Southern Province' => [
            'districts' => ['Galle', 'Matara', 'Hambantota'],
            'major_cities' => ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama', 'Ambalangoda']
        ],
        'Northern Province' => [
            'districts' => ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
            'major_cities' => ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya']
        ],
        'Eastern Province' => [
            'districts' => ['Ampara', 'Batticaloa', 'Trincomalee'],
            'major_cities' => ['Batticaloa', 'Trincomalee', 'Ampara', 'Kalmunai']
        ],
        'North Western Province' => [
            'districts' => ['Kurunegala', 'Puttalam'],
            'major_cities' => ['Kurunegala', 'Puttalam', 'Chilaw', 'Wariyapola']
        ],
        'North Central Province' => [
            'districts' => ['Anuradhapura', 'Polonnaruwa'],
            'major_cities' => ['Anuradhapura', 'Polonnaruwa', 'Kekirawa']
        ],
        'Uva Province' => [
            'districts' => ['Badulla', 'Monaragala'],
            'major_cities' => ['Badulla', 'Monaragala', 'Bandarawela', 'Ella']
        ],
        'Sabaragamuwa Province' => [
            'districts' => ['Ratnapura', 'Kegalle'],
            'major_cities' => ['Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya']
        ]
    ];

    // City coordinates for distance calculation
    private $cityCoordinates = [
        // Western Province
        'Colombo' => ['lat' => 6.9271, 'lng' => 79.8612],
        'Gampaha' => ['lat' => 7.0873, 'lng' => 79.9990],
        'Kalutara' => ['lat' => 6.5854, 'lng' => 79.9607],
        'Negombo' => ['lat' => 7.2083, 'lng' => 79.8358],
        'Panadura' => ['lat' => 6.7132, 'lng' => 79.9026],
        'Kesbewa' => ['lat' => 6.8112, 'lng' => 79.9267],
        'Maharagama' => ['lat' => 6.8481, 'lng' => 79.9267],
        'Moratuwa' => ['lat' => 6.7730, 'lng' => 79.8816],
        'Sri Jayawardenepura Kotte' => ['lat' => 6.8887, 'lng' => 79.9142],

        // Central Province
        'Kandy' => ['lat' => 7.2906, 'lng' => 80.6337],
        'Matale' => ['lat' => 7.4675, 'lng' => 80.6234],
        'Nuwara Eliya' => ['lat' => 6.9497, 'lng' => 80.7891],
        'Dambulla' => ['lat' => 7.8731, 'lng' => 80.6511],
        'Hatton' => ['lat' => 6.8918, 'lng' => 80.5954],
        'Gampola' => ['lat' => 7.1642, 'lng' => 80.5742],

        // Southern Province
        'Galle' => ['lat' => 6.0535, 'lng' => 80.2210],
        'Matara' => ['lat' => 5.9485, 'lng' => 80.5353],
        'Hambantota' => ['lat' => 6.1241, 'lng' => 81.1185],
        'Tangalle' => ['lat' => 6.0240, 'lng' => 80.7890],
        'Weligama' => ['lat' => 5.9754, 'lng' => 80.4290],
        'Ambalangoda' => ['lat' => 6.2354, 'lng' => 80.0540],

        // Northern Province
        'Jaffna' => ['lat' => 9.6615, 'lng' => 80.0255],
        'Kilinochchi' => ['lat' => 9.3847, 'lng' => 80.4037],
        'Mannar' => ['lat' => 8.9810, 'lng' => 79.9045],
        'Vavuniya' => ['lat' => 8.7514, 'lng' => 80.4971],

        // Eastern Province
        'Batticaloa' => ['lat' => 7.7102, 'lng' => 81.6924],
        'Trincomalee' => ['lat' => 8.5874, 'lng' => 81.2152],
        'Ampara' => ['lat' => 7.2966, 'lng' => 81.6747],
        'Kalmunai' => ['lat' => 7.4098, 'lng' => 81.8344],

        // Add more cities as needed...
    ];

    public function getNearbyServiceAreas($latitude, $longitude, $radiusKm = 50)
    {
        $nearbyAreas = [];
        $userLocation = ['lat' => $latitude, 'lng' => $longitude];

        // Find nearby cities based on distance
        foreach ($this->cityCoordinates as $city => $coordinates) {
            $distance = $this->calculateDistance(
                $userLocation['lat'],
                $userLocation['lng'],
                $coordinates['lat'],
                $coordinates['lng']
            );

            if ($distance <= $radiusKm) {
                $nearbyAreas[] = [
                    'name' => $city,
                    'distance' => round($distance, 1),
                    'coordinates' => $coordinates
                ];
            }
        }

        // Sort by distance
        usort($nearbyAreas, function ($a, $b) {
            return $a['distance'] <=> $b['distance'];
        });

        // Also include the province/district of the selected location
        $province = $this->getProvinceFromCoordinates($latitude, $longitude);
        if ($province) {
            $provinceAreas = $this->getProvinceCities($province);
            foreach ($provinceAreas as $area) {
                if (!in_array($area, array_column($nearbyAreas, 'name'))) {
                    $nearbyAreas[] = [
                        'name' => $area,
                        'distance' => null, // Unknown distance
                        'coordinates' => $this->cityCoordinates[$area] ?? null,
                        'from_province' => true
                    ];
                }
            }
        }

        return [
            'nearby_areas' => array_slice($nearbyAreas, 0, 10), // Limit to 15 closest
            'province' => $province,
            'all_province_areas' => $province ? $this->getProvinceCities($province) : []
        ];
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return $distance;
    }

    private function getProvinceFromCoordinates($latitude, $longitude)
    {
        // Simple province detection based on coordinate ranges
        // This is a simplified version - you could use more sophisticated methods

        if ($latitude >= 6.5 && $latitude <= 7.5 && $longitude >= 79.5 && $longitude <= 80.5) {
            return 'Western Province';
        } elseif ($latitude >= 6.5 && $latitude <= 8.0 && $longitude >= 80.0 && $longitude <= 81.5) {
            return 'Central Province';
        } elseif ($latitude >= 5.5 && $latitude <= 6.5 && $longitude >= 80.0 && $longitude <= 82.0) {
            return 'Southern Province';
        } elseif ($latitude >= 8.5 && $latitude <= 10.0 && $longitude >= 79.5 && $longitude <= 81.0) {
            return 'Northern Province';
        } elseif ($latitude >= 7.0 && $latitude <= 9.0 && $longitude >= 81.0 && $longitude <= 82.5) {
            return 'Eastern Province';
        } elseif ($latitude >= 7.0 && $latitude <= 8.5 && $longitude >= 79.5 && $longitude <= 80.5) {
            return 'North Western Province';
        } elseif ($latitude >= 7.5 && $latitude <= 9.0 && $longitude >= 80.0 && $longitude <= 81.5) {
            return 'North Central Province';
        } elseif ($latitude >= 6.0 && $latitude <= 7.5 && $longitude >= 80.5 && $longitude <= 82.0) {
            return 'Uva Province';
        } elseif ($latitude >= 6.0 && $latitude <= 7.5 && $longitude >= 80.0 && $longitude <= 81.0) {
            return 'Sabaragamuwa Province';
        }

        return 'Western Province'; // Default fallback
    }

    private function getProvinceCities($province)
    {
        return $this->sriLankanProvinces[$province]['major_cities'] ?? [];
    }

    public function getAllServiceAreas()
    {
        $allAreas = [];
        foreach ($this->sriLankanProvinces as $province => $data) {
            $allAreas = array_merge($allAreas, $data['major_cities']);
        }
        sort($allAreas);
        return $allAreas;
    }
}
