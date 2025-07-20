<?php

namespace App\Http\Requests\Traits;

trait RoleBasedValidation
{
    /**
     * Get role-specific field rules
     */
    protected function getRoleBasedRules(): array
    {
        $user = auth()->user();
        if (!$user) return [];

        $roleConfigs = [
            'admin' => [
                'allowed_fields' => ['first_name', 'last_name', 'contact_number'],
                'restricted_fields' => ['email', 'role', 'date_of_birth', 'address']
            ],
            'staff' => [
                'allowed_fields' => ['first_name', 'last_name', 'contact_number', 'address'],
                'restricted_fields' => ['email', 'role', 'date_of_birth']
            ],
            'service_provider' => [
                'allowed_fields' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'],
                'restricted_fields' => ['role']
            ],
            'client' => [
                'allowed_fields' => ['first_name', 'last_name', 'email', 'contact_number', 'address', 'date_of_birth'],
                'restricted_fields' => ['role']
            ]
        ];

        return $roleConfigs[$user->role] ?? [];
    }

    /**
     * Filter rules based on user role
     */
    protected function filterRulesByRole(array $rules): array
    {
        $roleConfig = $this->getRoleBasedRules();

        if (empty($roleConfig)) {
            return $rules;
        }

        $filteredRules = [];
        $allowedFields = $roleConfig['allowed_fields'] ?? [];

        foreach ($rules as $field => $rule) {
            if (in_array($field, $allowedFields)) {
                $filteredRules[$field] = $rule;
            }
        }

        return $filteredRules;
    }

    /**
     * Check if field is editable by current role
     */
    protected function isFieldEditable(string $field): bool
    {
        $roleConfig = $this->getRoleBasedRules();
        $allowedFields = $roleConfig['allowed_fields'] ?? [];

        return in_array($field, $allowedFields);
    }
}
