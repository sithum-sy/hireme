<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'provider_id',
        'service_id',
        'appointment_date',
        'appointment_time',
        'duration_hours',
        'total_price',
        'base_price',
        'travel_fee',
        'location_type',
        'client_address',
        'client_city',
        'client_postal_code',
        'location_instructions',
        'client_phone',
        'client_email',
        'contact_preference',
        'client_notes',
        'payment_method',
        'status',
        'booking_source',
        'cancelled_at',
        'cancellation_reason',
        'provider_notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'duration_hours' => 'decimal:2',
        'total_price' => 'decimal:2',
        'base_price' => 'decimal:2',
        'travel_fee' => 'decimal:2',
        'client_location' => 'array',
        'client_rating' => 'decimal:1',
        'provider_rating' => 'decimal:1',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime'
    ];

    // Status constants to match migration
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED_BY_CLIENT = 'cancelled_by_client';
    public const STATUS_CANCELLED_BY_PROVIDER = 'cancelled_by_provider';
    public const STATUS_NO_SHOW = 'no_show';
    public const STATUS_DISPUTED = 'disputed';

    // Relationships
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED])
            ->where('appointment_date', '>=', now()->toDateString());
    }

    public function scopeToday($query)
    {
        return $query->where('appointment_date', now()->toDateString());
    }

    // Accessors
    public function getFullAppointmentDateTimeAttribute()
    {
        return Carbon::parse($this->appointment_date->format('Y-m-d') . ' ' . $this->appointment_time->format('H:i:s'));
    }

    public function getFormattedDateTimeAttribute()
    {
        return $this->appointment_date->format('M j, Y') . ' at ' . $this->appointment_time->format('g:i A');
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            self::STATUS_PENDING => 'badge bg-warning',
            self::STATUS_CONFIRMED => 'badge bg-success',
            self::STATUS_IN_PROGRESS => 'badge bg-primary',
            self::STATUS_COMPLETED => 'badge bg-info',
            self::STATUS_CANCELLED_BY_CLIENT => 'badge bg-danger',
            self::STATUS_CANCELLED_BY_PROVIDER => 'badge bg-danger',
            self::STATUS_NO_SHOW => 'badge bg-dark',
            self::STATUS_DISPUTED => 'badge bg-warning'
        ];

        return $badges[$this->status] ?? 'badge bg-secondary';
    }

    public function getStatusTextAttribute()
    {
        $statusTexts = [
            self::STATUS_PENDING => 'Pending Confirmation',
            self::STATUS_CONFIRMED => 'Confirmed',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED_BY_CLIENT => 'Cancelled by Client',
            self::STATUS_CANCELLED_BY_PROVIDER => 'Cancelled by Provider',
            self::STATUS_NO_SHOW => 'No Show',
            self::STATUS_DISPUTED => 'Disputed'
        ];

        return $statusTexts[$this->status] ?? ucfirst(str_replace('_', ' ', $this->status));
    }

    // Helper Methods
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isConfirmed()
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isCancelled()
    {
        return in_array($this->status, [
            self::STATUS_CANCELLED_BY_CLIENT,
            self::STATUS_CANCELLED_BY_PROVIDER
        ]);
    }

    public function canBeConfirmed()
    {
        return $this->isPending();
    }

    public function canBeCancelled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function confirm()
    {
        $this->update([
            'status' => self::STATUS_CONFIRMED,
            'confirmed_at' => now()
        ]);
    }

    public function start()
    {
        $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_at' => now()
        ]);
    }

    public function complete()
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now()
        ]);
    }

    public function cancel($cancelledBy = 'client', $reason = null)
    {
        $this->update([
            'status' => $cancelledBy === 'client'
                ? self::STATUS_CANCELLED_BY_CLIENT
                : self::STATUS_CANCELLED_BY_PROVIDER,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason
        ]);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    // Add this method
    public function hasInvoice()
    {
        return $this->invoices()->exists();
    }

    // Validation rules for different operations
    public static function getValidationRules($operation = 'create')
    {
        $baseRules = [
            'client_id' => 'required|exists:users,id',
            'provider_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'duration_hours' => 'required|numeric|min:0.5|max:24',
            'total_price' => 'required|numeric|min:0',
            'location_type' => 'required|in:client_address,provider_location,custom_location',
            'payment_method' => 'required|in:cash,card,bank_transfer',
        ];

        if ($operation === 'create') {
            $baseRules = array_merge($baseRules, [
                'client_phone' => 'nullable|string|max:20',
                'client_email' => 'nullable|email|max:255',
                'client_address' => 'required_if:location_type,client_address,custom_location|string|max:500',
                'client_city' => 'nullable|string|max:100',
                'client_postal_code' => 'nullable|string|max:20',
                'location_instructions' => 'nullable|string|max:1000',
                'contact_preference' => 'nullable|in:phone,message',
                'client_notes' => 'nullable|string|max:1000',
                'base_price' => 'nullable|numeric|min:0',
                'travel_fee' => 'nullable|numeric|min:0',
                'booking_source' => 'nullable|string|max:50',
            ]);
        }

        return $baseRules;
    }
}
