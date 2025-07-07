import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Configure axios defaults - Use same domain as frontend
axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

// Add request interceptor to include token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on app load
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("auth_token");
            const savedUser = localStorage.getItem("user");

            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    // Verify token is still valid
                    await axios.get("/user");
                } catch (error) {
                    console.error("Token validation failed:", error);
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const formData = new FormData();
            Object.keys(userData).forEach((key) => {
                if (userData[key] !== null && userData[key] !== undefined) {
                    formData.append(key, userData[key]);
                }
            });

            const response = await axios.post("/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem("auth_token", token);
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                return { success: true, user };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Registration failed";
            const validationErrors = error.response?.data?.errors || {};
            setError({ message: errorMessage, errors: validationErrors });
            return {
                success: false,
                error: errorMessage,
                errors: validationErrors,
            };
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await axios.post("/login", { email, password });

            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem("auth_token", token);
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                return { success: true, user };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Login failed";
            setError({ message: errorMessage });
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isClient: user?.role === "client",
        isServiceProvider: user?.role === "service_provider",
        isAdmin: user?.role === "admin",
        isStaff: user?.role === "staff",
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
