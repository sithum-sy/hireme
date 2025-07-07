<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'provider_id',
        'service_id',
        'title',
        'description',
        'client_requirements',
        'quoted_price',
        'duration_hours',
        'quote_details',
        'terms_and_conditions',
        'status',
        'valid_until',
        'client_notes',
        'provider_notes',
        'responded_at',
    ];

    protected $casts = [
        'quoted_price' => 'decimal:2',
        'duration_hours' => 'decimal:2',
        'valid_until' => 'datetime',
        'responded_at' => 'datetime',
    ];

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

    public function appointment()
    {
        return $this->hasOne(Appointment::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'accepted'])
            ->where('valid_until', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'pending')
            ->where('valid_until', '<=', now());
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->quoted_price, 2);
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'badge bg-warning',
            'accepted' => 'badge bg-success',
            'rejected' => 'badge bg-danger',
            'expired' => 'badge bg-secondary',
            'withdrawn' => 'badge bg-dark',
        ];

        return $badges[$this->status] ?? 'badge bg-secondary';
    }

    public function getTimeRemainingAttribute()
    {
        if ($this->status !== 'pending') {
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

    // Helper Methods
    public function isPending()
    {
        return $this->status === 'pending' && $this->valid_until > now();
    }

    public function isAccepted()
    {
        return $this->status === 'accepted';
    }

    public function isExpired()
    {
        return $this->status === 'pending' && $this->valid_until <= now();
    }

    public function canBeAccepted()
    {
        return $this->isPending();
    }

    public function canBeRejected()
    {
        return $this->isPending();
    }

    public function canBeWithdrawn()
    {
        return in_array($this->status, ['pending', 'accepted']) && !$this->appointment;
    }

    public function accept($clientNotes = null)
    {
        $this->update([
            'status' => 'accepted',
            'client_notes' => $clientNotes,
            'responded_at' => now(),
        ]);
    }

    public function reject($clientNotes = null)
    {
        $this->update([
            'status' => 'rejected',
            'client_notes' => $clientNotes,
            'responded_at' => now(),
        ]);
    }

    public function withdraw($providerNotes = null)
    {
        $this->update([
            'status' => 'withdrawn',
            'provider_notes' => $providerNotes,
        ]);
    }
}
