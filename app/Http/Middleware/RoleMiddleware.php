<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // if (!$request->user()) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Authentication required'
        //     ], 401);
        // }

        // if (!in_array($request->user()->role, $roles)) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Insufficient permissions'
        //     ], 403);
        // }

        // return $next($request);
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $userRole = auth()->user()->role;
        $allowedRoles = [];

        foreach ($roles as $role) {
            $allowedRoles = array_merge($allowedRoles, explode(',', $role));
        }

        if (!in_array($userRole, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Insufficient permissions'
            ], 403);
        }

        return $next($request);
    }
}
