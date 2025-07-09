<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    /**
     * Get all staff members
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $status = $request->get('status'); // 'active', 'inactive', or null for all

            $query = User::where('role', User::ROLE_STAFF);

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($status !== null) {
                $isActive = $status === 'active';
                $query->where('is_active', $isActive);
            }

            $staff = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Transform the data
            $staff->getCollection()->transform(function ($staffMember) {
                return [
                    'id' => $staffMember->id,
                    'first_name' => $staffMember->first_name,
                    'last_name' => $staffMember->last_name,
                    'full_name' => $staffMember->full_name,
                    'email' => $staffMember->email,
                    'date_of_birth' => $staffMember->date_of_birth?->format('Y-m-d'), // FIXED: Added null check with ?->
                    'contact_number' => $staffMember->contact_number,
                    'address' => $staffMember->address,
                    'profile_picture' => $staffMember->profile_picture ? Storage::url($staffMember->profile_picture) : null,
                    'is_active' => $staffMember->is_active,
                    'last_login_at' => $staffMember->last_login_at?->format('Y-m-d H:i:s'),
                    'last_login_human' => $staffMember->last_login_human,
                    'has_recent_activity' => $staffMember->hasRecentActivity(),
                    'created_by' => $staffMember->created_by,
                    'creator_name' => $staffMember->creator?->full_name,
                    'created_at' => $staffMember->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $staffMember->updated_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $staff,
                'meta' => [
                    'total_staff' => User::where('role', User::ROLE_STAFF)->count(),
                    'active_staff' => User::where('role', User::ROLE_STAFF)->where('is_active', true)->count(),
                    'inactive_staff' => User::where('role', User::ROLE_STAFF)->where('is_active', false)->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch staff members',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Create a new staff member
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'date_of_birth' => 'nullable|date|before:today',
                'password' => 'required|string|min:8|confirmed',
                'contact_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $staffData = $request->only([
                'first_name',
                'last_name',
                'email',
                'contact_number',
                'address',
                'date_of_birth'
            ]);

            // Remove empty values to avoid storing empty strings
            $staffData = array_filter($staffData, function ($value) {
                return $value !== null && $value !== '';
            });

            // Hash password
            $staffData['password'] = Hash::make($request->password);
            $staffData['role'] = User::ROLE_STAFF;
            $staffData['is_active'] = true;
            $staffData['email_verified_at'] = now(); // Auto-verify staff emails
            $staffData['created_by'] = auth()->id(); // Track who created this staff member

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');
                $filename = 'staff_' . Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_pictures', $filename, 'public');
                $staffData['profile_picture'] = $path;
            }

            $staff = User::create($staffData);

            return response()->json([
                'success' => true,
                'message' => 'Staff member created successfully',
                'data' => [
                    'staff' => [
                        'id' => $staff->id,
                        'first_name' => $staff->first_name,
                        'last_name' => $staff->last_name,
                        'full_name' => $staff->full_name,
                        'email' => $staff->email,
                        'date_of_birth' => $staff->date_of_birth?->format('Y-m-d'),
                        'contact_number' => $staff->contact_number,
                        'address' => $staff->address,
                        'profile_picture' => $staff->profile_picture ? Storage::url($staff->profile_picture) : null,
                        'is_active' => $staff->is_active,
                        'created_by' => $staff->created_by,
                        'creator_name' => $staff->creator?->full_name,
                        'created_at' => $staff->created_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create staff member',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get a specific staff member
     */
    public function show(User $staff)
    {
        try {
            // Ensure the user is actually staff
            if ($staff->role !== User::ROLE_STAFF) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a staff member'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'staff' => [
                        'id' => $staff->id,
                        'first_name' => $staff->first_name,
                        'last_name' => $staff->last_name,
                        'full_name' => $staff->full_name,
                        'email' => $staff->email,
                        'contact_number' => $staff->contact_number,
                        'address' => $staff->address,
                        'date_of_birth' => $staff->date_of_birth?->format('Y-m-d'),
                        'profile_picture' => $staff->profile_picture ? Storage::url($staff->profile_picture) : null,
                        'is_active' => $staff->is_active,
                        'last_login_at' => $staff->last_login_at?->format('Y-m-d H:i:s'),
                        'last_login_human' => $staff->last_login_human,
                        'has_recent_activity' => $staff->hasRecentActivity(),
                        'created_by' => $staff->created_by,
                        'creator_name' => $staff->creator?->full_name,
                        'email_verified_at' => $staff->email_verified_at?->format('Y-m-d H:i:s'),
                        'created_at' => $staff->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $staff->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch staff member',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update a staff member
     */
    public function update(Request $request, User $staff)
    {
        try {
            // Ensure the user is actually staff
            if ($staff->role !== User::ROLE_STAFF) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a staff member'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'first_name' => 'sometimes|required|string|max:255',
                'last_name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $staff->id,
                'password' => 'nullable|string|min:8|confirmed',
                'contact_number' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date|before:today',
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only([
                'first_name',
                'last_name',
                'email',
                'contact_number',
                'address',
                'date_of_birth'
            ]);

            // Remove empty values to avoid storing empty strings (but keep null for date_of_birth to clear it)
            $updateData = array_filter($updateData, function ($value, $key) {
                if ($key === 'date_of_birth') {
                    return true; // Always include date_of_birth, even if empty (to allow clearing)
                }
                return $value !== null && $value !== '';
            }, ARRAY_FILTER_USE_BOTH);

            // Convert empty date_of_birth to null
            if (isset($updateData['date_of_birth']) && $updateData['date_of_birth'] === '') {
                $updateData['date_of_birth'] = null;
            }

            // Update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($staff->profile_picture) {
                    Storage::disk('public')->delete($staff->profile_picture);
                }

                $file = $request->file('profile_picture');
                $filename = 'staff_' . Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_pictures', $filename, 'public');
                $updateData['profile_picture'] = $path;
            }

            $staff->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Staff member updated successfully',
                'data' => [
                    'staff' => [
                        'id' => $staff->id,
                        'first_name' => $staff->first_name,
                        'last_name' => $staff->last_name,
                        'full_name' => $staff->full_name,
                        'email' => $staff->email,
                        'contact_number' => $staff->contact_number,
                        'address' => $staff->address,
                        'date_of_birth' => $staff->date_of_birth?->format('Y-m-d'),
                        'profile_picture' => $staff->profile_picture ? Storage::url($staff->profile_picture) : null,
                        'is_active' => $staff->is_active,
                        'updated_at' => $staff->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update staff member',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete a staff member
     */
    public function destroy(User $staff)
    {
        try {
            // Ensure the user is actually staff
            if ($staff->role !== User::ROLE_STAFF) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a staff member'
                ], 404);
            }

            // Prevent admin from deleting themselves if they're staff (edge case)
            if ($staff->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account'
                ], 403);
            }

            // Delete profile picture if exists
            if ($staff->profile_picture) {
                Storage::disk('public')->delete($staff->profile_picture);
            }

            $staffName = $staff->full_name;
            $staff->delete();

            return response()->json([
                'success' => true,
                'message' => "Staff member '{$staffName}' has been deleted successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete staff member',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Toggle staff member status (active/inactive)
     */
    public function toggleStatus(User $staff)
    {
        try {
            // Ensure the user is actually staff
            if ($staff->role !== User::ROLE_STAFF) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a staff member'
                ], 404);
            }

            // Prevent admin from deactivating themselves if they're staff (edge case)
            if ($staff->id === auth()->id() && $staff->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot deactivate your own account'
                ], 403);
            }

            $staff->is_active = !$staff->is_active;
            $staff->save();

            $status = $staff->is_active ? 'activated' : 'deactivated';

            return response()->json([
                'success' => true,
                'message' => "Staff member has been {$status} successfully",
                'data' => [
                    'staff' => [
                        'id' => $staff->id,
                        'full_name' => $staff->full_name,
                        'email' => $staff->email,
                        'is_active' => $staff->is_active,
                        'updated_at' => $staff->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle staff status',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }
}
