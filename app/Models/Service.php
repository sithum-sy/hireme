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

    // Accessors
    public function getServiceImageUrlsAttribute()
    {
        if (!$this->service_images) return [];

        return array_map(function ($image) {
            return Storage::url($image);
        }, $this->service_images);
    }

    public function getFirstImageUrlAttribute()
    {
        $images = $this->service_image_urls;
        return count($images) > 0 ? $images[0] : asset('images/default-service.jpg');
    }

    public function getFormattedPriceAttribute()
    {
        switch ($this->pricing_type) {
            case 'hourly':
                return '$' . number_format($this->base_price, 2) . '/hour';
            case 'fixed':
                return '$' . number_format($this->base_price, 2);
            case 'custom':
                return 'Custom pricing';
            default:
                return '$' . number_format($this->base_price, 2);
        }
    }

    public function getRatingStarsAttribute()
    {
        return str_repeat('★', floor($this->average_rating)) .
            str_repeat('☆', 5 - floor($this->average_rating));
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
        $completedCount = $this->completedAppointments()->count();
        if ($completedCount > 0) {
            $this->average_rating = $this->completedAppointments()
                ->whereNotNull('provider_rating')
                ->avg('provider_rating');
            $this->save();
        }
    }
}
