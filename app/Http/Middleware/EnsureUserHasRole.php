<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureUserHasRole Middleware - Role-based access control
 * 
 * Restricts access to routes based on user roles. Checks if the authenticated 
 * user has the specific role required to access the protected resource.
 */
class EnsureUserHasRole
{
    /**
     * Handle role-based authorization check
     * Ensures only users with specific roles can access protected routes
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Required role: ' . $role
            ], 403);
        }

        return $next($request);
    }
}
