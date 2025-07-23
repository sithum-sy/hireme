<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ProviderAvailability extends Model
{
    use HasFactory;

    protected $table = 'provider_availability';

    protected $fillable = [
        'provider_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available'
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    // Relationships
    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeForDay($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    // Accessors
    public function getDayNameAttribute()
    {
        $days = [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday'
        ];

        return $days[$this->day_of_week] ?? 'Unknown';
    }

    public function getFormattedTimeRangeAttribute()
    {
        if (!$this->start_time || !$this->end_time) return 'Not available';
        
        $startTime = is_string($this->start_time) ? \Carbon\Carbon::parse($this->start_time) : $this->start_time;
        $endTime = is_string($this->end_time) ? \Carbon\Carbon::parse($this->end_time) : $this->end_time;
        
        return $startTime->format('g:i A') . ' - ' . $endTime->format('g:i A');
    }

    // Helper Methods
    public static function getDaysOfWeek()
    {
        return [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday'
        ];
    }

    public function isAvailableAtTime($time)
    {
        if (!$this->is_available || !$this->start_time || !$this->end_time) return false;

        $checkTime = Carbon::parse($time);
        $startTime = is_string($this->start_time) ? Carbon::parse($this->start_time) : $this->start_time;
        $endTime = is_string($this->end_time) ? Carbon::parse($this->end_time) : $this->end_time;

        return $checkTime->between($startTime, $endTime);
    }
}
