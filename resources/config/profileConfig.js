export const PROFILE_SECTIONS = {
    PERSONAL: "personal",
    CONTACT: "contact",
    BUSINESS: "business",
    DOCUMENTS: "documents",
    PREFERENCES: "preferences",
    SECURITY: "security",
    PERMISSIONS: "permissions", // New
    SYSTEM: "system", // New
    NOTIFICATIONS: "notifications", // New
};

export const FIELD_TYPES = {
    TEXT: "text",
    EMAIL: "email",
    PHONE: "tel",
    DATE: "date",
    TEXTAREA: "textarea",
    SELECT: "select",
    FILE: "file",
    IMAGE: "image",
    BOOLEAN: "boolean",
    NUMBER: "number",
    PASSWORD: "password", // New
    URL: "url", // New
};

export const VALIDATION_RULES = {
    REQUIRED: "required",
    EMAIL: "email",
    MIN_LENGTH: "minLength",
    MAX_LENGTH: "maxLength",
    PATTERN: "pattern",
    FILE_SIZE: "fileSize",
    FILE_TYPE: "fileType",
    MIN: "min", // New
    MAX: "max", // New
    CONFIRM: "confirm", // New
};

/**
 * Role-based profile configuration
 * Defines what fields each role can see/edit and how they're organized
 */
export const profileConfigs = {
    admin: {
        sections: [
            PROFILE_SECTIONS.PERSONAL,
            PROFILE_SECTIONS.CONTACT,
            PROFILE_SECTIONS.SECURITY,
            PROFILE_SECTIONS.PERMISSIONS,
            PROFILE_SECTIONS.SYSTEM,
        ],
        permissions: {
            canEdit: ["first_name", "last_name", "contact_number", "address"],
            canView: [
                "first_name",
                "last_name",
                "email",
                "contact_number",
                "address",
                "role",
                "created_at",
                "last_login_at",
            ],
            readOnly: ["email", "role", "created_at", "last_login_at"],
            canDelete: false,
            canChangeEmail: false,
            canUploadImage: true,
            canDeactivate: false,
            canManageSystem: true,
            canViewPermissions: true,
        },
        fields: {
            first_name: {
                type: FIELD_TYPES.TEXT,
                label: "First Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            last_name: {
                type: FIELD_TYPES.TEXT,
                label: "Last Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            email: {
                type: FIELD_TYPES.EMAIL,
                label: "Email Address",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                readOnly: true,
                helpText: "Contact system administrator to change email",
            },
            contact_number: {
                type: FIELD_TYPES.PHONE,
                label: "Phone Number",
                required: false,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 20,
                },
            },
            address: {
                type: FIELD_TYPES.TEXTAREA,
                label: "Address",
                required: false,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 1000,
                },
                rows: 3,
            },
            role: {
                type: FIELD_TYPES.TEXT,
                label: "Role",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                readOnly: true,
            },
        },
    },

    staff: {
        sections: [
            PROFILE_SECTIONS.PERSONAL,
            PROFILE_SECTIONS.CONTACT,
            PROFILE_SECTIONS.SECURITY,
            PROFILE_SECTIONS.PERMISSIONS,
        ],
        permissions: {
            canEdit: ["first_name", "last_name", "contact_number", "address"],
            canView: [
                "first_name",
                "last_name",
                "email",
                "contact_number",
                "address",
                "role",
                "created_by",
                "created_at",
                "last_login_at",
            ],
            readOnly: [
                "email",
                "role",
                "created_by",
                "created_at",
                "last_login_at",
            ],
            canDelete: false,
            canChangeEmail: false,
            canUploadImage: true,
            canDeactivate: false,
            canViewPermissions: true,
        },
        fields: {
            first_name: {
                type: FIELD_TYPES.TEXT,
                label: "First Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            last_name: {
                type: FIELD_TYPES.TEXT,
                label: "Last Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            email: {
                type: FIELD_TYPES.EMAIL,
                label: "Email Address",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                readOnly: true,
                helpText: "Contact administrator to change email",
            },
            contact_number: {
                type: FIELD_TYPES.PHONE,
                label: "Phone Number",
                required: false,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 20,
                },
            },
            address: {
                type: FIELD_TYPES.TEXTAREA,
                label: "Address",
                required: false,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 1000,
                },
                rows: 3,
            },
            role: {
                type: FIELD_TYPES.TEXT,
                label: "Role",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                readOnly: true,
            },
            created_by: {
                type: FIELD_TYPES.TEXT,
                label: "Created By",
                required: false,
                section: PROFILE_SECTIONS.PERSONAL,
                readOnly: true,
            },
        },
    },

    service_provider: {
        sections: [
            PROFILE_SECTIONS.PERSONAL,
            PROFILE_SECTIONS.CONTACT,
            PROFILE_SECTIONS.BUSINESS,
            PROFILE_SECTIONS.DOCUMENTS,
            PROFILE_SECTIONS.SECURITY,
            PROFILE_SECTIONS.PREFERENCES,
        ],
        permissions: {
            canEdit: [
                "first_name",
                "last_name",
                "email",
                "contact_number",
                "address",
                "date_of_birth",
                "business_name",
                "bio",
                "years_of_experience",
                "service_area_radius",
                "business_license",
                "certifications",
                "portfolio_images",
                "is_available",
            ],
            canView: [
                "first_name",
                "last_name",
                "email",
                "contact_number",
                "address",
                "date_of_birth",
                "business_name",
                "bio",
                "years_of_experience",
                "service_area_radius",
                "verification_status",
                "average_rating",
                "total_reviews",
                "is_available",
                "created_at",
                "last_login_at",
            ],
            readOnly: [
                "role",
                "verification_status",
                "average_rating",
                "total_reviews",
                "created_at",
                "last_login_at",
            ],
            canDelete: true,
            canChangeEmail: true,
            canUploadImage: true,
            canDeactivate: true,
            canToggleAvailability: true,
        },
        fields: {
            // Personal Information
            first_name: {
                type: FIELD_TYPES.TEXT,
                label: "First Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            last_name: {
                type: FIELD_TYPES.TEXT,
                label: "Last Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            email: {
                type: FIELD_TYPES.EMAIL,
                label: "Email Address",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.EMAIL]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            date_of_birth: {
                type: FIELD_TYPES.DATE,
                label: "Date of Birth",
                required: false,
                section: PROFILE_SECTIONS.PERSONAL,
                maxDate: new Date().toISOString().split("T")[0], // Today's date
            },

            // Contact Information
            contact_number: {
                type: FIELD_TYPES.PHONE,
                label: "Phone Number",
                required: true,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 20,
                },
                helpText: "Primary contact number for customer communications",
            },
            address: {
                type: FIELD_TYPES.TEXTAREA,
                label: "Service Address",
                required: true,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 1000,
                },
                rows: 3,
                helpText: "Your business address or primary service location",
            },

            // Business Information
            business_name: {
                type: FIELD_TYPES.TEXT,
                label: "Business Name",
                required: false,
                section: PROFILE_SECTIONS.BUSINESS,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
                helpText: "Leave blank to use your personal name",
            },
            bio: {
                type: FIELD_TYPES.TEXTAREA,
                label: "Professional Bio",
                required: true,
                section: PROFILE_SECTIONS.BUSINESS,
                helpText:
                    "Describe your services and experience (minimum 50 characters)",
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MIN_LENGTH]: 50,
                    [VALIDATION_RULES.MAX_LENGTH]: 1000,
                },
                rows: 4,
                fullWidth: true,
            },
            years_of_experience: {
                type: FIELD_TYPES.NUMBER,
                label: "Years of Experience",
                required: true,
                section: PROFILE_SECTIONS.BUSINESS,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MIN]: 0,
                    [VALIDATION_RULES.MAX]: 50,
                },
                step: 1,
            },
            service_area_radius: {
                type: FIELD_TYPES.NUMBER,
                label: "Service Area Radius (km)",
                required: true,
                section: PROFILE_SECTIONS.BUSINESS,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MIN]: 1,
                    [VALIDATION_RULES.MAX]: 100,
                },
                step: 1,
                helpText: "How far are you willing to travel for services?",
            },
            is_available: {
                type: FIELD_TYPES.BOOLEAN,
                label: "Available for New Bookings",
                required: false,
                section: PROFILE_SECTIONS.BUSINESS,
                checkboxLabel: "I am currently accepting new service requests",
            },

            // Documents
            business_license: {
                type: FIELD_TYPES.FILE,
                label: "Business License",
                required: false,
                section: PROFILE_SECTIONS.DOCUMENTS,
                accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                validation: {
                    [VALIDATION_RULES.FILE_SIZE]: 5120, // 5MB in KB
                    [VALIDATION_RULES.FILE_TYPE]: [
                        "pdf",
                        "doc",
                        "docx",
                        "jpg",
                        "jpeg",
                        "png",
                    ],
                },
                helpText:
                    "Upload your business registration or license document",
            },
            certifications: {
                type: FIELD_TYPES.FILE,
                label: "Professional Certifications",
                required: false,
                section: PROFILE_SECTIONS.DOCUMENTS,
                multiple: true,
                maxFiles: 5,
                accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                validation: {
                    [VALIDATION_RULES.FILE_SIZE]: 5120,
                    [VALIDATION_RULES.FILE_TYPE]: [
                        "pdf",
                        "doc",
                        "docx",
                        "jpg",
                        "jpeg",
                        "png",
                    ],
                },
                helpText:
                    "Upload relevant professional certifications (max 5 files)",
            },
            portfolio_images: {
                type: FIELD_TYPES.IMAGE,
                label: "Portfolio Images",
                required: false,
                section: PROFILE_SECTIONS.DOCUMENTS,
                multiple: true,
                maxFiles: 10,
                accept: ".jpg,.jpeg,.png,.gif",
                validation: {
                    [VALIDATION_RULES.FILE_SIZE]: 2048, // 2MB in KB
                    [VALIDATION_RULES.FILE_TYPE]: ["jpg", "jpeg", "png", "gif"],
                },
                helpText:
                    "Showcase your work with before/after photos (max 10 images)",
            },
        },
    },

    client: {
        sections: [
            PROFILE_SECTIONS.PERSONAL,
            PROFILE_SECTIONS.CONTACT,
            PROFILE_SECTIONS.PREFERENCES,
            PROFILE_SECTIONS.SECURITY,
            PROFILE_SECTIONS.NOTIFICATIONS,
        ],
        permissions: {
            canEdit: [
                "first_name",
                "last_name",
                "email",
                "contact_number",
                "address",
                "date_of_birth",
            ],
            canView: [
                "first_name",
                "last_name",
                "email",
                "contact_number",
                "address",
                "date_of_birth",
                "role",
                "created_at",
                "last_login_at",
            ],
            readOnly: ["role", "created_at", "last_login_at"],
            canDelete: true,
            canChangeEmail: true,
            canUploadImage: true,
            canDeactivate: true,
        },
        fields: {
            first_name: {
                type: FIELD_TYPES.TEXT,
                label: "First Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            last_name: {
                type: FIELD_TYPES.TEXT,
                label: "Last Name",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            email: {
                type: FIELD_TYPES.EMAIL,
                label: "Email Address",
                required: true,
                section: PROFILE_SECTIONS.PERSONAL,
                validation: {
                    [VALIDATION_RULES.REQUIRED]: true,
                    [VALIDATION_RULES.EMAIL]: true,
                    [VALIDATION_RULES.MAX_LENGTH]: 255,
                },
            },
            date_of_birth: {
                type: FIELD_TYPES.DATE,
                label: "Date of Birth",
                required: false,
                section: PROFILE_SECTIONS.PERSONAL,
                maxDate: new Date().toISOString().split("T")[0],
            },
            contact_number: {
                type: FIELD_TYPES.PHONE,
                label: "Phone Number",
                required: false,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 20,
                },
            },
            address: {
                type: FIELD_TYPES.TEXTAREA,
                label: "Address",
                required: false,
                section: PROFILE_SECTIONS.CONTACT,
                validation: {
                    [VALIDATION_RULES.MAX_LENGTH]: 1000,
                },
                rows: 3,
            },
        },
    },
};

/**
 * Section configuration for tabs and display
 */
export const sectionConfig = {
    [PROFILE_SECTIONS.PERSONAL]: {
        label: "Personal Info",
        icon: "fas fa-user",
        description: "Basic personal information and account details",
        roles: ["admin", "staff", "service_provider", "client"],
    },
    [PROFILE_SECTIONS.CONTACT]: {
        label: "Contact",
        icon: "fas fa-phone",
        description: "Contact information and address details",
        roles: ["admin", "staff", "service_provider", "client"],
    },
    [PROFILE_SECTIONS.BUSINESS]: {
        label: "Business",
        icon: "fas fa-building",
        description: "Business information and professional details",
        roles: ["service_provider"],
    },
    [PROFILE_SECTIONS.DOCUMENTS]: {
        label: "Documents",
        icon: "fas fa-file-alt",
        description: "Business license, certifications, and portfolio",
        roles: ["service_provider"],
    },
    [PROFILE_SECTIONS.PREFERENCES]: {
        label: "Preferences",
        icon: "fas fa-cog",
        description: "Account preferences and settings",
        roles: ["service_provider", "client"],
    },
    [PROFILE_SECTIONS.SECURITY]: {
        label: "Security",
        icon: "fas fa-shield-alt",
        description: "Password and security settings",
        roles: ["admin", "staff", "service_provider", "client"],
    },
    [PROFILE_SECTIONS.PERMISSIONS]: {
        label: "Permissions",
        icon: "fas fa-user-shield",
        description: "View your system permissions and access levels",
        roles: ["admin", "staff"],
    },
    [PROFILE_SECTIONS.SYSTEM]: {
        label: "System Settings",
        icon: "fas fa-server",
        description: "Manage platform-wide system configuration",
        roles: ["admin"],
    },
    [PROFILE_SECTIONS.NOTIFICATIONS]: {
        label: "Notifications",
        icon: "fas fa-bell",
        description: "Manage notification preferences",
        roles: ["client"],
    },
};

/**
 * File upload configuration
 */
export const fileUploadConfig = {
    profileImage: {
        maxSize: 2048, // 2MB in KB
        allowedTypes: ["jpg", "jpeg", "png", "gif"],
        dimensions: {
            min: { width: 100, height: 100 },
            max: { width: 2000, height: 2000 },
        },
    },
    documents: {
        maxSize: 5120, // 5MB in KB
        allowedTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    },
    portfolio: {
        maxSize: 2048, // 2MB in KB
        allowedTypes: ["jpg", "jpeg", "png", "gif"],
        dimensions: {
            min: { width: 300, height: 300 },
            max: { width: 3000, height: 3000 },
        },
    },
};

/**
 * Password strength requirements
 */
export const passwordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: "@$!%*?&",
    maxLength: 128,
};

/**
 * Get configuration for specific role
 */
export const getProfileConfig = (role) => {
    return profileConfigs[role] || profileConfigs.client;
};

/**
 * Get role configuration (alias for backward compatibility)
 */
export const getRoleConfig = (role) => {
    return getProfileConfig(role);
};

/**
 * Get field configuration for specific role and field
 */
export const getFieldConfig = (role, fieldName) => {
    const config = getProfileConfig(role);
    return config.fields[fieldName] || null;
};

/**
 * Check if field is editable for role
 */
export const isFieldEditable = (role, fieldName) => {
    const config = getProfileConfig(role);
    return config.permissions.canEdit.includes(fieldName);
};

/**
 * Check if field is visible for role
 */
export const isFieldVisible = (role, fieldName) => {
    const config = getProfileConfig(role);
    return config.permissions.canView.includes(fieldName);
};

/**
 * Check if field is read-only for role
 */
export const isFieldReadOnly = (role, fieldName) => {
    const config = getProfileConfig(role);
    return config.permissions.readOnly.includes(fieldName);
};

/**
 * Get fields for specific section and role
 */
export const getSectionFields = (role, section) => {
    const config = getProfileConfig(role);
    const fields = {};

    Object.keys(config.fields).forEach((fieldName) => {
        const fieldConfig = config.fields[fieldName];
        if (
            fieldConfig.section === section &&
            isFieldVisible(role, fieldName)
        ) {
            fields[fieldName] = fieldConfig;
        }
    });

    return fields;
};

/**
 * Get validation rules for field
 */
export const getFieldValidation = (role, fieldName) => {
    const fieldConfig = getFieldConfig(role, fieldName);
    return fieldConfig ? fieldConfig.validation || {} : {};
};

/**
 * Check if user can perform specific action
 */
export const canPerformAction = (role, action) => {
    const config = getProfileConfig(role);
    return config.permissions[action] || false;
};

/**
 * Get available sections for role
 */
export const getAvailableSections = (role) => {
    const config = getProfileConfig(role);
    return config.sections || [];
};

/**
 * Get section configuration by section key
 */
export const getSectionConfig = (sectionKey) => {
    return sectionConfig[sectionKey] || null;
};

/**
 * Check if section is available for role
 */
export const isSectionAvailableForRole = (sectionKey, role) => {
    const section = getSectionConfig(sectionKey);
    return section ? section.roles.includes(role) : false;
};

/**
 * Get file upload configuration by type
 */
export const getFileUploadConfig = (type) => {
    return fileUploadConfig[type] || fileUploadConfig.documents;
};

/**
 * Default export for easy importing
 */
export default {
    PROFILE_SECTIONS,
    FIELD_TYPES,
    VALIDATION_RULES,
    profileConfigs,
    sectionConfig,
    fileUploadConfig,
    passwordRequirements,
    getProfileConfig,
    getRoleConfig,
    getFieldConfig,
    isFieldEditable,
    isFieldVisible,
    isFieldReadOnly,
    getSectionFields,
    getFieldValidation,
    canPerformAction,
    getAvailableSections,
    getSectionConfig,
    isSectionAvailableForRole,
    getFileUploadConfig,
};
