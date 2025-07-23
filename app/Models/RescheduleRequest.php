<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RescheduleRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'requested_by',
        'original_date',
        'original_time',
        'requested_date',
        'requested_time',
        'reason',
        'notes',
        'status',
        'response_notes',
        'responded_at',
        'responded_by',
        'client_phone',
        'client_email',
        'client_address',
        'location_type'
    ];

    protected $casts = [
        'original_date' => 'date',
        'original_time' => 'datetime:H:i',
        'requested_date' => 'date',
        'requested_time' => 'datetime:H:i',
        'responded_at' => 'datetime'
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_DECLINED = 'declined';

    // Reason constants
    public const REASON_PERSONAL_EMERGENCY = 'personal_emergency';
    public const REASON_WORK_CONFLICT = 'work_conflict';
    public const REASON_TRAVEL_PLANS = 'travel_plans';
    public const REASON_HEALTH_REASONS = 'health_reasons';
    public const REASON_WEATHER_CONCERNS = 'weather_concerns';
    public const REASON_PROVIDER_REQUEST = 'provider_request';
    public const REASON_OTHER = 'other';

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function respondedBy()
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeDeclined($query)
    {
        return $query->where('status', self::STATUS_DECLINED);
    }

    public function scopeForProvider($query, $providerId)
    {
        return $query->whereHas('appointment', function($q) use ($providerId) {
            $q->where('provider_id', $providerId);
        });
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->whereHas('appointment', function($q) use ($clientId) {
            $q->where('client_id', $clientId);
        });
    }

    // Helper methods
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isDeclined()
    {
        return $this->status === self::STATUS_DECLINED;
    }

    public function canBeResponded()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function approve($respondedBy, $responseNotes = null)
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'responded_by' => $respondedBy,
            'responded_at' => now(),
            'response_notes' => $responseNotes
        ]);

        return $this;
    }

    public function decline($respondedBy, $responseNotes)
    {
        $this->update([
            'status' => self::STATUS_DECLINED,
            'responded_by' => $respondedBy,
            'responded_at' => now(),
            'response_notes' => $responseNotes
        ]);

        return $this;
    }

    // Accessors
    public function getFormattedOriginalDateTimeAttribute()
    {
        return $this->original_date->format('M j, Y') . ' at ' . 
               Carbon::parse($this->original_time)->format('g:i A');
    }

    public function getFormattedRequestedDateTimeAttribute()
    {
        return $this->requested_date->format('M j, Y') . ' at ' . 
               Carbon::parse($this->requested_time)->format('g:i A');
    }

    public function getReasonTextAttribute()
    {
        $reasons = [
            self::REASON_PERSONAL_EMERGENCY => 'Personal emergency',
            self::REASON_WORK_CONFLICT => 'Work schedule conflict',
            self::REASON_TRAVEL_PLANS => 'Travel plans changed',
            self::REASON_HEALTH_REASONS => 'Health reasons',
            self::REASON_WEATHER_CONCERNS => 'Weather concerns',
            self::REASON_PROVIDER_REQUEST => 'Provider request',
            self::REASON_OTHER => 'Other reason'
        ];

        return $reasons[$this->reason] ?? $this->reason;
    }

    public function getStatusBadgeClassAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'bg-warning text-dark',
            self::STATUS_APPROVED => 'bg-success text-white',
            self::STATUS_DECLINED => 'bg-danger text-white',
            default => 'bg-secondary text-white'
        };
    }

    public function getStatusTextAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pending Response',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_DECLINED => 'Declined',
            default => ucfirst($this->status)
        };
    }
}