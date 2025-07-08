<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class EnsureUserIsStaff
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

        // Check if user has staff role
        if (!$user->isStaff()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Staff privileges required.'
                ], 403);
            }

            // Redirect based on user role for web routes
            if ($user->isAdmin()) {
                return redirect('/admin/dashboard');
            } elseif ($user->isServiceProvider()) {
                return redirect('/provider/dashboard');
            } elseif ($user->isClient()) {
                return redirect('/client/dashboard');
            }

            return redirect('/login')->with('error', 'Access denied. Staff privileges required.');
        }

        // Check if staff account is active
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
