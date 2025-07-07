<?php
// app/Http/Controllers/API/AuthController.php
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

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->first_name . ' ' . $user->last_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'address' => $user->address,
                        'contact_number' => $user->contact_number,
                        'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                        'age' => $user->date_of_birth ? $user->date_of_birth->age : null,
                        'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                        'is_active' => $user->is_active,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = Auth::user();

            // Check if user is active
            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated. Please contact support.'
                ], 403);
            }

            // Revoke all existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->first_name . ' ' . $user->last_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'address' => $user->address,
                        'contact_number' => $user->contact_number,
                        'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                        'age' => $user->date_of_birth ? $user->date_of_birth->age : null,
                        'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                        'is_active' => $user->is_active,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'address' => $user->address,
                    'contact_number' => $user->contact_number,
                    'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                    'age' => $user->date_of_birth ? $user->date_of_birth->age : null,
                    'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                ]
            ]
        ], 200);
    }
}
