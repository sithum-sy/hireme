<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Quote Model - Manages the quote request/response workflow between clients and providers
 * 
 * Handles the complete quote lifecycle from initial client request through provider response,
 * client acceptance/rejection, and conversion to appointments. Includes complex business logic
 * for quote expiration, pricing calculations, and status transitions.
 */
class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'provider_id',
        'service_id',
        'title',
        'description',

        // Client request data
        'quote_request_data',
        'client_requirements',

        // Provider response data
        'quoted_price',
        'duration_hours',
        'travel_fee',
        'quote_details',
        'terms_and_conditions',
        'pricing_breakdown',

        // Status and workflow
        'status',
        'valid_until',
        'client_notes',
        'provider_notes',
        'responded_at',
        'client_responded_at',

        // Appointment conversion
        'appointment_id',
    ];

    protected $casts = [
        'quote_request_data' => 'array',
        'pricing_breakdown' => 'array',
        'quoted_price' => 'decimal:2',
        'duration_hours' => 'decimal:2',
        'travel_fee' => 'decimal:2',
        'valid_until' => 'datetime',
        'responded_at' => 'datetime',
        'client_responded_at' => 'datetime',
    ];

    // Append accessor fields to API responses
    protected $appends = [
        'quote_number',
        'requested_date',
        'requested_time',
        'location_summary',
        'urgency',
        'status_text',
        'formatted_quoted_price',
        'time_remaining',
        'client_name',
        'client_verified',
        'service_title',
        'service_category',
        'service_category_name',
        'message',
        'provider_response',
        'expires_at'
    ];

    // Quote lifecycle status constants
    public const STATUS_PENDING = 'pending';        // Awaiting provider response
    public const STATUS_QUOTED = 'quoted';          // Provider has quoted, awaiting client response
    public const STATUS_ACCEPTED = 'accepted';      // Client accepted quote
    public const STATUS_REJECTED = 'rejected';      // Client rejected quote
    public const STATUS_EXPIRED = 'expired';        // Quote validity period expired
    public const STATUS_WITHDRAWN = 'withdrawn';    // Provider withdrew quote
    public const STATUS_CONVERTED = 'converted';    // Successfully converted to appointment

    // Relationships
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // public function provider()
    // {
    //     return $this->belongsTo(ProviderProfile::class, 'provider_id');
    // }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    // public function providerUser()
    // {
    //     return $this->belongsTo(User::class, 'provider_id');
    // }

    public function providerProfile()
    {
        return $this->hasOneThrough(ProviderProfile::class, User::class, 'id', 'user_id', 'provider_id', 'id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function appointment()
    {
        return $this->hasOne(Appointment::class, 'quote_id');
    }


    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeQuoted($query)
    {
        return $query->where('status', self::STATUS_QUOTED);
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    public function scopeAwaitingClientResponse($query)
    {
        return $query->where('status', self::STATUS_QUOTED)
            ->where('valid_until', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', self::STATUS_QUOTED)
            ->where('valid_until', '<=', now());
    }

    // Accessors for quote request data
    public function getRequestedDateAttribute()
    {
        return $this->quote_request_data['requested_date'] ?? null;
    }

    public function getRequestedTimeAttribute()
    {
        return $this->quote_request_data['requested_time'] ?? null;
    }

    public function getLocationTypeAttribute()
    {
        return $this->quote_request_data['location_type'] ?? 'client_address';
    }

    public function getServiceAddressAttribute()
    {
        return $this->quote_request_data['address'] ?? null;
    }

    public function getServiceCityAttribute()
    {
        return $this->quote_request_data['city'] ?? null;
    }

    public function getClientPhoneAttribute()
    {
        return $this->quote_request_data['phone'] ?? null;
    }

    public function getClientEmailAttribute()
    {
        return $this->quote_request_data['email'] ?? null;
    }

    public function getContactPreferenceAttribute()
    {
        return $this->quote_request_data['contact_preference'] ?? 'phone';
    }

    public function getSpecialRequirementsAttribute()
    {
        return $this->quote_request_data['special_requirements'] ?? null;
    }

    public function getUrgencyAttribute()
    {
        return $this->quote_request_data['urgency'] ?? 'normal';
    }

    public function getQuoteTypeAttribute()
    {
        return $this->quote_request_data['quote_type'] ?? 'standard';
    }

    public function getClientNameAttribute()
    {
        return $this->client ? $this->client->full_name : null;
    }

    public function getClientVerifiedAttribute()
    {
        return $this->client ? $this->client->email_verified_at !== null : false;
    }

    public function getServiceTitleAttribute()
    {
        return $this->service ? $this->service->title : null;
    }

    public function getServiceCategoryAttribute()
    {
        return $this->service && $this->service->category ? $this->service->category : null;
    }

    public function getServiceCategoryNameAttribute()
    {
        return $this->service && $this->service->category ? $this->service->category->name : null;
    }

    public function getMessageAttribute()
    {
        return $this->description;
    }

    public function getProviderResponseAttribute()
    {
        return $this->quote_details;
    }

    public function getExpiresAtAttribute()
    {
        return $this->valid_until;
    }

    // Helper methods
    public function getQuoteNumberAttribute()
    {
        return 'Q' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    public function getLocationSummaryAttribute()
    {
        $locationType = $this->location_type;
        $city = $this->service_city;

        switch ($locationType) {
            case 'client_address':
                return $city ? "At client location ({$city})" : "At client location";
            case 'provider_location':
                return "At provider location";
            case 'custom_location':
                return $city ? "Custom location ({$city})" : "Custom location";
            default:
                return "Location TBD";
        }
    }

    public function getFormattedQuotedPriceAttribute()
    {
        return $this->quoted_price ? 'Rs. ' . number_format($this->quoted_price, 0) : 'Pending';
    }

    public function getStatusTextAttribute()
    {
        $statusTexts = [
            self::STATUS_PENDING => 'Awaiting Provider Response',
            self::STATUS_QUOTED => 'Quote Received',
            self::STATUS_ACCEPTED => 'Quote Accepted',
            self::STATUS_REJECTED => 'Quote Declined',
            self::STATUS_EXPIRED => 'Quote Expired',
            self::STATUS_WITHDRAWN => 'Quote Withdrawn',
            self::STATUS_CONVERTED => 'Converted to Booking',
        ];

        return $statusTexts[$this->status] ?? ucfirst(str_replace('_', ' ', $this->status));
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            self::STATUS_PENDING => 'badge bg-warning',
            self::STATUS_QUOTED => 'badge bg-info',
            self::STATUS_ACCEPTED => 'badge bg-success',
            self::STATUS_REJECTED => 'badge bg-danger',
            self::STATUS_EXPIRED => 'badge bg-secondary',
            self::STATUS_WITHDRAWN => 'badge bg-dark',
            self::STATUS_CONVERTED => 'badge bg-primary',
        ];

        return $badges[$this->status] ?? 'badge bg-secondary';
    }

    /**
     * Calculate time remaining for quote expiration with smart formatting
     * Returns user-friendly time remaining or expiration status
     */
    public function getTimeRemainingAttribute()
    {
        if ($this->status !== self::STATUS_QUOTED || !$this->valid_until) {
            return null;
        }

        $diff = now()->diffInHours($this->valid_until, false);

        if ($diff <= 0) {
            return 'Expired';
        }

        if ($diff < 24) {
            return $diff . ' hours remaining';
        }

        return Carbon::parse($this->valid_until)->diffForHumans();
    }

    // Status check methods
    public function isAwaitingProviderResponse()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isAwaitingClientResponse()
    {
        return $this->status === self::STATUS_QUOTED &&
            $this->valid_until &&
            $this->valid_until > now();
    }

    public function hasExpired()
    {
        return $this->status === self::STATUS_QUOTED &&
            $this->valid_until &&
            $this->valid_until <= now();
    }

    public function canBeAccepted()
    {
        return $this->isAwaitingClientResponse();
    }

    public function canBeRejected()
    {
        return $this->isAwaitingClientResponse();
    }

    public function canBeWithdrawn()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_QUOTED]) &&
            !$this->appointment_id;
    }

    /**
     * Quote workflow action methods - Handle state transitions with business rules
     */
    
    /**
     * Provider submits quote response with pricing and validity period
     */
    public function markAsQuoted($quotedPrice, $duration, $details = null, $validDays = 7)
    {
        $this->update([
            'status' => self::STATUS_QUOTED,
            'quoted_price' => $quotedPrice,
            'duration_hours' => $duration,
            'quote_details' => $details,
            'valid_until' => now()->addDays($validDays),
            'responded_at' => now(),
        ]);
    }

    public function accept($clientNotes = null)
    {
        $this->update([
            'status' => self::STATUS_ACCEPTED,
            'client_notes' => $clientNotes,
            'client_responded_at' => now(),
        ]);
    }

    public function reject($clientNotes = null)
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'client_notes' => $clientNotes,
            'client_responded_at' => now(),
        ]);
    }

    public function withdraw($providerNotes = null)
    {
        $this->update([
            'status' => self::STATUS_WITHDRAWN,
            'provider_notes' => $providerNotes,
        ]);
    }

    public function convertToAppointment($appointmentId)
    {
        $this->update([
            'status' => self::STATUS_CONVERTED,
            'appointment_id' => $appointmentId,
        ]);
    }

    // Mark expired quotes (for scheduled job)
    public static function markExpiredQuotes()
    {
        return self::where('status', self::STATUS_QUOTED)
            ->where('valid_until', '<=', now())
            ->update(['status' => self::STATUS_EXPIRED]);
    }
}
