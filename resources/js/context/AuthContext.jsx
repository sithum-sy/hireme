import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("auth_token"));

    // Set up axios defaults when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const refreshToken = async () => {
        try {
            const response = await axios.post("/api/refresh-token");
            if (response.data.success) {
                const { token: newToken } = response.data.data;
                setToken(newToken);
                localStorage.setItem("auth_token", newToken);
                return true;
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    };

    // Check authentication status on app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            const storedToken = localStorage.getItem("auth_token");

            if (storedToken) {
                // Validate token format before making API call
                if (!storedToken.includes("|")) {
                    // Invalid token format, clear it
                    console.warn("Invalid token format, clearing");
                    localStorage.removeItem("auth_token");
                    setUser(null);
                    setToken(null);
                    setLoading(false);
                    return;
                }

                setToken(storedToken);
                try {
                    const response = await axios.get("/api/user");
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        // Token is invalid, clear everything
                        console.warn("Token is invalid, clearing auth data");
                        localStorage.removeItem("auth_token");
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);

                    // Only clear token for specific errors, not network errors
                    if (
                        error.response &&
                        (error.response.status === 401 ||
                            error.response.status === 403 ||
                            error.response.status === 500)
                    ) {
                        // Authentication error or server error - token is likely invalid
                        console.warn(
                            "Authentication failed, clearing auth data"
                        );
                        localStorage.removeItem("auth_token");
                        setToken(null);
                        setUser(null);
                    } else {
                        // Network error - keep token but clear user
                        console.warn(
                            "Network error during auth check, keeping token"
                        );
                        setUser(null);
                    }
                }
            } else {
                // No token, ensure user state is cleared
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const clearAuthData = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("client_preferred_radius");
        localStorage.removeItem("profile_image_2");
        // Remove any other auth-related localStorage items
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common["Authorization"];
    };

    const register = async (userData) => {
        try {
            clearAuthData();

            // Debug logging
            console.log("Registration data type:", userData.constructor.name);
            if (userData instanceof FormData) {
                console.log("FormData contents:");
                for (let [key, value] of userData.entries()) {
                    if (value instanceof File) {
                        console.log(`${key}:`, {
                            name: value.name,
                            type: value.type,
                            size: value.size,
                        });
                    } else {
                        console.log(`${key}:`, value);
                    }
                }
            } else {
                console.log("Regular data:", userData);
            }

            const response = await axios.post("/api/register", userData, {
                headers: {
                    "Content-Type":
                        userData instanceof FormData
                            ? "multipart/form-data"
                            : "application/json",
                },
            });

            if (response.data.success) {
                const { user, token } = response.data.data;
                setUser(user);
                setToken(token);
                localStorage.setItem("auth_token", token);
                return { success: true, user };
            }
        } catch (error) {
            console.error("Registration error:", error);

            // Log detailed error for debugging
            if (error.response?.data) {
                console.log("Validation errors:", error.response.data);
            }

            return {
                success: false,
                message: error.response?.data?.message || "Registration failed",
                errors: error.response?.data?.errors || {},
            };
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);

            const response = await axios.post("/api/login", credentials);

            if (response.data.success) {
                const { user: userData, token: userToken } = response.data.data;

                setUser(userData);
                setToken(userToken);
                localStorage.setItem("auth_token", userToken);

                return { success: true, user: userData };
            } else {
                return {
                    success: false,
                    message: response.data.message || "Login failed",
                };
            }
        } catch (error) {
            console.error("Login error:", error);

            // Handle different types of errors
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 401:
                        return {
                            success: false,
                            message:
                                data.message || "Invalid email or password",
                        };
                    case 403:
                        return {
                            success: false,
                            message: data.message || "Account is deactivated",
                        };
                    case 422:
                        return {
                            success: false,
                            message: data.message || "Validation failed",
                            errors: data.errors || {},
                        };
                    default:
                        return {
                            success: false,
                            message: data.message || "Login failed",
                        };
                }
            } else if (error.request) {
                // The request was made but no response was received
                return {
                    success: false,
                    message: "Network error. Please check your connection.",
                };
            } else {
                // Something happened in setting up the request
                return {
                    success: false,
                    message: "An unexpected error occurred",
                };
            }
        } finally {
            setLoading(false);
        }
    };

    // const logout = async () => {
    //     try {
    //         if (token) {
    //             await axios.post("/api/logout");
    //         }
    //     } catch (error) {
    //         console.error("Logout error:", error);
    //     } finally {
    //         setUser(null);
    //         setToken(null);
    //         localStorage.removeItem("auth_token");
    //         delete axios.defaults.headers.common["Authorization"];
    //     }
    // };

    const logout = async () => {
        try {
            // Only attempt API logout if we have a valid token
            if (token) {
                try {
                    await axios.post("/api/logout");
                } catch (apiError) {
                    // Log the API error but don't let it prevent logout
                    console.warn(
                        "API logout failed, but continuing with local logout:",
                        {
                            status: apiError.response?.status,
                            message:
                                apiError.response?.data?.message ||
                                apiError.message,
                        }
                    );
                }
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Always clear local auth data regardless of API response
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_token");
            delete axios.defaults.headers.common["Authorization"];

            // Optional: Clear all localStorage if needed
            // localStorage.clear();
        }
    };

    const isStaff = () => {
        return user?.role === "staff";
    };

    const hasStaffPermission = (permission) => {
        return isStaff() && user?.permissions?.includes(permission);
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        isStaff,
        hasStaffPermission,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
