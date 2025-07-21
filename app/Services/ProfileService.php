<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProfileService
{
    // protected ActivityService $activityService;

    // public function __construct(ActivityService $activityService)
    // {
    //     $this->activityService = $activityService;
    // }
    /**
     * Get complete profile data for user
     */
    public function getProfileData(User $user): array
    {
        $profileData = [
            'user' => $this->getUserData($user),
            'config' => $this->getProfileConfig($user->role),
            'permissions' => $this->getUserPermissions($user),
        ];

        // Add role-specific data
        switch ($user->role) {
            case 'service_provider':
                $profileData['provider_profile'] = $user->providerProfile?->toArray();
                $profileData['provider_statistics'] = $this->getProviderStatistics($user);
                break;
            case 'admin':
                $profileData['admin_permissions'] = $this->getAdminPermissions($user);
                break;
            case 'staff':
                $profileData['staff_permissions'] = $this->getStaffPermissions($user);
                break;
        }

        return $profileData;
    }

    /**
     * Update user profile
     */
    public function updateProfile(User $user, array $data): array
    {
        DB::beginTransaction();

        try {
            // Update user table
            $userFields = ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'];
            $userData = array_intersect_key($data, array_flip($userFields));

            if (!empty($userData)) {
                $user->update($userData);
            }

            // Update role-specific data
            if ($user->role === 'service_provider' && $user->providerProfile) {
                $providerFields = [
                    'business_name',
                    'bio',
                    'years_of_experience',
                    'service_area_radius',
                    'is_available'
                ];
                $providerData = array_intersect_key($data, array_flip($providerFields));

                if (!empty($providerData)) {
                    $user->providerProfile->update($providerData);
                }
            }

            // Log profile update
            // $this->activityService->logUserActivity(
            //     'update',
            //     $user,
            //     [
            //         'action' => 'profile_updated',
            //         'updated_fields' => array_keys($data),
            //         'user_role' => $user->role
            //     ]
            // );

            DB::commit();

            return $this->getProfileData($user);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get user data with computed fields
     */
    protected function getUserData(User $user): array
    {
        $userData = $user->toArray();

        // Add computed fields
        $userData['full_name'] = $user->first_name . ' ' . $user->last_name;
        $userData['age'] = $user->date_of_birth ?
            \Carbon\Carbon::parse($user->date_of_birth)->age : null;
        $userData['last_login_human'] = $user->last_login_at ?
            \Carbon\Carbon::parse($user->last_login_at)->diffForHumans() : null;

        // Stabilize profile picture URL to prevent frontend flickering
        if ($user->profile_picture) {
            // Use a consistent URL format without timestamps
            $userData['profile_picture'] = url('storage/' . $user->profile_picture);
        } else {
            $userData['profile_picture'] = null;
        }

        return $userData;
    }

    /**
     * Get profile configuration for role
     */
    public function getProfileConfig(string $role): array
    {
        $configs = [
            'admin' => [
                'sections' => ['personal', 'contact', 'security', 'permissions', 'system'],
                'permissions' => [
                    'canEdit' => ['first_name', 'last_name', 'contact_number', 'address'],
                    'canView' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'role', 'created_at'],
                    'readOnly' => ['email', 'role', 'created_at'],
                    'canDelete' => false,
                    'canChangeEmail' => false,
                    'canUploadImage' => true,
                ]
            ],
            'staff' => [
                'sections' => ['personal', 'contact', 'security', 'permissions'],
                'permissions' => [
                    'canEdit' => ['first_name', 'last_name', 'contact_number', 'address'],
                    'canView' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'role', 'created_at'],
                    'readOnly' => ['email', 'role', 'created_at'],
                    'canDelete' => false,
                    'canChangeEmail' => false,
                    'canUploadImage' => true,
                ]
            ],
            'service_provider' => [
                'sections' => ['personal', 'contact', 'business', 'documents', 'security', 'preferences'],
                'permissions' => [
                    'canEdit' => [
                        'first_name',
                        'last_name',
                        'email',
                        'contact_number',
                        'address',
                        'date_of_birth',
                        'business_name',
                        'bio',
                        'years_of_experience',
                        'service_area_radius',
                        'is_available'
                    ],
                    'canView' => [
                        'first_name',
                        'last_name',
                        'email',
                        'contact_number',
                        'address',
                        'date_of_birth',
                        'business_name',
                        'bio',
                        'years_of_experience',
                        'service_area_radius',
                        'verification_status',
                        'average_rating',
                        'total_reviews',
                        'is_available'
                    ],
                    'readOnly' => ['role', 'verification_status', 'average_rating', 'total_reviews'],
                    'canDelete' => true,
                    'canChangeEmail' => true,
                    'canUploadImage' => true,
                    'canToggleAvailability' => true,
                ]
            ],
            'client' => [
                'sections' => ['personal', 'contact', 'preferences', 'security', 'notifications'],
                'permissions' => [
                    'canEdit' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'],
                    'canView' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth', 'role'],
                    'readOnly' => ['role'],
                    'canDelete' => true,
                    'canChangeEmail' => true,
                    'canUploadImage' => true,
                ]
            ]
        ];

        return $configs[$role] ?? $configs['client'];
    }

    /**
     * Get user permissions
     */
    protected function getUserPermissions(User $user): array
    {
        // Implementation depends on your permission system
        // This is a basic example
        return [
            'can_edit_profile' => true,
            'can_delete_account' => in_array($user->role, ['client', 'service_provider']),
            'can_change_email' => in_array($user->role, ['client', 'service_provider']),
        ];
    }

    /**
     * Get provider statistics
     */
    protected function getProviderStatistics(User $user): array
    {
        if ($user->role !== 'service_provider' || !$user->providerProfile) {
            return [];
        }

        // These would be actual database queries in a real implementation
        return [
            'total_appointments' => $user->appointments()->count(),
            'completed_appointments' => $user->appointments()->where('status', 'completed')->count(),
            'pending_appointments' => $user->appointments()->where('status', 'pending')->count(),
            'today_appointments' => $user->appointments()->whereDate('scheduled_at', today())->count(),
            'monthly_earnings' => $user->payments()->whereMonth('created_at', now()->month)->sum('amount'),
            'total_earnings' => $user->payments()->sum('amount'),
            'average_rating' => $user->reviews()->avg('rating') ?? 0,
            'total_reviews' => $user->reviews()->count(),
        ];
    }

    /**
     * Validate field value
     */
    public function validateField(User $user, string $fieldName, $value): bool
    {
        $config = $this->getProfileConfig($user->role);

        if (!in_array($fieldName, $config['permissions']['canEdit'])) {
            return false;
        }

        // Add specific validation logic based on field type
        $rules = $this->getFieldValidationRules($fieldName, $user);

        if (empty($rules)) {
            return true;
        }

        $validator = Validator::make(
            [$fieldName => $value],
            [$fieldName => $rules]
        );

        return !$validator->fails();
    }

    /**
     * Get validation rules for specific field
     */
    protected function getFieldValidationRules(string $fieldName, User $user): array
    {
        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'bio' => ['required', 'string', 'min:50', 'max:1000'],
            'years_of_experience' => ['required', 'integer', 'min:0', 'max:50'],
            'service_area_radius' => ['required', 'integer', 'min:1', 'max:100'],
        ];

        return $rules[$fieldName] ?? [];
    }

    /**
     * Get admin permissions
     */
    protected function getAdminPermissions(User $user): array
    {
        return [
            'can_manage_users' => true,
            'can_manage_system' => true,
            'can_view_analytics' => true,
            'can_manage_staff' => true,
            'can_backup_system' => true,
        ];
    }

    /**
     * Get staff permissions
     */
    protected function getStaffPermissions(User $user): array
    {
        return [
            'can_manage_categories' => true,
            'can_moderate_content' => true,
            'can_support_users' => true,
            'can_view_reports' => true,
            'can_manage_services' => false,
        ];
    }
}
