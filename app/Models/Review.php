<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'reviewer_id',
        'reviewee_id',
        'review_type',
        'rating',
        'comment',
        'quality_rating',
        'punctuality_rating',
        'communication_rating',
        'value_rating',
        'would_recommend',
        'review_images',
        'is_verified',
        'is_featured',
        'is_hidden',
        'provider_response',
        'provider_responded_at',
        'helpful_count'
    ];

    protected $casts = [
        'review_images' => 'array',
        'would_recommend' => 'boolean',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'is_hidden' => 'boolean',
        'provider_responded_at' => 'datetime'
    ];

    // Constants
    public const TYPE_CLIENT_TO_PROVIDER = 'client_to_provider';
    public const TYPE_PROVIDER_TO_CLIENT = 'provider_to_client';

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }

    // Scopes
    public function scopeClientToProvider($query)
    {
        return $query->where('review_type', self::TYPE_CLIENT_TO_PROVIDER);
    }

    public function scopeProviderToClient($query)
    {
        return $query->where('review_type', self::TYPE_PROVIDER_TO_CLIENT);
    }

    public function scopeForProvider($query, $providerId)
    {
        return $query->where('reviewee_id', $providerId)
            ->where('review_type', self::TYPE_CLIENT_TO_PROVIDER);
    }

    public function scopeByClient($query, $clientId)
    {
        return $query->where('reviewer_id', $clientId)
            ->where('review_type', self::TYPE_CLIENT_TO_PROVIDER);
    }

    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // Helper methods
    public function isClientReview()
    {
        return $this->review_type === self::TYPE_CLIENT_TO_PROVIDER;
    }

    public function isProviderReview()
    {
        return $this->review_type === self::TYPE_PROVIDER_TO_CLIENT;
    }

    public function canBeRespondedTo()
    {
        return $this->isClientReview() && !$this->provider_response;
    }

    public function addProviderResponse($response)
    {
        $this->update([
            'provider_response' => $response,
            'provider_responded_at' => now()
        ]);
    }

    public function incrementHelpful()
    {
        $this->increment('helpful_count');
    }

    // Calculate overall rating from individual ratings
    public function getOverallRatingAttribute()
    {
        $ratings = array_filter([
            $this->quality_rating,
            $this->punctuality_rating,
            $this->communication_rating,
            $this->value_rating
        ]);

        return $ratings ? round(array_sum($ratings) / count($ratings), 1) : $this->rating;
    }
}
