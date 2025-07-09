<?php

// =====================================
// 1. STAFF ACTIVITY MODEL
// =====================================

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'action_type',
        'target_type',
        'target_id',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function target()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeByStaff($query, $staffId)
    {
        return $query->where('staff_id', $staffId);
    }

    public function scopeByAction($query, $actionType)
    {
        return $query->where('action_type', $actionType);
    }

    // Constants for action types
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';
    const ACTION_DELETE = 'delete';
    const ACTION_VIEW = 'view';
    const ACTION_ACTIVATE = 'activate';
    const ACTION_DEACTIVATE = 'deactivate';
    const ACTION_APPROVE = 'approve';
    const ACTION_REJECT = 'reject';
    const ACTION_ASSIGN = 'assign';
    const ACTION_RESOLVE = 'resolve';
    const ACTION_LOGIN = 'login';
    const ACTION_LOGOUT = 'logout';
}
