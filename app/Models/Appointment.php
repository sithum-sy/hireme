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
        'status',
        'client_address',
        'client_notes',
        'provider_notes',
        'client_location',
        'client_rating',
        'client_review',
        'provider_rating',
        'provider_review',
        'confirmed_at',
        'started_at',
        'completed_at',
        'cancelled_at'
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'duration_hours' => 'decimal:2',
        'total_price' => 'decimal:2',
        'client_location' => 'array',
        'client_rating' => 'decimal:1',
        'provider_rating' => 'decimal:1',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime'
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

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed'])
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
            'pending' => 'badge bg-warning',
            'confirmed' => 'badge bg-success',
            'in_progress' => 'badge bg-primary',
            'completed' => 'badge bg-info',
            'cancelled_by_client' => 'badge bg-danger',
            'cancelled_by_provider' => 'badge bg-danger'
        ];

        return $badges[$this->status] ?? 'badge bg-secondary';
    }

    public function getStatusTextAttribute()
    {
        $statusTexts = [
            'pending' => 'Pending Approval',
            'confirmed' => 'Confirmed',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'cancelled_by_client' => 'Cancelled by Client',
            'cancelled_by_provider' => 'Cancelled by Provider'
        ];

        return $statusTexts[$this->status] ?? ucfirst($this->status);
    }

    // Helper Methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isConfirmed()
    {
        return $this->status === 'confirmed';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isCancelled()
    {
        return in_array($this->status, ['cancelled_by_client', 'cancelled_by_provider']);
    }

    public function canBeConfirmed()
    {
        return $this->isPending();
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now()
        ]);
    }

    public function start()
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now()
        ]);
    }

    public function complete()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
    }

    public function cancel($cancelledBy = 'client')
    {
        $this->update([
            'status' => 'cancelled_by_' . $cancelledBy,
            'cancelled_at' => now()
        ]);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }
}
