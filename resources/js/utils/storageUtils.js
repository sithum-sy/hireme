const STORAGE_PREFIX = "hireme_profile_";

/**
 * Save form draft to localStorage
 */
export const saveDraft = (userId, section, data) => {
    try {
        const key = `${STORAGE_PREFIX}${userId}_${section}`;
        const draft = {
            data,
            timestamp: Date.now(),
            version: "1.0",
        };
        localStorage.setItem(key, JSON.stringify(draft));
        return true;
    } catch (error) {
        console.warn("Failed to save draft:", error);
        return false;
    }
};

/**
 * Load form draft from localStorage
 */
export const loadDraft = (userId, section) => {
    try {
        const key = `${STORAGE_PREFIX}${userId}_${section}`;
        const stored = localStorage.getItem(key);

        if (!stored) return null;

        const draft = JSON.parse(stored);

        // Check if draft is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - draft.timestamp > maxAge) {
            clearDraft(userId, section);
            return null;
        }

        return draft.data;
    } catch (error) {
        console.warn("Failed to load draft:", error);
        return null;
    }
};

/**
 * Clear form draft from localStorage
 */
export const clearDraft = (userId, section) => {
    try {
        const key = `${STORAGE_PREFIX}${userId}_${section}`;
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn("Failed to clear draft:", error);
        return false;
    }
};

/**
 * Check if draft exists
 */
export const hasDraft = (userId, section) => {
    const draft = loadDraft(userId, section);
    return draft !== null;
};

/**
 * Clear all drafts for user
 */
export const clearAllDrafts = (userId) => {
    try {
        const keys = Object.keys(localStorage);
        const userPrefix = `${STORAGE_PREFIX}${userId}_`;

        keys.forEach((key) => {
            if (key.startsWith(userPrefix)) {
                localStorage.removeItem(key);
            }
        });

        return true;
    } catch (error) {
        console.warn("Failed to clear all drafts:", error);
        return false;
    }
};
