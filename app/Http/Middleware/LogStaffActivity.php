<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\ActivityService;
use App\Models\StaffActivity;

class LogStaffActivity
{
    protected $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log for staff users
        if (auth()->check() && auth()->user()->role === 'staff') {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    private function logActivity(Request $request, $response)
    {
        $method = $request->method();
        $path = $request->path();
        $statusCode = $response->getStatusCode();

        // Only log successful requests
        if ($statusCode >= 200 && $statusCode < 300) {
            $action = $this->determineAction($method, $path);
            $description = $this->generateDescription($method, $path, $request);

            if ($action && $description) {
                $this->activityService->log(
                    $action,
                    $description,
                    null,
                    [
                        'method' => $method,
                        'path' => $path,
                        'status_code' => $statusCode,
                        'request_data' => $this->sanitizeRequestData($request),
                    ],
                    $request
                );
            }
        }
    }

    private function determineAction($method, $path)
    {
        switch ($method) {
            case 'GET':
                return StaffActivity::ACTION_VIEW;
            case 'POST':
                return StaffActivity::ACTION_CREATE;
            case 'PUT':
            case 'PATCH':
                return StaffActivity::ACTION_UPDATE;
            case 'DELETE':
                return StaffActivity::ACTION_DELETE;
            default:
                return null;
        }
    }

    private function generateDescription($method, $path, Request $request)
    {
        // Parse the path to generate meaningful descriptions
        $pathSegments = explode('/', $path);

        if (in_array('staff', $pathSegments)) {
            $resource = $pathSegments[array_search('staff', $pathSegments) + 1] ?? 'resource';

            switch ($method) {
                case 'GET':
                    return "Viewed {$resource} page";
                case 'POST':
                    return "Created new {$resource}";
                case 'PUT':
                case 'PATCH':
                    return "Updated {$resource}";
                case 'DELETE':
                    return "Deleted {$resource}";
            }
        }

        return "Performed {$method} request on {$path}";
    }

    private function sanitizeRequestData(Request $request)
    {
        $data = $request->all();

        // Remove sensitive data
        unset($data['password'], $data['password_confirmation'], $data['_token']);

        return $data;
    }
}
