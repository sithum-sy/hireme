<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'appointment_id',
        'provider_id',
        'client_id',
        'subtotal',
        'tax_amount',
        'platform_fee',
        'total_amount',
        'provider_earnings',
        'status',
        'payment_status',
        'payment_method',
        'transaction_id',
        'issued_at',
        'due_date',
        'paid_at',
        'sent_at',
        'notes',
        'line_items',
        'payment_details',
        'stripe_payment_intent_id',
        'service_fee',
        'payment_details',
        'client_viewed_at'
    ];

    protected $casts = [
        'line_items' => 'array',
        'payment_details' => 'array',
        'issued_at' => 'datetime',
        'due_date' => 'datetime',
        'paid_at' => 'datetime',
        'sent_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'provider_earnings' => 'decimal:2',
        'client_viewed_at' => 'datetime'
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Accessors
    public function getFormattedInvoiceNumberAttribute()
    {
        return 'INV-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    public function getIsOverdueAttribute()
    {
        return $this->due_date && $this->due_date->isPast() && $this->payment_status !== 'completed';
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue) return 0;
        return $this->due_date->diffInDays(now());
    }

    public function getStatusTextAttribute()
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'sent' => 'Sent',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            default => ucfirst($this->status)
        };
    }

    public function getPaymentStatusTextAttribute()
    {
        return match ($this->payment_status) {
            'pending' => 'Pending Payment',
            'processing' => 'Processing',
            'completed' => 'Paid',
            'failed' => 'Payment Failed',
            'refunded' => 'Refunded',
            default => ucfirst($this->payment_status)
        };
    }

    public function markAsViewed()
    {
        $this->update([
            'client_viewed_at' => now()
        ]);
    }

    public function hasBeenViewed()
    {
        return !is_null($this->client_viewed_at);
    }

    // Methods
    public function generateInvoiceNumber()
    {
        $prefix = 'INV';
        $year = date('Y');
        $month = date('m');

        // Get last invoice number for this month
        $lastInvoice = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ? (intval(substr($lastInvoice->invoice_number, -4)) + 1) : 1;

        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now()
        ]);
    }

    public function markAsPaid($paymentDetails = [])
    {
        $this->update([
            'status' => 'paid',
            'payment_status' => 'completed',
            'paid_at' => now(),
            'payment_details' => array_merge($this->payment_details ?? [], $paymentDetails)
        ]);

        // Update related appointment status
        if ($this->appointment) {
            $this->appointment->markPaymentReceived();
        }
    }

    // public function canBepaid()
    // {
    //     return in_array($this->status, ['sent']) && $this->payment_status === 'pending';
    // }

    public function canBePaid()
    {
        return $this->payment_status === 'pending' &&
            in_array($this->status, ['draft', 'sent', 'viewed']);
    }

    public function isAwaitingPayment()
    {
        return $this->status === 'sent' && $this->payment_status === 'pending';
    }

    public function canBeEdited()
    {
        return in_array($this->status, ['draft']);
    }

    public function canBeSent()
    {
        return in_array($this->status, ['draft']);
    }


    // Scopes
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->where('payment_status', '!=', 'completed');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function createPayment($method, $amount, $additionalData = [])
    {
        return $this->payments()->create([
            'appointment_id' => $this->appointment_id,
            'client_id' => $this->client_id,
            'provider_id' => $this->provider_id,
            'method' => $method,
            'amount' => $amount,
            'currency' => 'LKR',
            'status' => Payment::STATUS_PENDING,
            ...$additionalData
        ]);
    }
}
