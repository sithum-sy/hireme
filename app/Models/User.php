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
    ];

    // Role constants
    const ROLE_CLIENT = 'client';
    const ROLE_SERVICE_PROVIDER = 'service_provider';
    const ROLE_ADMIN = 'admin';
    const ROLE_STAFF = 'staff';

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

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
}
