import { VALIDATION_RULES } from "../../config/profileConfig";

/**
 * Validate a single field based on its configuration
 */
export const validateField = (value, fieldConfig, allValues = {}) => {
    const errors = [];
    const validation = fieldConfig.validation || {};

    // Required validation
    if (
        validation[VALIDATION_RULES.REQUIRED] &&
        (!value || value.toString().trim() === "")
    ) {
        errors.push(`${fieldConfig.label} is required`);
        return errors; // Return early if required field is empty
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === "") {
        return errors;
    }

    // Email validation
    if (validation[VALIDATION_RULES.EMAIL]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errors.push("Please enter a valid email address");
        }
    }

    // Minimum length validation
    if (validation[VALIDATION_RULES.MIN_LENGTH]) {
        const minLength = validation[VALIDATION_RULES.MIN_LENGTH];
        if (value.toString().length < minLength) {
            errors.push(
                `${fieldConfig.label} must be at least ${minLength} characters`
            );
        }
    }

    // Maximum length validation
    if (validation[VALIDATION_RULES.MAX_LENGTH]) {
        const maxLength = validation[VALIDATION_RULES.MAX_LENGTH];
        if (value.toString().length > maxLength) {
            errors.push(
                `${fieldConfig.label} must not exceed ${maxLength} characters`
            );
        }
    }

    // Pattern validation
    if (validation[VALIDATION_RULES.PATTERN]) {
        const pattern = new RegExp(validation[VALIDATION_RULES.PATTERN]);
        if (!pattern.test(value)) {
            errors.push(`${fieldConfig.label} format is invalid`);
        }
    }

    // Number validations
    if (fieldConfig.type === "number") {
        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            errors.push(`${fieldConfig.label} must be a valid number`);
        } else {
            if (validation.min !== undefined && numValue < validation.min) {
                errors.push(
                    `${fieldConfig.label} must be at least ${validation.min}`
                );
            }
            if (validation.max !== undefined && numValue > validation.max) {
                errors.push(
                    `${fieldConfig.label} must not exceed ${validation.max}`
                );
            }
        }
    }

    return errors;
};

/**
 * Validate file based on field configuration
 */
export const validateFile = (file, fieldConfig) => {
    const errors = [];
    const validation = fieldConfig.validation || {};

    if (!file) {
        if (fieldConfig.required) {
            errors.push(`${fieldConfig.label} is required`);
        }
        return errors;
    }

    // File size validation (in KB)
    if (validation[VALIDATION_RULES.FILE_SIZE]) {
        const maxSizeKB = validation[VALIDATION_RULES.FILE_SIZE];
        const fileSizeKB = file.size / 1024;

        if (fileSizeKB > maxSizeKB) {
            const maxSizeMB = maxSizeKB / 1024;
            errors.push(`File size must not exceed ${maxSizeMB}MB`);
        }
    }

    // File type validation
    if (validation[VALIDATION_RULES.FILE_TYPE]) {
        const allowedTypes = validation[VALIDATION_RULES.FILE_TYPE];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
        }
    }

    return errors;
};

/**
 * Validate multiple files
 */
export const validateFiles = (files, fieldConfig) => {
    const errors = [];

    if (!files || files.length === 0) {
        if (fieldConfig.required) {
            errors.push(`${fieldConfig.label} is required`);
        }
        return errors;
    }

    // Check maximum number of files
    if (fieldConfig.maxFiles && files.length > fieldConfig.maxFiles) {
        errors.push(`Maximum ${fieldConfig.maxFiles} files allowed`);
    }

    // Validate each file
    files.forEach((file, index) => {
        const fileErrors = validateFile(file, fieldConfig);
        fileErrors.forEach((error) => {
            errors.push(`File ${index + 1}: ${error}`);
        });
    });

    return errors;
};

/**
 * Validate entire form based on role configuration
 */
export const validateForm = (values, roleConfig) => {
    const errors = {};

    Object.keys(roleConfig.fields).forEach((fieldName) => {
        const fieldConfig = roleConfig.fields[fieldName];
        const fieldValue = values[fieldName];

        // Skip validation for read-only fields
        if (fieldConfig.readOnly) {
            return;
        }

        let fieldErrors = [];

        if (fieldConfig.type === "file" || fieldConfig.type === "image") {
            if (fieldConfig.multiple) {
                fieldErrors = validateFiles(fieldValue, fieldConfig);
            } else {
                fieldErrors = validateFile(fieldValue, fieldConfig);
            }
        } else {
            fieldErrors = validateField(fieldValue, fieldConfig, values);
        }

        if (fieldErrors.length > 0) {
            errors[fieldName] = fieldErrors;
        }
    });

    return errors;
};

/**
 * Check if form has any errors
 */
export const hasFormErrors = (errors) => {
    return Object.keys(errors).some(
        (key) =>
            errors[key] &&
            (Array.isArray(errors[key]) ? errors[key].length > 0 : true)
    );
};

/**
 * Get first error message for a field
 */
export const getFieldError = (errors, fieldName) => {
    const fieldErrors = errors[fieldName];
    if (!fieldErrors) return null;

    if (Array.isArray(fieldErrors)) {
        return fieldErrors[0] || null;
    }

    return fieldErrors;
};

/**
 * Password strength validation
 */
export const validatePasswordStrength = (password) => {
    const errors = [];
    const score = { value: 0, label: "Very Weak" };

    if (!password) {
        return { errors: ["Password is required"], score };
    }

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    } else {
        score.value += 1;
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    } else {
        score.value += 1;
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    } else {
        score.value += 1;
    }

    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
    } else {
        score.value += 1;
    }

    if (!/[@$!%*?&]/.test(password)) {
        errors.push(
            "Password must contain at least one special character (@$!%*?&)"
        );
    } else {
        score.value += 1;
    }

    // Set score label
    if (score.value >= 5) {
        score.label = "Very Strong";
    } else if (score.value >= 4) {
        score.label = "Strong";
    } else if (score.value >= 3) {
        score.label = "Medium";
    } else if (score.value >= 2) {
        score.label = "Weak";
    }

    return { errors, score };
};
