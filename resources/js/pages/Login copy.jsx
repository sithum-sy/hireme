import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPath =
                user.role === "client"
                    ? "/client/dashboard"
                    : user.role === "service_provider"
                    ? "/provider/dashboard"
                    : "/admin/dashboard";
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const result = await login({
            email: formData.email,
            password: formData.password,
        });

        if (result.success) {
            // Get intended destination or default based on role
            const from = location.state?.from?.pathname;
            const defaultPath =
                result.user.role === "client"
                    ? "/client/dashboard"
                    : result.user.role === "service_provider"
                    ? "/provider/dashboard"
                    : "/admin/dashboard";

            navigate(from || defaultPath, { replace: true });
        } else {
            setErrors({ general: result.message });
        }
    };

    return (
        <div className="login-page min-vh-100 bg-light d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-7">
                        <div className="card shadow border-0">
                            {/* Header */}
                            <div className="card-header bg-white text-center py-4 border-bottom">
                                <Link to="/" className="text-decoration-none">
                                    <h3 className="text-primary fw-bold mb-0">
                                        <i className="fas fa-handshake me-2"></i>
                                        HireMe
                                    </h3>
                                </Link>
                                <p className="text-muted mb-0 mt-2">
                                    Welcome back! Please sign in to your account
                                </p>
                            </div>

                            {/* Body */}
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    {/* General Error */}
                                    {errors.general && (
                                        <div className="alert alert-danger d-flex align-items-center mb-4">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {errors.general}
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="fas fa-envelope me-2 text-muted"></i>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={`form-control form-control-lg ${
                                                errors.email ? "is-invalid" : ""
                                            }`}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email address"
                                            autoComplete="email"
                                            autoFocus
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            <i className="fas fa-lock me-2 text-muted"></i>
                                            Password
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                className={`form-control form-control-lg ${
                                                    errors.password
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                tabIndex="-1"
                                            >
                                                <i
                                                    className={`fas ${
                                                        showPassword
                                                            ? "fa-eye-slash"
                                                            : "fa-eye"
                                                    }`}
                                                ></i>
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                className="form-check-input"
                                                id="remember"
                                                checked={formData.remember}
                                                onChange={handleInputChange}
                                            />
                                            <label
                                                className="form-check-label small text-muted"
                                                htmlFor="remember"
                                            >
                                                Remember me
                                            </label>
                                        </div>
                                        <Link
                                            to="/forgot-password"
                                            className="small text-primary text-decoration-none"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Sign In
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="text-center mb-3">
                                        <small className="text-muted">
                                            Don't have an account?
                                        </small>
                                    </div>

                                    {/* Register Buttons */}
                                    <div className="d-grid gap-2">
                                        <Link
                                            to="/register?role=client"
                                            className="btn btn-outline-primary"
                                        >
                                            <i className="fas fa-user me-2"></i>
                                            Sign up as Client
                                        </Link>
                                        <Link
                                            to="/register?role=service_provider"
                                            className="btn btn-outline-success"
                                        >
                                            <i className="fas fa-briefcase me-2"></i>
                                            Sign up as Service Provider
                                        </Link>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="card-footer bg-light text-center py-3 border-top">
                                <small className="text-muted">
                                    By signing in, you agree to our
                                    <Link
                                        to="/terms"
                                        className="text-primary text-decoration-none mx-1"
                                    >
                                        Terms
                                    </Link>
                                    and
                                    <Link
                                        to="/privacy"
                                        className="text-primary text-decoration-none mx-1"
                                    >
                                        Privacy Policy
                                    </Link>
                                </small>
                            </div>
                        </div>

                        {/* Quick Demo Login */}
                        <div className="card mt-3 border-0 bg-transparent">
                            <div className="card-body text-center py-3">
                                <small className="text-muted d-block mb-2">
                                    Demo Accounts:
                                </small>
                                <div className="d-flex gap-2 justify-content-center flex-wrap">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() =>
                                            setFormData({
                                                email: "client@hireme.com",
                                                password: "password123",
                                                remember: false,
                                            })
                                        }
                                    >
                                        Demo Client
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() =>
                                            setFormData({
                                                email: "provider@hireme.com",
                                                password: "password123",
                                                remember: false,
                                            })
                                        }
                                    >
                                        Demo Provider
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
