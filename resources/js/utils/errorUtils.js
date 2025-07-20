/**
 * Standardized error message formatting
 */
export const formatErrorMessage = (error) => {
    if (typeof error === "string") {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    return "An unexpected error occurred";
};

/**
 * Extract validation errors from API response
 */
export const extractValidationErrors = (errorResponse) => {
    const errors = {};

    if (errorResponse?.errors) {
        Object.keys(errorResponse.errors).forEach((field) => {
            const fieldErrors = errorResponse.errors[field];
            if (Array.isArray(fieldErrors)) {
                errors[field] = fieldErrors;
            } else {
                errors[field] = [fieldErrors];
            }
        });
    }

    return errors;
};

/**
 * Merge multiple error objects
 */
export const mergeErrors = (...errorObjects) => {
    const merged = {};

    errorObjects.forEach((errors) => {
        if (errors && typeof errors === "object") {
            Object.keys(errors).forEach((field) => {
                if (!merged[field]) {
                    merged[field] = [];
                }

                const fieldErrors = Array.isArray(errors[field])
                    ? errors[field]
                    : [errors[field]];
                merged[field] = [...merged[field], ...fieldErrors];
            });
        }
    });

    return merged;
};

/**
 * Clear specific errors from error object
 */
export const clearErrors = (errors, fieldsToClear) => {
    const cleaned = { ...errors };

    fieldsToClear.forEach((field) => {
        delete cleaned[field];
    });

    return cleaned;
};

/**
 * Check if there are any errors
 */
export const hasErrors = (errors) => {
    return Object.keys(errors).some((key) => {
        const fieldErrors = errors[key];
        return Array.isArray(fieldErrors)
            ? fieldErrors.length > 0
            : !!fieldErrors;
    });
};
