<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * User Model - Core user entity for the HireMe service marketplace
 * 
 * Handles multi-role user system (Client, Provider, Admin, Staff) with authentication,
 * profile management, and relationships with appointments, payments, and reviews.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

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

    // System role constants for user type identification
    const ROLE_CLIENT = 'client';
    const ROLE_SERVICE_PROVIDER = 'service_provider';
    const ROLE_ADMIN = 'admin';
    const ROLE_STAFF = 'staff';

    // Accessor for full name with fallback handling
    public function getFullNameAttribute()
    {
        // Handle cases where first_name and last_name might not exist
        if (isset($this->attributes['first_name']) && isset($this->attributes['last_name'])) {
            return trim($this->first_name . ' ' . $this->last_name);
        }

        // Fallback to name field for legacy data
        return $this->name ?? 'Unknown User';
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    /**
     * Complex profile image URL accessor with multiple storage location support
     * Handles legacy storage paths and ensures proper URL generation
     */
    public function getProfileImageUrlAttribute()
    {
        if (!$this->profile_picture) {
            return null;
        }

        // If it's already a full URL, return as is
        if (str_starts_with($this->profile_picture, 'http')) {
            return $this->profile_picture;
        }

        // If it already starts with /images/, return as is
        if (str_starts_with($this->profile_picture, '/images/')) {
            return $this->profile_picture;
        }

        // If it starts with images/, add leading slash
        if (str_starts_with($this->profile_picture, 'images/')) {
            return '/' . $this->profile_picture;
        }

        // Check if file exists in the profile_pictures directory
        $profilePicturePath = 'images/profile_pictures/' . basename($this->profile_picture);
        if (file_exists(public_path($profilePicturePath))) {
            return asset($profilePicturePath);
        }

        // Legacy support - check old storage location for backward compatibility
        if (file_exists(public_path('storage/' . $this->profile_picture))) {
            return asset('storage/' . $this->profile_picture);
        }

        // Default to profile_pictures directory
        return asset('images/profile_pictures/' . basename($this->profile_picture));
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
     * Dynamic appointment relationship based on user role
     * Returns appropriate appointments (provider or client) depending on user's role
     */
    public function appointments()
    {
        // For service providers, return provider appointments
        if ($this->role === 'service_provider') {
            return $this->providerAppointments();
        }

        // For clients, return client appointments  
        if ($this->role === 'client') {
            return $this->clientAppointments();
        }

        // For other roles (admin/staff), return empty relationship
        return $this->hasMany(Appointment::class, 'provider_id')->whereRaw('1 = 0');
    }

    /**
     * Get payments as provider
     */
    public function providerPayments()
    {
        return $this->hasMany(Payment::class, 'provider_id');
    }

    /**
     * Get payments as client  
     */
    public function clientPayments()
    {
        return $this->hasMany(Payment::class, 'client_id');
    }

    /**
     * Dynamic payment relationship based on user role
     * Returns appropriate payments (received or made) depending on user's role
     */
    public function payments()
    {
        // For service providers, return provider payments
        if ($this->role === 'service_provider') {
            return $this->providerPayments();
        }

        // For clients, return client payments
        if ($this->role === 'client') {
            return $this->clientPayments();
        }

        // For other roles (admin/staff), return empty relationship
        return $this->hasMany(Payment::class, 'provider_id')->whereRaw('1 = 0');
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

    public function provider_profile()
    {
        return $this->hasOne(ProviderProfile::class, 'user_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    // public function payments()
    // {
    //     return $this->hasMany(Payment::class, 'provider_id');
    // }

    public function providerReviews()
    {
        return $this->reviewsReceived()
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            ->visible();
    }

    public function clientReviews()
    {
        return $this->reviewsReceived()
            ->where('review_type', Review::TYPE_PROVIDER_TO_CLIENT)
            ->visible();
    }

    /**
     * Dynamic review relationship based on user role
     * Providers get reviews they received, clients get reviews they gave
     */
    public function reviews()
    {
        // For service providers, return received reviews
        if ($this->role === 'service_provider') {
            return $this->providerReviews();
        }

        // For clients, return given reviews
        if ($this->role === 'client') {
            return $this->reviewsGiven();
        }

        // For other roles, return empty relationship
        return $this->hasMany(Review::class, 'reviewee_id')->whereRaw('1 = 0');
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

    // Notification relationships
    public function inAppNotifications()
    {
        return $this->hasMany(InAppNotification::class);
    }

    public function notificationPreference()
    {
        return $this->hasOne(NotificationPreference::class);
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
     * Get human-readable last login time with error handling
     * Returns relative time format (e.g., "2 hours ago", "Never logged in")
     */
    public function getLastLoginHumanAttribute()
    {
        if (!$this->last_login_at) {
            return 'Never logged in';
        }

        try {
            // Ensure we have a valid Carbon instance for date formatting
            $lastLogin = $this->last_login_at instanceof \Carbon\Carbon
                ? $this->last_login_at
                : \Carbon\Carbon::parse($this->last_login_at);

            return $lastLogin->diffForHumans();
        } catch (\Exception $e) {
            Log::warning('Error formatting last login time: ' . $e->getMessage());
            return 'Never logged in';
        }
    }

    /**
     * Check if user has logged in recently (within last 30 days)
     */
    public function hasRecentActivity($days = 30)
    {
        if (!$this->last_login_at) {
            return false;
        }

        try {
            return $this->last_login_at->isAfter(now()->subDays($days));
        } catch (\Exception $e) {
            return false;
        }
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

    // Calculate average ratings
    public function getAverageProviderRatingAttribute()
    {
        return $this->providerReviews()->avg('rating') ?: 0;
    }

    public function getTotalProviderReviewsAttribute()
    {
        return $this->providerReviews()->count();
    }

    /**
     * Update provider profile with calculated rating statistics
     * Only applies to service provider users with existing provider profiles
     */
    public function updateProviderRating()
    {
        if ($this->role === 'service_provider' && $this->providerProfile) {
            $this->providerProfile->update([
                'average_rating' => round($this->average_provider_rating, 1),
                'total_reviews' => $this->total_provider_reviews
            ]);
        }
    }

    /**
     * Email verification helper methods
     */
    
    /**
     * Determine if the user has verified their email address.
     */
    public function hasVerifiedEmail()
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Mark the given user's email as verified.
     */
    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    /**
     * Generate a unique email verification token.
     */
    public function generateEmailVerificationToken()
    {
        return hash('sha256', Str::random(60) . $this->email . time());
    }
}
