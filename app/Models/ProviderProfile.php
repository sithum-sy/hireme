<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
        'average_rating',
        'total_reviews',
        'total_earnings',
        'is_available',
        'verified_at',
        'service_location'
    ];

    protected $casts = [
        'certifications' => 'array',
        'portfolio_images' => 'array',
        'average_rating' => 'decimal:2',
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

    public function updateRating($newRating)
    {
        $this->total_reviews++;
        $this->average_rating = (($this->average_rating * ($this->total_reviews - 1)) + $newRating) / $this->total_reviews;
        $this->save();
    }
}
