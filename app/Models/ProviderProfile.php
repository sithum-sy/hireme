<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * ProviderProfile Model - Extended profile information for service providers
 * 
 * Stores additional business information, verification status, and professional
 * details that supplement the base User model for service providers.
 */
class ProviderProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'business_license',
        'years_of_experience',
        'service_area_radius',
        'bio',
        'certifications',
        'portfolio_images',
        'verification_status',
        'verification_notes',
        'total_earnings',
        'is_available',
        'verified_at',
        'service_location'
    ];

    protected $casts = [
        'certifications' => 'array',
        'portfolio_images' => 'array',
        'total_earnings' => 'decimal:2',
        'is_available' => 'boolean',
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'provider_id', 'user_id');
    }

    public function activeServices()
    {
        return $this->hasMany(Service::class, 'provider_id', 'user_id')->where('is_active', true);
    }

    public function availability()
    {
        return $this->hasMany(ProviderAvailability::class, 'provider_id', 'user_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'provider_id', 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewee_id', 'user_id')
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER);
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'reviewee_id', 'user_id')
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            ->visible()
            ->verified();
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // Accessors
    public function getBusinessLicenseUrlAttribute()
    {
        return $this->business_license ? Storage::url($this->business_license) : null;
    }

    public function getCertificationUrlsAttribute()
    {
        if (!$this->certifications) return [];

        return array_map(function ($cert) {
            return Storage::url($cert);
        }, $this->certifications);
    }

    public function getPortfolioImageUrlsAttribute()
    {
        if (!$this->portfolio_images) return [];

        return array_map(function ($image) {
            return Storage::url($image);
        }, $this->portfolio_images);
    }

    public function getAverageRatingAttribute()
    {
        return $this->receivedReviews()
            ->avg('rating') ?: 0.00;
    }

    public function getTotalReviewsAttribute()
    {
        return $this->receivedReviews()->count();
    }

    public function getReviewsCountAttribute()
    {
        return $this->total_reviews;
    }

    public function getRatingStarsAttribute()
    {
        return str_repeat('★', floor($this->average_rating)) .
            str_repeat('☆', 5 - floor($this->average_rating));
    }

    // Helper Methods
    public function isVerified()
    {
        return $this->verification_status === 'verified';
    }

    public function isPending()
    {
        return $this->verification_status === 'pending';
    }

    public function isRejected()
    {
        return $this->verification_status === 'rejected';
    }

    // Rating calculation methods for additional breakdowns
    public function getQualityRatingAttribute()
    {
        return $this->receivedReviews()
            ->whereNotNull('quality_rating')
            ->avg('quality_rating') ?: 0.00;
    }

    public function getPunctualityRatingAttribute()
    {
        return $this->receivedReviews()
            ->whereNotNull('punctuality_rating')
            ->avg('punctuality_rating') ?: 0.00;
    }

    public function getCommunicationRatingAttribute()
    {
        return $this->receivedReviews()
            ->whereNotNull('communication_rating')
            ->avg('communication_rating') ?: 0.00;
    }

    public function getValueRatingAttribute()
    {
        return $this->receivedReviews()
            ->whereNotNull('value_rating')
            ->avg('value_rating') ?: 0.00;
    }

    public function getRecommendationPercentageAttribute()
    {
        $totalReviews = $this->receivedReviews()->whereNotNull('would_recommend')->count();
        if ($totalReviews === 0) return 0;
        
        $recommendations = $this->receivedReviews()
            ->where('would_recommend', true)
            ->count();
            
        return round(($recommendations / $totalReviews) * 100, 1);
    }
}
