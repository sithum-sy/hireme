import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import profileService from "../services/profileService";
import { getProfileConfig } from "../../config/profileConfig.js";

const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Get role-based configuration
    const config = user ? getProfileConfig(user.role) : null;

    /**
     * Load user profile
     */
    const loadProfile = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await profileService.getProfile();

            if (result.success) {
                setProfile(result.data);
                setErrors({});
            } else {
                setErrors({ general: result.message });
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
            setErrors({ general: "Failed to load profile" });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update basic profile
     */
    const updateProfile = async (data) => {
        try {
            setSaving(true);
            setErrors({});

            const result = await profileService.updateProfile(data);

            if (result.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    user: { ...prevProfile.user, ...result.data.user },
                }));
                return { success: true, message: result.message };
            } else {
                setErrors(result.errors || { general: result.message });
                return {
                    success: false,
                    message: result.message,
                    errors: result.errors,
                };
            }
        } catch (error) {
            const errorMessage = "Failed to update profile";
            setErrors({ general: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Upload profile image
     */
    const uploadProfileImage = async (file) => {
        try {
            setSaving(true);
            setErrors({});

            const result = await profileService.uploadProfileImage(file);

            if (result.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    user: {
                        ...prevProfile.user,
                        profile_picture: result.data.profile_picture_url,
                    },
                }));
                return { success: true, message: result.message };
            } else {
                setErrors(result.errors || { general: result.message });
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = "Failed to upload image";
            setErrors({ general: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Delete profile image
     */
    const deleteProfileImage = async () => {
        try {
            setSaving(true);
            setErrors({});

            const result = await profileService.deleteProfileImage();

            if (result.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    user: { ...prevProfile.user, profile_picture: null },
                }));
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = "Failed to delete image";
            setErrors({ general: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Update provider profile
     */
    const updateProviderProfile = async (data) => {
        try {
            setSaving(true);
            setErrors({});

            const result = await profileService.updateProviderProfile(data);

            if (result.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    provider_profile: {
                        ...prevProfile.provider_profile,
                        ...result.data.provider_profile,
                    },
                }));
                return { success: true, message: result.message };
            } else {
                setErrors(result.errors || { general: result.message });
                return {
                    success: false,
                    message: result.message,
                    errors: result.errors,
                };
            }
        } catch (error) {
            const errorMessage = "Failed to update provider profile";
            setErrors({ general: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Change password
     */
    const changePassword = async (passwordData) => {
        try {
            setSaving(true);
            setErrors({});

            const result = await profileService.changePassword(passwordData);

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                setErrors(result.errors || { general: result.message });
                return {
                    success: false,
                    message: result.message,
                    errors: result.errors,
                };
            }
        } catch (error) {
            const errorMessage = "Failed to change password";
            setErrors({ general: errorMessage });
            return { success: false, message: errorMessage };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Validate field
     */
    const validateField = async (fieldName, fieldValue) => {
        try {
            const result = await profileService.validateField(
                fieldName,
                fieldValue
            );
            return result;
        } catch (error) {
            return { success: false, message: "Validation failed" };
        }
    };

    /**
     * Toggle provider availability
     */
    const toggleAvailability = async () => {
        try {
            setSaving(true);
            const result = await profileService.toggleAvailability();

            if (result.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    provider_profile: {
                        ...prevProfile.provider_profile,
                        is_available: result.data.is_available,
                    },
                }));
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: "Failed to toggle availability" };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Delete provider document
     */
    const deleteProviderDocument = async (documentType, index = null) => {
        try {
            setSaving(true);
            const result = await profileService.deleteProviderDocument(
                documentType,
                index
            );

            if (result.success) {
                // Update profile state by removing the deleted document
                setProfile((prevProfile) => {
                    const updatedProfile = { ...prevProfile };
                    const providerProfile = {
                        ...updatedProfile.provider_profile,
                    };

                    if (documentType === "business_license") {
                        providerProfile.business_license_url = null;
                    } else if (
                        documentType === "certification" &&
                        index !== null
                    ) {
                        const certUrls = [
                            ...(providerProfile.certification_urls || []),
                        ];
                        certUrls.splice(index, 1);
                        providerProfile.certification_urls = certUrls;
                    } else if (
                        documentType === "portfolio_image" &&
                        index !== null
                    ) {
                        const portfolioUrls = [
                            ...(providerProfile.portfolio_image_urls || []),
                        ];
                        portfolioUrls.splice(index, 1);
                        providerProfile.portfolio_image_urls = portfolioUrls;
                    }

                    updatedProfile.provider_profile = providerProfile;
                    return updatedProfile;
                });

                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: "Failed to delete document" };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Clear errors
     */
    const clearErrors = () => {
        setErrors({});
    };

    /**
     * Clear specific field error
     */
    const clearFieldError = (fieldName) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    // Load profile when user changes
    useEffect(() => {
        if (user) {
            loadProfile();
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [user]);

    const value = {
        // State
        profile,
        loading,
        errors,
        saving,
        config,

        // Actions
        loadProfile,
        updateProfile,
        uploadProfileImage,
        deleteProfileImage,
        updateProviderProfile,
        changePassword,
        validateField,
        toggleAvailability,
        deleteProviderDocument,
        clearErrors,
        clearFieldError,

        // Computed values
        isProvider: user?.role === "service_provider",
        isClient: user?.role === "client",
        isStaff: user?.role === "staff",
        isAdmin: user?.role === "admin",

        // Helper methods
        canEdit: (fieldName) =>
            config?.permissions.canEdit.includes(fieldName) || false,
        canView: (fieldName) =>
            config?.permissions.canView.includes(fieldName) || false,
        isReadOnly: (fieldName) =>
            config?.permissions.readOnly.includes(fieldName) || false,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
