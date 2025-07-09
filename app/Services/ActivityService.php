<?php

namespace App\Services;

use App\Models\StaffActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityService
{
    /**
     * Log a staff activity
     */
    public function log(
        string $actionType,
        string $description,
        $target = null,
        array $metadata = [],
        Request $request = null
    ) {
        $staffId = Auth::id();

        if (!$staffId) {
            return null;
        }

        // Get IP and User Agent from request
        $ipAddress = $request ? $request->ip() : null;
        $userAgent = $request ? $request->userAgent() : null;

        $activityData = [
            'staff_id' => $staffId,
            'action_type' => $actionType,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ];

        // Handle target object
        if ($target) {
            $activityData['target_type'] = get_class($target);
            $activityData['target_id'] = $target->id;
        }

        return StaffActivity::create($activityData);
    }

    /**
     * Log service category activities
     */
    public function logCategoryActivity(string $action, $category, array $metadata = [])
    {
        $descriptions = [
            StaffActivity::ACTION_CREATE => "Created service category '{$category->name}'",
            StaffActivity::ACTION_UPDATE => "Updated service category '{$category->name}'",
            StaffActivity::ACTION_DELETE => "Deleted service category '{$category->name}'",
            StaffActivity::ACTION_ACTIVATE => "Activated service category '{$category->name}'",
            StaffActivity::ACTION_DEACTIVATE => "Deactivated service category '{$category->name}'",
        ];

        $description = $descriptions[$action] ?? "Performed {$action} on service category '{$category->name}'";

        return $this->log($action, $description, $category, $metadata, request());
    }

    /**
     * Log user management activities
     */
    public function logUserActivity(string $action, User $user, array $metadata = [])
    {
        $roleLabel = ucfirst(str_replace('_', ' ', $user->role));

        $descriptions = [
            StaffActivity::ACTION_CREATE => "Created {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_UPDATE => "Updated {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_DELETE => "Deleted {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_ACTIVATE => "Activated {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_DEACTIVATE => "Deactivated {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_APPROVE => "Approved {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_REJECT => "Rejected {$roleLabel} account for {$user->full_name}",
            StaffActivity::ACTION_VIEW => "Viewed {$roleLabel} profile for {$user->full_name}",
        ];

        $description = $descriptions[$action] ?? "Performed {$action} on {$roleLabel} {$user->full_name}";

        return $this->log($action, $description, $user, $metadata, request());
    }

    /**
     * Log service activities
     */
    public function logServiceActivity(string $action, $service, array $metadata = [])
    {
        $descriptions = [
            StaffActivity::ACTION_CREATE => "Created service '{$service->title}' by {$service->provider->full_name}",
            StaffActivity::ACTION_UPDATE => "Updated service '{$service->title}'",
            StaffActivity::ACTION_DELETE => "Deleted service '{$service->title}'",
            StaffActivity::ACTION_ACTIVATE => "Activated service '{$service->title}'",
            StaffActivity::ACTION_DEACTIVATE => "Deactivated service '{$service->title}'",
            StaffActivity::ACTION_APPROVE => "Approved service '{$service->title}'",
            StaffActivity::ACTION_REJECT => "Rejected service '{$service->title}'",
            StaffActivity::ACTION_VIEW => "Viewed service '{$service->title}'",
        ];

        $description = $descriptions[$action] ?? "Performed {$action} on service '{$service->title}'";

        return $this->log($action, $description, $service, $metadata, request());
    }

    /**
     * Log appointment activities
     */
    public function logAppointmentActivity(string $action, $appointment, array $metadata = [])
    {
        $descriptions = [
            StaffActivity::ACTION_CREATE => "Created appointment for {$appointment->client->full_name} with {$appointment->provider->full_name}",
            StaffActivity::ACTION_UPDATE => "Updated appointment #{$appointment->id}",
            StaffActivity::ACTION_DELETE => "Cancelled appointment #{$appointment->id}",
            StaffActivity::ACTION_APPROVE => "Approved appointment #{$appointment->id}",
            StaffActivity::ACTION_ASSIGN => "Assigned appointment #{$appointment->id}",
            StaffActivity::ACTION_RESOLVE => "Resolved appointment #{$appointment->id}",
            StaffActivity::ACTION_VIEW => "Viewed appointment #{$appointment->id}",
        ];

        $description = $descriptions[$action] ?? "Performed {$action} on appointment #{$appointment->id}";

        return $this->log($action, $description, $appointment, $metadata, request());
    }

    /**
     * Log dispute activities
     */
    public function logDisputeActivity(string $action, $dispute, array $metadata = [])
    {
        $descriptions = [
            StaffActivity::ACTION_CREATE => "Created dispute #{$dispute->id}",
            StaffActivity::ACTION_UPDATE => "Updated dispute #{$dispute->id}",
            StaffActivity::ACTION_ASSIGN => "Assigned dispute #{$dispute->id} to staff",
            StaffActivity::ACTION_RESOLVE => "Resolved dispute #{$dispute->id}",
            StaffActivity::ACTION_VIEW => "Viewed dispute #{$dispute->id}",
        ];

        $description = $descriptions[$action] ?? "Performed {$action} on dispute #{$dispute->id}";

        return $this->log($action, $description, $dispute, $metadata, request());
    }

    /**
     * Log authentication activities
     */
    public function logAuthActivity(string $action, User $staff, array $metadata = [])
    {
        $descriptions = [
            StaffActivity::ACTION_LOGIN => "Staff member {$staff->full_name} logged in",
            StaffActivity::ACTION_LOGOUT => "Staff member {$staff->full_name} logged out",
        ];

        $description = $descriptions[$action] ?? "Authentication action: {$action}";

        return $this->log($action, $description, $staff, $metadata, request());
    }

    /**
     * Get recent activities
     */
    public function getRecentActivities($limit = 20, $days = 30)
    {
        return StaffActivity::with('staff')
            ->recent($days)
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action_type' => $activity->action_type,
                    'description' => $activity->description,
                    'staff_name' => $activity->staff->full_name,
                    'target_type' => $activity->target_type,
                    'target_id' => $activity->target_id,
                    'metadata' => $activity->metadata,
                    'created_at' => $activity->created_at,
                    'formatted_time' => $activity->created_at->diffForHumans(),
                    'icon' => $this->getActionIcon($activity->action_type),
                    'color' => $this->getActionColor($activity->action_type),
                ];
            });
    }



    /**
     * Get staff activity summary
     */
    public function getStaffActivitySummary($staffId, $days = 30)
    {
        $activities = StaffActivity::where('staff_id', $staffId)
            ->recent($days)
            ->get();

        $summary = $activities->groupBy('action_type')
            ->map(function ($group) {
                return $group->count();
            });

        $dailyActivity = $activities->groupBy(function ($activity) {
            return $activity->created_at->format('Y-m-d');
        })->sortByDesc(function ($dayActivities) {
            return $dayActivities->count();
        });

        return [
            'total_activities' => $activities->count(),
            'by_action' => $summary,
            'most_active_day' => $dailyActivity->keys()->first(),
            'daily_average' => round($activities->count() / $days, 1),
            'recent_actions' => $activities->take(5)->map(function ($activity) {
                return [
                    'action' => $activity->action_type,
                    'description' => $activity->description,
                    'time' => $activity->created_at->diffForHumans(),
                ];
            }),
        ];
    }

    /**
     * Get activity statistics
     */
    public function getActivityStats($days = 30)
    {
        $activities = StaffActivity::recent($days)->get();

        return [
            'total_activities' => $activities->count(),
            'unique_staff' => $activities->unique('staff_id')->count(),
            'by_action_type' => $activities->groupBy('action_type')
                ->map(function ($group, $action) {
                    return [
                        'action' => $action,
                        'count' => $group->count(),
                        'percentage' => round(($group->count() / $activities->count()) * 100, 1),
                    ];
                })
                ->sortByDesc('count')
                ->values(),
            'by_staff' => $activities->groupBy('staff_id')
                ->map(function ($group, $staffId) {
                    $staff = User::find($staffId);
                    return [
                        'staff_name' => $staff ? $staff->full_name : 'Unknown',
                        'count' => $group->count(),
                    ];
                })
                ->sortByDesc('count')
                ->take(10)
                ->values(),
            'daily_activity' => $activities->groupBy(function ($activity) {
                return $activity->created_at->format('Y-m-d');
            })->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'count' => $group->count(),
                ];
            })->sortBy('date')->values(),
        ];
    }

    /**
     * Get action icon for UI
     */
    private function getActionIcon($actionType)
    {
        $icons = [
            StaffActivity::ACTION_CREATE => 'fas fa-plus',
            StaffActivity::ACTION_UPDATE => 'fas fa-edit',
            StaffActivity::ACTION_DELETE => 'fas fa-trash',
            StaffActivity::ACTION_VIEW => 'fas fa-eye',
            StaffActivity::ACTION_ACTIVATE => 'fas fa-check',
            StaffActivity::ACTION_DEACTIVATE => 'fas fa-times',
            StaffActivity::ACTION_APPROVE => 'fas fa-check-circle',
            StaffActivity::ACTION_REJECT => 'fas fa-times-circle',
            StaffActivity::ACTION_ASSIGN => 'fas fa-user-check',
            StaffActivity::ACTION_RESOLVE => 'fas fa-check-double',
            StaffActivity::ACTION_LOGIN => 'fas fa-sign-in-alt',
            StaffActivity::ACTION_LOGOUT => 'fas fa-sign-out-alt',
        ];

        return $icons[$actionType] ?? 'fas fa-cog';
    }

    /**
     * Get action color for UI
     */
    private function getActionColor($actionType)
    {
        $colors = [
            StaffActivity::ACTION_CREATE => 'success',
            StaffActivity::ACTION_UPDATE => 'warning',
            StaffActivity::ACTION_DELETE => 'danger',
            StaffActivity::ACTION_VIEW => 'info',
            StaffActivity::ACTION_ACTIVATE => 'success',
            StaffActivity::ACTION_DEACTIVATE => 'secondary',
            StaffActivity::ACTION_APPROVE => 'success',
            StaffActivity::ACTION_REJECT => 'danger',
            StaffActivity::ACTION_ASSIGN => 'info',
            StaffActivity::ACTION_RESOLVE => 'success',
            StaffActivity::ACTION_LOGIN => 'primary',
            StaffActivity::ACTION_LOGOUT => 'secondary',
        ];

        return $colors[$actionType] ?? 'primary';
    }
}
