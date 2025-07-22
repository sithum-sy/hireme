<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'category_id',
        'title',
        'description',
        'pricing_type',
        'base_price',
        'duration_hours',
        'service_images',
        'requirements',
        'includes',
        'service_areas',
        // New location fields
        'latitude',
        'longitude',
        'location_address',
        'location_city',
        'location_neighborhood',
        'service_radius',
        'is_active',
        'views_count',
        'bookings_count',
        'average_rating'
    ];

    protected $casts = [
        'service_images' => 'array',
        'service_areas' => 'array',
        'base_price' => 'decimal:2',
        'duration_hours' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'service_radius' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function providerProfile()
    {
        return $this->hasOneThrough(ProviderProfile::class, User::class, 'id', 'user_id', 'provider_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function completedAppointments()
    {
        return $this->hasMany(Appointment::class)->where('status', 'completed');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function clientReviews()
    {
        return $this->hasMany(Review::class)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            ->where('status', Review::STATUS_PUBLISHED)
            ->where('is_hidden', false);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeInArea($query, $area)
    {
        return $query->whereJsonContains('service_areas', $area);
    }

    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('base_price', [$min, $max]);
    }

    public function scopeHighRated($query, $minRating = 4.0)
    {
        return $query->where('average_rating', '>=', $minRating);
    }

    /**
     * Scope to find services within a certain radius of a location
     * Uses Haversine formula for distance calculation
     */
    public function scopeNearLocation($query, $latitude, $longitude, $radius = 10)
    {
        $haversine = "(6371 * acos(cos(radians(?)) 
                     * cos(radians(latitude)) 
                     * cos(radians(longitude) - radians(?)) 
                     + sin(radians(?)) 
                     * sin(radians(latitude))))";

        return $query
            ->selectRaw("*, {$haversine} AS distance", [$latitude, $longitude, $latitude])
            ->whereRaw("{$haversine} <= ?", [$latitude, $longitude, $latitude, $radius])
            ->orderBy('distance');
    }

    /**
     * Scope to find services within their service radius of a location
     */
    public function scopeServingLocation($query, $latitude, $longitude)
    {
        $haversine = "(6371 * acos(cos(radians(?)) 
                     * cos(radians(latitude)) 
                     * cos(radians(longitude) - radians(?)) 
                     + sin(radians(?)) 
                     * sin(radians(latitude))))";

        return $query
            ->selectRaw("*, {$haversine} AS distance", [$latitude, $longitude, $latitude])
            ->whereRaw("{$haversine} <= service_radius", [$latitude, $longitude, $latitude])
            ->orderBy('distance');
    }

    /**
     * Scope for advanced search with multiple filters
     */
    public function scopeAdvancedSearch($query, $filters = [])
    {
        // Text search - Enhanced version
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")

                    // Search in category name
                    ->orWhereHas('category', function ($catQuery) use ($searchTerm) {
                        $catQuery->where('name', 'like', "%{$searchTerm}%");
                    })

                    // Search in provider name
                    ->orWhereHas('provider', function ($providerQuery) use ($searchTerm) {
                        $providerQuery->where('first_name', 'like', "%{$searchTerm}%")
                            ->orWhere('last_name', 'like', "%{$searchTerm}%")
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"]);
                    })

                    // Search in business name
                    ->orWhereHas('provider.providerProfile', function ($profileQuery) use ($searchTerm) {
                        $profileQuery->where('business_name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Category filter
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Price range filters
        if (!empty($filters['min_price'])) {
            $query->where('base_price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('base_price', '<=', $filters['max_price']);
        }

        // Rating filter
        if (!empty($filters['min_rating'])) {
            $query->where('average_rating', '>=', $filters['min_rating']);
        }

        // Pricing type filter
        if (!empty($filters['pricing_type'])) {
            $query->where('pricing_type', $filters['pricing_type']);
        }

        // Only active services
        $query->where('is_active', true);

        return $query;
    }

    /**
     * Scope for popular services (high views/bookings)
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->where('is_active', true)
            ->orderByDesc('views_count')
            ->orderByDesc('bookings_count')
            ->limit($limit);
    }

    /**
     * Scope for recent services
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('is_active', true)
            ->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('created_at');
    }

    // Accessors
    /**
     * Get service image URLs
     */
    public function getServiceImageUrlsAttribute()
    {
        if (empty($this->service_images)) {
            return [];
        }

        // If service_images is stored as JSON array of paths
        $images = is_string($this->service_images)
            ? json_decode($this->service_images, true)
            : $this->service_images;

        if (!is_array($images)) {
            return [];
        }

        return array_map(function ($imagePath) {
            // Convert paths to full URLs
            if (str_starts_with($imagePath, 'http')) {
                return $imagePath; // Already a full URL
            }
            
            // Check if file exists in public directory
            if (file_exists(public_path($imagePath))) {
                return asset($imagePath);
            }
            
            // Legacy fallback - check old storage location
            if (Storage::disk('public')->exists('services/' . basename($imagePath))) {
                return asset('storage/services/' . basename($imagePath));
            }
            
            // Return null if file doesn't exist
            return null;
        }, $images);
    }

    /**
     * Get first image URL
     */
    public function getFirstImageUrlAttribute()
    {
        $images = $this->service_image_urls;
        
        // Filter out null values (non-existent files)
        $validImages = array_filter($images);
        
        return !empty($validImages) ? array_values($validImages)[0] : null;
    }

    public function getFormattedPriceAttribute()
    {
        switch ($this->pricing_type) {
            case 'hourly':
                return 'Rs. ' . number_format($this->base_price, 2) . '/hour';
            case 'fixed':
                return 'Rs. ' . number_format($this->base_price, 2);
            case 'custom':
                return 'Custom pricing';
            default:
                return 'Rs. ' . number_format($this->base_price, 2);
        }
    }

    public function getRatingStarsAttribute()
    {
        return str_repeat('★', floor($this->average_rating)) .
            str_repeat('☆', 5 - floor($this->average_rating));
    }

    /**
     * Get service location as an array
     */
    public function getLocationAttribute()
    {
        if (!$this->latitude || !$this->longitude) {
            return null;
        }

        return [
            'lat' => $this->latitude,
            'lng' => $this->longitude,
            'address' => $this->location_address,
            'city' => $this->location_city,
            'neighborhood' => $this->location_neighborhood,
            'radius' => $this->service_radius,
        ];
    }

    /**
     * Check if service covers a specific location
     */
    public function coversLocation($latitude, $longitude)
    {
        if (!$this->latitude || !$this->longitude) {
            return false;
        }

        // Calculate distance using Haversine formula
        $earthRadius = 6371; // Earth radius in kilometers

        $latDiff = deg2rad($latitude - $this->latitude);
        $lonDiff = deg2rad($longitude - $this->longitude);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($this->latitude)) * cos(deg2rad($latitude)) *
            sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return $distance <= $this->service_radius;
    }

    // Helper Methods
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function incrementBookings()
    {
        $this->increment('bookings_count');
    }

    public function updateRating($newRating)
    {
        // Use reviews instead of appointments for rating calculation
        $averageRating = $this->clientReviews()->avg('rating');

        if ($averageRating !== null) {
            $this->average_rating = round($averageRating, 2);
            $this->save();
        }
    }

    /**
     * Get total bookings count from appointments
     */
    public function getActualBookingsCountAttribute()
    {
        return $this->appointments()
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();
    }

    /**
     * Sync booking count with actual appointments
     */
    public function syncBookingCount()
    {
        $actualCount = $this->appointments()
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        $this->update(['bookings_count' => $actualCount]);

        return $actualCount;
    }
}
