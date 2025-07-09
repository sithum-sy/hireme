<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'is_active',
        'sort_order',
        'created_by', // Track which staff member created this category
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function services()
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    public function activeServices()
    {
        return $this->hasMany(Service::class, 'category_id')->where('is_active', true);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accessors & Mutators
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeWithServicesCount($query)
    {
        return $query->withCount(['services', 'activeServices']);
    }

    // Helper Methods
    public function getIconClass()
    {
        return $this->icon ?: 'fas fa-cog';
    }

    public function getColorClass()
    {
        return 'text-' . ($this->color ?: 'primary');
    }

    public function getBadgeClass()
    {
        return 'badge-' . ($this->color ?: 'primary');
    }

    public function getServicesCountAttribute()
    {
        return $this->services()->count();
    }

    public function getActiveServicesCountAttribute()
    {
        return $this->activeServices()->count();
    }

    public function getInactiveServicesCountAttribute()
    {
        return $this->services_count - $this->active_services_count;
    }

    public function hasServices()
    {
        return $this->services()->exists();
    }

    public function canBeDeleted()
    {
        return !$this->hasServices();
    }

    // Static methods for common operations
    public static function getNextSortOrder()
    {
        return static::max('sort_order') + 1;
    }

    public static function getActiveCategories()
    {
        return static::active()->ordered()->get();
    }

    public static function getCategoriesWithStats()
    {
        return static::withServicesCount()->ordered()->get();
    }

    /**
     * Get formatted service count text
     */
    public function getFormattedServiceCountAttribute()
    {
        $count = $this->services_count;
        if ($count == 0) {
            return 'No services';
        } elseif ($count == 1) {
            return '1 service';
        } else {
            return $count . ' services';
        }
    }

    /**
     * Get status badge HTML
     */
    public function getStatusBadgeAttribute()
    {
        $class = $this->is_active ? 'badge-success' : 'badge-secondary';
        $text = $this->is_active ? 'Active' : 'Inactive';
        return "<span class='badge {$class}'>{$text}</span>";
    }

    /**
     * Get icon HTML with color
     */
    public function getIconHtmlAttribute()
    {
        $iconClass = $this->getIconClass();
        $colorClass = $this->getColorClass();
        return "<i class='{$iconClass} {$colorClass}'></i>";
    }

    /**
     * Check if category is popular (has many services)
     */
    public function isPopular($threshold = 5)
    {
        return $this->services_count >= $threshold;
    }

    /**
     * Get category statistics for dashboard
     */
    public function getDashboardStats()
    {
        return [
            'total_services' => $this->services()->count(),
            'active_services' => $this->activeServices()->count(),
            'inactive_services' => $this->services()->where('is_active', false)->count(),
            'recent_services' => $this->services()->where('created_at', '>=', now()->subDays(30))->count(),
            'top_provider' => $this->getTopProvider(),
            'average_rating' => $this->getAverageRating(),
        ];
    }

    /**
     * Get top provider for this category
     */
    public function getTopProvider()
    {
        return $this->services()
            ->selectRaw('provider_id, COUNT(*) as service_count')
            ->groupBy('provider_id')
            ->orderByDesc('service_count')
            ->with('provider:id,first_name,last_name')
            ->first();
    }

    /**
     * Get average rating for services in this category
     */
    public function getAverageRating()
    {
        return $this->services()
            ->join('provider_profiles', 'services.provider_id', '=', 'provider_profiles.user_id')
            ->avg('provider_profiles.average_rating') ?? 0;
    }

    /**
     * Scope for categories with recent activity
     */
    public function scopeWithRecentActivity($query, $days = 30)
    {
        return $query->whereHas('services', function ($q) use ($days) {
            $q->where('created_at', '>=', now()->subDays($days));
        });
    }

    /**
     * Scope for popular categories
     */
    public function scopePopular($query, $threshold = 5)
    {
        return $query->withCount('services')
            ->having('services_count', '>=', $threshold);
    }

    /**
     * Get category usage trend (last 6 months)
     */
    public function getUsageTrend()
    {
        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $count = $this->services()
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $trend[] = [
                'month' => $month->format('M'),
                'count' => $count
            ];
        }
        return $trend;
    }
}
