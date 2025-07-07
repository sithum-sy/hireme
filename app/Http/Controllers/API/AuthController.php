<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Add CORS headers to response
     */
    private function addCorsHeaders($response)
    {
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        return $response;
    }

    public function register(RegisterRequest $request)
    {
        try {
            $userData = $request->validated();

            // Hash password
            $userData['password'] = Hash::make($userData['password']);

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_pictures', $filename, 'public');
                $userData['profile_picture'] = $path;
            }

            // Create user
            $user = User::create($userData);

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            $response = response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'address' => $user->address,
                        'contact_number' => $user->contact_number,
                        'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                        'is_active' => $user->is_active,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 201);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            $response = response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);

            return $this->addCorsHeaders($response);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            if (!Auth::attempt($credentials)) {
                $response = response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);

                return $this->addCorsHeaders($response);
            }

            $user = Auth::user();

            // Check if user is active
            if (!$user->is_active) {
                $response = response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated. Please contact support.'
                ], 403);

                return $this->addCorsHeaders($response);
            }

            // Revoke all existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            $response = response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'address' => $user->address,
                        'contact_number' => $user->contact_number,
                        'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                        'is_active' => $user->is_active,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 200);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            $response = response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);

            return $this->addCorsHeaders($response);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            $response = response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            $response = response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);

            return $this->addCorsHeaders($response);
        }
    }

    public function user(Request $request)
    {
        $user = $request->user();

        $response = response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'address' => $user->address,
                    'contact_number' => $user->contact_number,
                    'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                ]
            ]
        ], 200);

        return $this->addCorsHeaders($response);
    }
}
