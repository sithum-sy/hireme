<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class InAppNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message', 
        'type',
        'category',
        'appointment_id',
        'quote_id',
        'is_read',
        'action_url',
        'metadata'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getIconAttribute()
    {
        $icons = [
            'appointment' => 'fa-calendar-alt',
            'payment' => 'fa-credit-card',
            'system' => 'fa-cog',
            'general' => 'fa-info-circle'
        ];

        return $icons[$this->category] ?? 'fa-bell';
    }

    public function getColorClassAttribute()
    {
        $colors = [
            'info' => 'text-info',
            'success' => 'text-success', 
            'warning' => 'text-warning',
            'error' => 'text-danger'
        ];

        return $colors[$this->type] ?? 'text-secondary';
    }

    // Methods
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->update(['is_read' => true]);
        }
    }

    public function getRelatedEntity()
    {
        if ($this->appointment_id) {
            return $this->appointment;
        }
        
        if ($this->quote_id) {
            return $this->quote;
        }
        
        return null;
    }
}
