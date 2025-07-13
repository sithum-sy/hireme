// resources/js/context/AuthContext.jsx
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

    // Check authentication status on app load
    useEffect(() => {
        const checkAuthStatus = async () => {
            const storedToken = localStorage.getItem("auth_token");

            if (storedToken) {
                setToken(storedToken);
                try {
                    const response = await axios.get("/api/user");
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        // Token is invalid, clear it
                        localStorage.removeItem("auth_token");
                        setToken(null);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem("auth_token");
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []); // Empty dependency array - only run on mount

    const register = async (userData) => {
        try {
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
            }
        } catch (error) {
            console.error("Login error:", error);
            const message = error.response?.data?.message || "Login failed";
            return { success: false, message };
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
