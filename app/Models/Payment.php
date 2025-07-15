<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'invoice_id',
        'client_id',
        'provider_id',
        'method',
        'status',
        'amount',
        'currency',
        'stripe_payment_intent_id',
        'stripe_payment_method_id',
        'stripe_charge_id',
        'transaction_id',
        'payment_details',
        'failure_reason',
        'processed_at',
        'failed_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'processed_at' => 'datetime',
        'failed_at' => 'datetime'
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    // Method constants
    public const METHOD_STRIPE = 'stripe';
    public const METHOD_CASH = 'cash';

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    // Status check methods
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isStripePayment()
    {
        return $this->method === self::METHOD_STRIPE;
    }

    public function isCashPayment()
    {
        return $this->method === self::METHOD_CASH;
    }

    // Payment processing methods
    public function markAsCompleted($details = [])
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'processed_at' => now(),
            'payment_details' => array_merge($this->payment_details ?? [], $details)
        ]);
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'failed_at' => now(),
            'failure_reason' => $reason
        ]);
    }

    public function markAsProcessing()
    {
        $this->update([
            'status' => self::STATUS_PROCESSING
        ]);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeStripePayments($query)
    {
        return $query->where('method', self::METHOD_STRIPE);
    }

    public function scopeCashPayments($query)
    {
        return $query->where('method', self::METHOD_CASH);
    }
}
