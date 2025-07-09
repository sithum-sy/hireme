<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'date_of_birth',
        'address',
        'contact_number',
        'profile_picture',
        'is_active',
        'email_verified_at',
        'created_by',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * IMPORTANT: Specify date format for consistent handling
     *
     * @var array<string>
     */
    protected $dates = [
        'date_of_birth',
        'email_verified_at',
        'last_login_at',
        'created_at',
        'updated_at'
    ];

    // Role constants
    const ROLE_CLIENT = 'client';
    const ROLE_SERVICE_PROVIDER = 'service_provider';
    const ROLE_ADMIN = 'admin';
    const ROLE_STAFF = 'staff';

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    // Role helper methods
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    public function isClient()
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function isServiceProvider()
    {
        return $this->role === self::ROLE_SERVICE_PROVIDER;
    }

    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isStaff()
    {
        return $this->role === self::ROLE_STAFF;
    }

    // Relationships
    public function providerProfile()
    {
        return $this->hasOne(ProviderProfile::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'provider_id');
    }

    public function availability()
    {
        return $this->hasMany(ProviderAvailability::class, 'provider_id');
    }

    public function providerAppointments()
    {
        return $this->hasMany(Appointment::class, 'provider_id');
    }

    public function clientAppointments()
    {
        return $this->hasMany(Appointment::class, 'client_id');
    }

    /**
     * Relationship for tracking who created this user (for staff accounts)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship for users created by this user (admin creating staff)
     */
    public function createdUsers()
    {
        return $this->hasMany(User::class, 'created_by');
    }

    // Helper methods
    // public function isServiceProvider()
    // {
    //     return $this->role === 'service_provider';
    // }

    public function hasProviderProfile()
    {
        return $this->providerProfile()->exists();
    }

    public function isVerifiedProvider()
    {
        return $this->hasProviderProfile() && $this->providerProfile->isVerified();
    }

    public function blockedTimes()
    {
        return $this->hasMany(BlockedTime::class, 'provider_id');
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin()
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Check if user was created by another user (admin/staff creation)
     */
    public function wasCreatedByAdmin()
    {
        return $this->created_by !== null;
    }

    /**
     * Get human-readable last login time
     */
    public function getLastLoginHumanAttribute()
    {
        if (!$this->last_login_at) {
            return 'Never logged in';
        }

        return $this->last_login_at->diffForHumans();
    }

    /**
     * Check if user has logged in recently (within last 30 days)
     */
    public function hasRecentActivity()
    {
        if (!$this->last_login_at) {
            return false;
        }

        return $this->last_login_at->isAfter(now()->subDays(30));
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope for users by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for recently active users
     */
    public function scopeRecentlyActive($query, $days = 30)
    {
        return $query->where('last_login_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for users created by a specific user
     */
    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }
}
