<?php

namespace App\Http\Controllers\Traits;

use App\Services\ActivityService;
use App\Models\StaffActivity;

trait LogsActivity
{
    protected function logActivity(string $action, string $description, $target = null, array $metadata = [])
    {
        $activityService = app(ActivityService::class);
        return $activityService->log($action, $description, $target, $metadata, request());
    }

    protected function logCategoryActivity(string $action, $category, array $metadata = [])
    {
        $activityService = app(ActivityService::class);
        return $activityService->logCategoryActivity($action, $category, $metadata);
    }

    protected function logUserActivity(string $action, $user, array $metadata = [])
    {
        $activityService = app(ActivityService::class);
        return $activityService->logUserActivity($action, $user, $metadata);
    }

    protected function logServiceActivity(string $action, $service, array $metadata = [])
    {
        $activityService = app(ActivityService::class);
        return $activityService->logServiceActivity($action, $service, $metadata);
    }
}
