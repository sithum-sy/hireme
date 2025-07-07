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

    // Set up axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    // Fix: Use /api/user endpoint
                    const response = await axios.get("/api/user");
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const register = async (userData) => {
        try {
            setLoading(true);

            // Create FormData for file upload
            const formData = new FormData();
            Object.keys(userData).forEach((key) => {
                if (userData[key] !== null && userData[key] !== undefined) {
                    formData.append(key, userData[key]);
                }
            });

            // Fix: Use /api/register endpoint
            const response = await axios.post("/api/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                const { user: userData, token: userToken } = response.data.data;

                setUser(userData);
                setToken(userToken);
                localStorage.setItem("auth_token", userToken);

                return { success: true, user: userData };
            }
        } catch (error) {
            console.error("Registration error:", error);
            const message =
                error.response?.data?.message || "Registration failed";
            const errors = error.response?.data?.errors || {};
            return { success: false, message, errors };
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);

            // Fix: Use /api/login endpoint
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

    const logout = async () => {
        try {
            if (token) {
                // Fix: Use /api/logout endpoint
                await axios.post("/api/logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_token");
            delete axios.defaults.headers.common["Authorization"];
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
