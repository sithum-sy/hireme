import React, { createContext, useContext, useReducer, useEffect } from "react";
import { profileAPI, providerProfileAPI } from "../services/api";

const ProfileContext = createContext();

const initialState = {
    profile: null,
    config: null,
    loading: false,
    saving: false,
    error: null,
    fieldErrors: {},
};

function profileReducer(state, action) {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_SAVING":
            return { ...state, saving: action.payload };
        case "SET_PROFILE":
            return { ...state, profile: action.payload, error: null };
        case "SET_CONFIG":
            return { ...state, config: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_FIELD_ERROR":
            return {
                ...state,
                fieldErrors: {
                    ...state.fieldErrors,
                    [action.payload.field]: action.payload.error,
                },
            };
        case "CLEAR_FIELD_ERROR":
            const newFieldErrors = { ...state.fieldErrors };
            delete newFieldErrors[action.payload];
            return { ...state, fieldErrors: newFieldErrors };
        case "CLEAR_ERRORS":
            return { ...state, error: null, fieldErrors: {} };
        default:
            return state;
    }
}

export const ProfileProvider = ({ children }) => {
    const [state, dispatch] = useReducer(profileReducer, initialState);

    // Load profile data on mount
    useEffect(() => {
        loadProfile();
        loadConfig();
    }, []);

    const loadProfile = async () => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });
            const response = await profileAPI.getProfile();

            if (response.data.success) {
                dispatch({ type: "SET_PROFILE", payload: response.data.data });
            } else {
                dispatch({ type: "SET_ERROR", payload: response.data.message });
            }
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Failed to load profile" });
            console.error("Profile load error:", error);
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const loadConfig = async () => {
        try {
            const response = await profileAPI.getConfig();

            if (response.data.success) {
                dispatch({ type: "SET_CONFIG", payload: response.data.data });
            }
        } catch (error) {
            console.error("Config load error:", error);
        }
    };

    const updateProfile = async (data) => {
        try {
            dispatch({ type: "SET_SAVING", payload: true });
            dispatch({ type: "CLEAR_ERRORS" });

            const response = await profileAPI.updateProfile(data);

            if (response.data.success) {
                dispatch({ type: "SET_PROFILE", payload: response.data.data });
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message: response.data.message,
                    errors: response.data.errors,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to update profile";
            const errors = error.response?.data?.errors || {};

            dispatch({ type: "SET_ERROR", payload: errorMessage });
            return { success: false, message: errorMessage, errors };
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const updateProviderProfile = async (data) => {
        try {
            dispatch({ type: "SET_SAVING", payload: true });
            dispatch({ type: "CLEAR_ERRORS" });

            const response = await providerProfileAPI.updateProfile(data);

            if (response.data.success) {
                dispatch({ type: "SET_PROFILE", payload: response.data.data });
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message: response.data.message,
                    errors: response.data.errors,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to update provider profile";
            const errors = error.response?.data?.errors || {};

            dispatch({ type: "SET_ERROR", payload: errorMessage });
            return { success: false, message: errorMessage, errors };
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const uploadImage = async (file) => {
        try {
            dispatch({ type: "SET_SAVING", payload: true });

            const response = await profileAPI.uploadImage(file);

            if (response.data.success) {
                // Update profile with new image URL
                const updatedProfile = {
                    ...state.profile,
                    user: {
                        ...state.profile.user,
                        profile_picture: response.data.data.full_url,
                    },
                };
                dispatch({ type: "SET_PROFILE", payload: updatedProfile });
                return {
                    success: true,
                    message: response.data.message,
                    imageUrl: response.data.data.full_url,
                };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to upload image";
            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const deleteImage = async () => {
        try {
            dispatch({ type: "SET_SAVING", payload: true });

            const response = await profileAPI.deleteImage();

            if (response.data.success) {
                // Update profile to remove image
                const updatedProfile = {
                    ...state.profile,
                    user: {
                        ...state.profile.user,
                        profile_picture: null,
                    },
                };
                dispatch({ type: "SET_PROFILE", payload: updatedProfile });
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to delete image";
            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const changePassword = async (data) => {
        try {
            dispatch({ type: "SET_SAVING", payload: true });
            dispatch({ type: "CLEAR_ERRORS" });

            const response = await profileAPI.changePassword(data);

            if (response.data.success) {
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message: response.data.message,
                    errors: response.data.errors,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to change password";
            const errors = error.response?.data?.errors || {};

            return { success: false, message: errorMessage, errors };
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const toggleAvailability = async () => {
        try {
            const response = await providerProfileAPI.toggleAvailability();

            if (response.data.success) {
                // Update profile with new availability status
                const updatedProfile = {
                    ...state.profile,
                    provider_profile: {
                        ...state.profile.provider_profile,
                        is_available: response.data.data.is_available,
                    },
                };
                dispatch({ type: "SET_PROFILE", payload: updatedProfile });
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to toggle availability";
            return { success: false, message: errorMessage };
        }
    };

    const uploadDocuments = async (files) => {
        try {
            dispatch({ type: "SET_SAVING", payload: true });

            const response = await providerProfileAPI.uploadDocuments(files);

            if (response.data.success) {
                // Refresh profile to get updated documents
                await loadProfile();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message: response.data.message,
                    errors: response.data.errors,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to upload documents";
            const errors = error.response?.data?.errors || {};

            return { success: false, message: errorMessage, errors };
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const deleteProviderDocument = async (documentType, index = null) => {
        try {
            const response = await providerProfileAPI.deleteDocument(
                documentType,
                index
            );

            if (response.data.success) {
                // Refresh profile to get updated documents
                await loadProfile();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to delete document";
            return { success: false, message: errorMessage };
        }
    };

    const validateField = async (fieldName, value) => {
        try {
            const response = await profileAPI.validateField(fieldName, value);

            if (!response.data.success) {
                dispatch({
                    type: "SET_FIELD_ERROR",
                    payload: { field: fieldName, error: response.data.message },
                });
                return { success: false, message: response.data.message };
            } else {
                dispatch({ type: "CLEAR_FIELD_ERROR", payload: fieldName });
                return { success: true };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Validation failed";
            dispatch({
                type: "SET_FIELD_ERROR",
                payload: { field: fieldName, error: errorMessage },
            });
            return { success: false, message: errorMessage };
        }
    };

    const clearFieldError = (fieldName) => {
        dispatch({ type: "CLEAR_FIELD_ERROR", payload: fieldName });
    };

    const clearErrors = () => {
        dispatch({ type: "CLEAR_ERRORS" });
    };

    // Helper functions for permissions
    const canEdit = (fieldName) => {
        return state.config?.permissions?.canEdit?.includes(fieldName) || false;
    };

    const canView = (fieldName) => {
        return state.config?.permissions?.canView?.includes(fieldName) || false;
    };

    const isReadOnly = (fieldName) => {
        return (
            state.config?.permissions?.readOnly?.includes(fieldName) || false
        );
    };

    const value = {
        // State
        profile: state.profile,
        config: state.config,
        loading: state.loading,
        saving: state.saving,
        error: state.error,
        fieldErrors: state.fieldErrors,

        // Actions
        loadProfile,
        updateProfile,
        updateProviderProfile,
        uploadImage,
        deleteImage,
        changePassword,
        toggleAvailability,
        uploadDocuments,
        deleteProviderDocument,
        validateField,
        clearFieldError,
        clearErrors,

        // Helpers
        canEdit,
        canView,
        isReadOnly,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
