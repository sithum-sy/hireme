<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Appointment Model - Manages service bookings between clients and providers
 * 
 * Handles the complete appointment lifecycle from booking to completion,
 * including status management, payment tracking, and review coordination.
 */
class Appointment extends Model
{
    use HasFactory;


    protected $fillable = [
        'client_id',
        'provider_id',
        'service_id',
        'quote_id',
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
        'invoice_sent_at',
        'payment_received_at',
        'reviews_completed_at',
        'expires_at',
        'auto_expired',
        'reminder_24h_sent_at'
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'duration_hours' => 'integer',
        'total_price' => 'decimal:2',
        'base_price' => 'decimal:2',
        'travel_fee' => 'decimal:2',
        'client_location' => 'array',
        // 'client_rating' => 'decimal:1',
        // 'provider_rating' => 'decimal:1',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'invoice_sent_at' => 'datetime',
        'payment_received_at' => 'datetime',
        'reviews_completed_at' => 'datetime',
        'expires_at' => 'datetime',
        'auto_expired' => 'boolean',
        'reminder_24h_sent_at' => 'datetime'
    ];

    // Appointment status constants defining the complete lifecycle workflow
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_INVOICE_SENT = 'invoice_sent';
    public const STATUS_PAYMENT_PENDING = 'payment_pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_REVIEWED = 'reviewed';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_CANCELLED_BY_CLIENT = 'cancelled_by_client';
    public const STATUS_CANCELLED_BY_PROVIDER = 'cancelled_by_provider';
    public const STATUS_CANCELLED_BY_STAFF = 'cancelled_by_staff';
    public const STATUS_NO_SHOW = 'no_show';
    public const STATUS_DISPUTED = 'disputed';
    public const STATUS_EXPIRED = 'expired';

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

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function clientReview()
    {
        return $this->hasOne(Review::class)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER);
    }

    public function providerReview()
    {
        return $this->hasOne(Review::class)
            ->where('review_type', Review::TYPE_PROVIDER_TO_CLIENT);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function rescheduleRequests()
    {
        return $this->hasMany(RescheduleRequest::class);
    }

    public function pendingRescheduleRequest()
    {
        return $this->hasOne(RescheduleRequest::class)
            ->where('status', RescheduleRequest::STATUS_PENDING)
            ->latest();
    }

    public function latestRescheduleRequest()
    {
        return $this->hasOne(RescheduleRequest::class)->latest();
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

    public function scopeForDate($query, $date)
    {
        return $query->where('appointment_date', $date);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending_confirmation', 'confirmed', 'in_progress']);
    }

    // Date/time formatting accessors for display purposes
    public function getFullAppointmentDateTimeAttribute()
    {
        return Carbon::parse($this->appointment_date->format('Y-m-d') . ' ' . $this->appointment_time);
    }

    public function getFormattedDateTimeAttribute()
    {
        $time = Carbon::createFromFormat('H:i:s', $this->appointment_time);
        return $this->appointment_date->format('M j, Y') . ' at ' . $time->format('g:i A');
    }

    public function getFormattedTimeRangeAttribute()
    {
        $start = Carbon::createFromFormat('H:i:s', $this->appointment_time);
        $end = $start->copy()->addHours($this->duration_hours);

        return $start->format('g:i A') . ' - ' . $end->format('g:i A');
    }

    /**
     * Get Bootstrap badge class for status display
     * Maps appointment statuses to appropriate Bootstrap badge colors
     */
    public function getStatusBadgeAttribute()
    {
        $badges = [
            self::STATUS_PENDING => 'badge bg-warning',
            self::STATUS_CONFIRMED => 'badge bg-success',
            self::STATUS_IN_PROGRESS => 'badge bg-primary',
            self::STATUS_COMPLETED => 'badge bg-info',
            self::STATUS_INVOICE_SENT => 'badge bg-info',
            self::STATUS_PAYMENT_PENDING => 'badge bg-warning',
            self::STATUS_PAID => 'badge bg-success',
            self::STATUS_REVIEWED => 'badge bg-success',
            self::STATUS_CLOSED => 'badge bg-secondary',
            self::STATUS_CANCELLED_BY_CLIENT => 'badge bg-danger',
            self::STATUS_CANCELLED_BY_PROVIDER => 'badge bg-danger',
            self::STATUS_CANCELLED_BY_STAFF => 'badge bg-danger',
            self::STATUS_NO_SHOW => 'badge bg-dark',
            self::STATUS_DISPUTED => 'badge bg-warning',
            self::STATUS_EXPIRED => 'badge bg-dark'
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
            self::STATUS_INVOICE_SENT => 'Invoice Sent',
            self::STATUS_PAYMENT_PENDING => 'Payment Pending',
            self::STATUS_PAID => 'Paid',
            self::STATUS_REVIEWED => 'Reviewed',
            self::STATUS_CLOSED => 'Closed',
            self::STATUS_CANCELLED_BY_CLIENT => 'Cancelled by Client',
            self::STATUS_CANCELLED_BY_PROVIDER => 'Cancelled by Provider',
            self::STATUS_CANCELLED_BY_STAFF => 'Cancelled by Staff',
            self::STATUS_NO_SHOW => 'No Show',
            self::STATUS_DISPUTED => 'Disputed',
            self::STATUS_EXPIRED => 'Expired'
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
            self::STATUS_CANCELLED_BY_PROVIDER,
            self::STATUS_CANCELLED_BY_STAFF
        ]);
    }

    public function isInvoiceSent()
    {
        return $this->status === self::STATUS_INVOICE_SENT;
    }

    public function isPaymentPending()
    {
        return $this->status === self::STATUS_PAYMENT_PENDING;
    }

    public function isPaid()
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isReviewed()
    {
        return $this->status === self::STATUS_REVIEWED;
    }

    public function isClosed()
    {
        return $this->status === self::STATUS_CLOSED;
    }

    public function canBeConfirmed()
    {
        return $this->isPending();
    }

    public function canBeCancelled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    public function canBeRescheduled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED])
            && !$this->hasPendingRescheduleRequest();
    }

    public function hasPendingRescheduleRequest()
    {
        return $this->pendingRescheduleRequest()->exists();
    }

    public function getPendingRescheduleRequestAttribute()
    {
        return $this->pendingRescheduleRequest()->first();
    }

    public function applyReschedule(RescheduleRequest $rescheduleRequest)
    {
        $this->update([
            'appointment_date' => $rescheduleRequest->requested_date,
            'appointment_time' => $rescheduleRequest->requested_time,
            'client_phone' => $rescheduleRequest->client_phone ?: $this->client_phone,
            'client_email' => $rescheduleRequest->client_email ?: $this->client_email,
            'client_address' => $rescheduleRequest->client_address ?: $this->client_address,
            'location_type' => $rescheduleRequest->location_type ?: $this->location_type,
        ]);

        return $this;
    }

    public function markInvoiceSent()
    {
        $this->update([
            'status' => self::STATUS_INVOICE_SENT,
            'invoice_sent_at' => now()
        ]);
    }

    public function markPaymentPending()
    {
        $this->update([
            'status' => self::STATUS_PAYMENT_PENDING
        ]);
    }

    public function markPaymentReceived()
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'payment_received_at' => now()
        ]);
    }

    public function markAsReviewed()
    {
        $this->update([
            'status' => self::STATUS_REVIEWED,
            'reviews_completed_at' => now()
        ]);
    }

    public function closeAppointment()
    {
        $this->update([
            'status' => self::STATUS_CLOSED
        ]);
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

    /**
     * Cancel appointment with appropriate status based on who initiated cancellation
     * Uses PHP 8 match expression for cleaner status determination
     */
    public function cancel($cancelledBy = 'client', $reason = null)
    {
        $status = match ($cancelledBy) {
            'client' => self::STATUS_CANCELLED_BY_CLIENT,
            'provider' => self::STATUS_CANCELLED_BY_PROVIDER,
            'staff' => self::STATUS_CANCELLED_BY_STAFF,
            default => self::STATUS_CANCELLED_BY_CLIENT
        };

        $this->update([
            'status' => $status,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason
        ]);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    // Add this method
    public function hasInvoice()
    {
        return $this->invoices()->exists();
    }

    /**
     * Get validation rules for appointment operations
     * Provides different rule sets for create/update operations
     */
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

    // Review-related methods
    public function canBeReviewed()
    {
        return $this->status === self::STATUS_PAID && !$this->reviews_completed_at;
    }

    public function hasClientReview()
    {
        return $this->clientReview()->exists();
    }

    public function hasProviderReview()
    {
        return $this->providerReview()->exists();
    }

    public function areReviewsCompleted()
    {
        return !is_null($this->reviews_completed_at);
    }

    public function markReviewsCompleted()
    {
        $this->update([
            'reviews_completed_at' => now(),
            'status' => self::STATUS_REVIEWED
        ]);
    }

    // Get client's rating for this appointment
    public function getClientRatingAttribute()
    {
        return $this->clientReview?->rating;
    }

    // Get provider's rating for this appointment  
    public function getProviderRatingAttribute()
    {
        return $this->providerReview?->rating;
    }

    public function canReceivePayment()
    {
        return in_array($this->status, [
            self::STATUS_COMPLETED,
            self::STATUS_INVOICE_SENT,
            self::STATUS_PAYMENT_PENDING
        ]) && $this->hasInvoice();
    }

    // Add method to check if appointment can be invoiced
    public function canBeInvoiced()
    {
        return $this->status === self::STATUS_COMPLETED && !$this->hasInvoice();
    }

    /**
     * Check if appointment should be auto-expired
     * Business rule: appointments expire after 24 hours without provider response
     */
    public function isExpired()
    {
        return $this->status === self::STATUS_PENDING
            && $this->created_at->lt(now()->subHours(24));
    }

    /**
     * Mark appointment as expired with automatic system reason
     */
    public function markAsExpired($reason = 'Auto-expired due to provider non-response after 24 hours')
    {
        $this->update([
            'status' => self::STATUS_EXPIRED,
            'auto_expired' => true,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason
        ]);
    }

    /**
     * Check if appointment was auto-expired
     */
    public function wasAutoExpired()
    {
        return $this->auto_expired === true;
    }

    /**
     * Get hours since appointment was created
     */
    public function getHoursSinceCreatedAttribute()
    {
        return $this->created_at->diffInHours(now());
    }

    /**
     * Scope for expired appointments
     */
    public function scopeExpired($query)
    {
        return $query->where('status', self::STATUS_EXPIRED);
    }

    /**
     * Scope for auto-expired appointments
     */
    public function scopeAutoExpired($query)
    {
        return $query->where('auto_expired', true);
    }

    /**
     * Scope for pending appointments that should be expired
     */
    public function scopeShouldBeExpired($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('created_at', '<=', now()->subHours(24))
            ->where(function ($q) {
                $q->whereNull('auto_expired')
                    ->orWhere('auto_expired', false);
            });
    }

    /**
     * Scope for confirmed appointments needing 24-hour reminders
     */
    public function scopeNeedingReminders($query)
    {
        $targetStart = now()->addHours(23);
        $targetEnd = now()->addHours(25);
        
        return $query->where('status', self::STATUS_CONFIRMED)
            ->whereNull('reminder_24h_sent_at')
            ->whereBetween('appointment_date', [
                $targetStart->toDateString(),
                $targetEnd->toDateString()
            ]);
    }

    /**
     * Check if appointment needs a 24-hour reminder
     */
    public function needsReminder(): bool
    {
        if ($this->status !== self::STATUS_CONFIRMED || $this->reminder_24h_sent_at) {
            return false;
        }

        $appointmentDateTime = Carbon::parse($this->appointment_date->format('Y-m-d') . ' ' . $this->appointment_time);
        $targetStart = now()->addHours(23);
        $targetEnd = now()->addHours(25);

        return $appointmentDateTime->between($targetStart, $targetEnd);
    }

}
