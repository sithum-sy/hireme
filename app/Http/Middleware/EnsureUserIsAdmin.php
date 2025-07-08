<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated (works with Sanctum)
        if (!auth('sanctum')->check()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }
            return redirect()->route('login');
        }

        $user = auth('sanctum')->user();

        // Check if user has admin role
        if (!$user->isAdmin()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            // Redirect based on user role for web routes
            if ($user->isStaff()) {
                return redirect('/staff/dashboard');
            } elseif ($user->isServiceProvider()) {
                return redirect('/provider/dashboard');
            } elseif ($user->isClient()) {
                return redirect('/client/dashboard');
            }

            return redirect('/login')->with('error', 'Access denied. Admin privileges required.');
        }

        // Check if admin account is active
        if (!$user->is_active) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated.'
                ], 403);
            }

            // For web routes, logout and redirect
            auth('sanctum')->logout();
            return redirect('/login')->with('error', 'Your account has been deactivated.');
        }

        return $next($request);
    }
}
