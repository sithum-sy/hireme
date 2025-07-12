<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'search_term',
        'filters',
        'search_latitude',
        'search_longitude',
        'search_radius',
        'results_count',
        'user_session_id',
        'user_id',
        'client_ip'
    ];

    protected $casts = [
        'filters' => 'array',
        'search_latitude' => 'decimal:8',
        'search_longitude' => 'decimal:8',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Static helper methods
    public static function trackSearch($searchTerm, $filters = null, $latitude = null, $longitude = null, $radius = null, $resultsCount = 0, $userId = null)
    {
        return static::create([
            'search_term' => $searchTerm,
            'filters' => $filters,
            'search_latitude' => $latitude,
            'search_longitude' => $longitude,
            'search_radius' => $radius,
            'results_count' => $resultsCount,
            'user_session_id' => session()->getId(),
            'user_id' => $userId,
            'client_ip' => request()->ip(),
        ]);
    }

    public static function getPopularSearches($limit = 10, $days = 30)
    {
        return static::selectRaw('search_term, COUNT(*) as search_count')
            ->where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('search_term')
            ->groupBy('search_term')
            ->orderByDesc('search_count')
            ->limit($limit)
            ->get();
    }

    public static function getSearchTrends($days = 7)
    {
        return static::selectRaw('DATE(created_at) as date, COUNT(*) as searches')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }
}
