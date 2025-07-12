<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BlockedTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'reason',
        'all_day',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',  // Ensure consistent format
        'end_date' => 'date:Y-m-d',    // Ensure consistent format
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'all_day' => 'boolean',
    ];

    // Relationships
    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('end_date', '>=', now()->toDateString());
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date);
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
                ->orWhereBetween('end_date', [$startDate, $endDate])
                ->orWhere(function ($subQ) use ($startDate, $endDate) {
                    $subQ->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                });
        });
    }

    // Accessors
    public function getFormattedDateRangeAttribute()
    {
        // Use Carbon explicitly and avoid timezone issues
        $startDate = Carbon::parse($this->start_date)->startOfDay();
        $endDate = Carbon::parse($this->end_date)->startOfDay();

        if ($startDate->isSameDay($endDate)) {
            return $startDate->format('M j, Y');
        }

        return $startDate->format('M j, Y') . ' - ' . $endDate->format('M j, Y');
    }

    public function getFormattedTimeRangeAttribute()
    {
        if ($this->all_day) {
            return 'All day';
        }

        if (!$this->start_time || !$this->end_time) {
            return 'All day';
        }

        return $this->start_time->format('g:i A') . ' - ' . $this->end_time->format('g:i A');
    }

    // Helper Methods
    public function isActive()
    {
        return $this->end_date->gte(now()->toDateString());
    }

    public function isOnDate($date)
    {
        $checkDate = Carbon::parse($date)->toDateString();
        return $this->start_date->lte($checkDate) && $this->end_date->gte($checkDate);
    }

    public function conflictsWith($startDate, $endDate, $startTime = null, $endTime = null)
    {
        // Check date overlap
        if ($this->end_date->lt($startDate) || $this->start_date->gt($endDate)) {
            return false;
        }

        // If either is all day, there's a conflict
        if ($this->all_day || (!$startTime || !$endTime)) {
            return true;
        }

        // Check time overlap on overlapping dates
        if (!$this->start_time || !$this->end_time) {
            return true; // Blocked time is all day
        }

        return !($this->end_time->lte($startTime) || $this->start_time->gte($endTime));
    }
}
