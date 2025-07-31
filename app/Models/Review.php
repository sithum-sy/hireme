<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Review Model - Manages the bidirectional review system between clients and providers
 * 
 * Handles detailed review functionality including multi-dimensional ratings (quality, 
 * punctuality, communication, value), provider responses, moderation features, and 
 * helpfulness tracking. Supports both client-to-provider and provider-to-client reviews.
 */
class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'reviewer_id',
        'reviewee_id',
        'service_id',
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
        'status',
        'provider_response',
        'provider_responded_at',
        'helpful_count',
        'flagged_at',
        'moderation_notes'
    ];

    protected $casts = [
        'review_images' => 'array',
        'would_recommend' => 'boolean',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'is_hidden' => 'boolean',
        'provider_responded_at' => 'datetime',
        'flagged_at' => 'datetime'
    ];

    // Review type constants for bidirectional review system
    public const TYPE_CLIENT_TO_PROVIDER = 'client_to_provider';
    public const TYPE_PROVIDER_TO_CLIENT = 'provider_to_client';

    // Review status constants for moderation and visibility control
    public const STATUS_DRAFT = 'draft';         // Review being written
    public const STATUS_PUBLISHED = 'published'; // Live and visible
    public const STATUS_HIDDEN = 'hidden';       // Hidden by admin/staff
    public const STATUS_FLAGGED = 'flagged';     // Flagged for review

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

    //   Added service relationship
    public function service()
    {
        return $this->belongsTo(Service::class);
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
        return $query->where('is_hidden', false)
            ->where('status', self::STATUS_PUBLISHED);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    //   Added status scopes
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeFlagged($query)
    {
        return $query->where('status', self::STATUS_FLAGGED);
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

    //   Added flag method
    public function flagForModeration($reason = null)
    {
        $this->update([
            'status' => self::STATUS_FLAGGED,
            'flagged_at' => now(),
            'moderation_notes' => $reason
        ]);
    }

    //   Added publish method
    public function publish()
    {
        $this->update([
            'status' => self::STATUS_PUBLISHED,
            'is_hidden' => false
        ]);
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

    //   Added published status check
    public function isPublished()
    {
        return $this->status === self::STATUS_PUBLISHED && !$this->is_hidden;
    }
}
