import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [resendingVerification, setResendingVerification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Handle success message from registration
    useEffect(() => {
        if (location.state?.message) {
            if (location.state.type === 'success') {
                setSuccessMessage(location.state.message);
                if (location.state.email) {
                    setUnverifiedEmail(location.state.email);
                }
            }
            // Clear the location state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);


    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPath =
                user.role === "client"
                    ? "/client/dashboard"
                    : user.role === "service_provider"
                    ? "/provider/dashboard"
                    : user.role === "admin"
                    ? "/admin/dashboard"
                    : "/staff/dashboard";
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } // Check for valid email format - Regex pattern
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear only general errors, keep field errors for validation
        setErrors(prev => ({ ...prev, general: undefined }));
        setShowResendVerification(false);
        setSuccessMessage('');

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            const result = await login({
                email: formData.email,
                password: formData.password,
                remember: formData.remember,
            });

            if (result.success) {
                const from = location.state?.from?.pathname;
                const defaultPath =
                    result.user.role === "client"
                        ? "/client/dashboard"
                        : result.user.role === "service_provider"
                        ? "/provider/dashboard"
                        : result.user.role === "admin"
                        ? "/admin/dashboard"
                        : "/staff/dashboard";

                navigate(from || defaultPath, { replace: true });
            } else {
                // Handle email verification error
                if (result.error_code === 'EMAIL_NOT_VERIFIED') {
                    setShowResendVerification(true);
                    setUnverifiedEmail(result.data?.email || formData.email);
                    setErrors({ general: result.message });
                } else if (result.errors) {
                    // Handle field-specific errors (422 validation errors)
                    setErrors(result.errors);
                } else {
                    // Handle general errors (401, 403, etc.)
                    setErrors({ general: result.message });
                }
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            setErrors({
                general: "An unexpected error occurred. Please try again.",
            });
        }
    };

    const handleDemoLogin = (email, password) => {
        setFormData((prev) => ({
            ...prev,
            email,
            password,
        }));
    };

    const handleResendVerification = async () => {
        try {
            setResendingVerification(true);
            
            // Use axios to ensure proper CSRF token handling
            const response = await axios.post('/api/resend-verification', {
                email: unverifiedEmail
            });
            
            if (response.data.success) {
                setSuccessMessage('Verification email sent! Please check your inbox.');
                setShowResendVerification(false);
                setErrors({});
            } else {
                setErrors({ general: response.data.message || 'Failed to send verification email.' });
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send verification email. Please try again.';
            setErrors({ general: errorMessage });
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-container">
                {/* Left Branding Panel */}
                <div className="auth-branding">
                    <div className="auth-branding-content">
                        {/* Logo and Title */}
                        <div className="brand-section">
                            <h1 className="brand-title">HireMe</h1>
                            <p className="brand-subtitle">
                                Connect. Hire. Get Things Done.
                            </p>
                        </div>

                        {/* Illustration Container */}
                        <div className="illustration-container">
                            <div className="illustration-card-simple">
                                <img
                                    src="/images/login-graphics/login.png"
                                    alt="Professional Services Illustration"
                                    className="illustration-image-full"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        document.querySelector(
                                            ".illustration-fallback"
                                        ).style.display = "flex";
                                    }}
                                />
                                <div
                                    className="illustration-fallback"
                                    style={{ display: "none" }}
                                >
                                    <i className="fas fa-users fa-4x mb-3"></i>
                                    <div className="illustration-text">
                                        <h4>Professional Services</h4>
                                        <p>
                                            Connect with verified service
                                            providers
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="features-list">
                            <div className="feature-item">
                                <i className="fas fa-check-circle"></i>
                                <span>Trusted Service Providers</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Secure Payments</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-star"></i>
                                <span>Quality Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel with Card */}
                <div className="auth-form-panel">
                    <div className="auth-card">
                        {/* Card Header */}
                        <div className="card-header">
                            <h2 className="card-title">Welcome Back</h2>
                            <p className="card-subtitle">
                                Sign in to your account
                            </p>
                        </div>

                        {/* Card Body */}
                        <div className="card-body">
                            {/* General Error */}
                            {/* {errors.general && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
                                </div>
                            )} */}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="auth-alert success">
                                    <i className="fas fa-check-circle"></i>
                                    {successMessage}
                                </div>
                            )}

                            {/* General Error */}
                            {errors.general && (
                                <div className="auth-alert danger">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    {errors.general}
                                </div>
                            )}

                            {/* Email Verification Resend */}
                            {showResendVerification && (
                                <div className="auth-alert" style={{ 
                                    background: '#fefbf3', 
                                    border: '1px solid #fed7aa', 
                                    color: '#c2410c' 
                                }}>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <i className="fas fa-envelope"></i>
                                        Your email address is not verified.
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        className="btn btn-sm btn-outline-primary"
                                        disabled={resendingVerification}
                                        style={{ fontSize: '0.875rem' }}
                                    >
                                        {resendingVerification ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" style={{ marginRight: '0.5rem' }}></span>
                                                Sending...
                                            </>
                                        ) : (
                                            'Resend Verification Email'
                                        )}
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div
                                    className={`form-group ${
                                        errors.email ? "has-error" : ""
                                    }`}
                                >
                                    <label className="form-label">
                                        Email Address
                                    </label>
                                    <div className="input-group">
                                        <span className="input-icon">
                                            <i className="fas fa-envelope"></i>
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            className={`form-input ${
                                                errors.email ? "is-invalid" : ""
                                            }`}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="error-message">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div
                                    className={`form-group ${
                                        errors.password ? "has-error" : ""
                                    }`}
                                >
                                    <label className="form-label">
                                        Password
                                    </label>
                                    <div className="input-group">
                                        <span className="input-icon">
                                            <i className="fas fa-lock"></i>
                                        </span>
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            className={`form-input ${
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
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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
                                        <div className="error-message">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="form-options">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={formData.remember}
                                            onChange={handleInputChange}
                                        />
                                        <span className="checkmark"></span>
                                        Remember me
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="forgot-link"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading}
                                >
                                    {loading && (
                                        <span className="spinner"></span>
                                    )}
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Sign In
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="divider">
                                <span>Don't have an account?</span>
                            </div>

                            {/* Register Links */}
                            <div className="register-links">
                                <Link
                                    to="/register?role=client"
                                    className="register-btn client"
                                >
                                    <i className="fas fa-user me-2"></i>
                                    Sign Up and Find Help Fast
                                </Link>
                                <Link
                                    to="/register?role=service_provider"
                                    className="register-btn provider"
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    Join With Us and Work Your Way
                                </Link>
                            </div>
                        </div>

                        {/* Demo Section */}
                        <div className="demo-section">
                            <div className="demo-header">
                                <i className="fas fa-play-circle me-2"></i>
                                Try Demo Accounts
                            </div>
                            <div className="demo-buttons">
                                <button
                                    type="button"
                                    className="demo-btn"
                                    onClick={() =>
                                        handleDemoLogin(
                                            "client@hireme.com",
                                            "password123"
                                        )
                                    }
                                >
                                    <div className="demo-icon client">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="demo-info">
                                        <span className="demo-title">
                                            Demo Client
                                        </span>
                                        <span className="demo-desc">
                                            Browse services
                                        </span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="demo-btn"
                                    onClick={() =>
                                        handleDemoLogin(
                                            "provider@hireme.com",
                                            "password123"
                                        )
                                    }
                                >
                                    <div className="demo-icon provider">
                                        <i className="fas fa-briefcase"></i>
                                    </div>
                                    <div className="demo-info">
                                        <span className="demo-title">
                                            Demo Provider
                                        </span>
                                        <span className="demo-desc">
                                            Manage services
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Updated Styles */}
            <style>{`
                .auth-layout {
                    min-height: 100vh;
                    background: linear-gradient(
                        135deg,
                        var(--primary-color) 0%,
                        var(--primary-hover) 100%
                    );
                    font-family: "Inter", -apple-system, BlinkMacSystemFont,
                        sans-serif;
                }

                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: stretch;
                }

                /* Left Branding Panel */
                .auth-branding {
                    flex: 1;
                    display: none;
                    background: linear-gradient(
                        135deg,
                        var(--primary-color) 0%,
                        var(--primary-hover) 100%
                    );
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                @media (min-width: 992px) {
                    .auth-branding {
                        display: flex;
                        max-width: 50%;
                    }
                }

                .auth-branding::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                            circle at 30% 20%,
                            rgba(255, 255, 255, 0.1) 0%,
                            transparent 50%
                        ),
                        radial-gradient(
                            circle at 70% 80%,
                            rgba(255, 255, 255, 0.05) 0%,
                            transparent 50%
                        );
                }

                .auth-branding-content {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 3rem;
                    max-width: 500px;
                    margin: auto;
                    width: 100%;
                }

                .brand-section {
                    margin-bottom: 3rem;
                    text-align: center;
                }

                .brand-title {
                    font-size: 3.5rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    letter-spacing: -0.02em;
                }

                .brand-subtitle {
                    font-size: 1.375rem;
                    opacity: 0.95;
                    margin: 0;
                    font-weight: 400;
                    line-height: 1.4;
                }

                .illustration-container {
                    margin-bottom: 3rem;
                    width: 100%;
                }

                .illustration-card-simple {
                    border-radius: 16px;
                    overflow: hidden;
                    position: relative;
                    min-height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    width: 100%;
                }

                .illustration-image-full {
                    width: 100%;
                    height: 100%;
                    min-height: 250px;
                    object-fit: cover;
                    object-position: center;
                    border-radius: 16px;
                    display: block;
                }

                .illustration-fallback {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    height: 100%;
                    min-height: 250px;
                    opacity: 0.9;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                }

                .illustration-text h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .illustration-text p {
                    font-size: 0.95rem;
                    opacity: 0.8;
                    margin: 0;
                }

                .features-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    width: 100%;
                    align-items: center;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1.125rem;
                    font-weight: 500;
                    justify-content: center;
                    text-align: center;
                    width: 100%;
                }

                .feature-item i {
                    color: var(--success-color);
                    width: 24px;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                /* Mobile adjustments */
                @media (max-width: 768px) {
                    .auth-branding-content {
                        padding: 2rem;
                    }

                    .brand-title {
                        font-size: 2.75rem;
                    }

                    .brand-subtitle {
                        font-size: 1.125rem;
                    }

                    .illustration-card-simple {
                        min-height: 200px;
                    }

                    .illustration-image-full {
                        min-height: 200px;
                    }

                    .illustration-fallback {
                        min-height: 200px;
                        padding: 1.5rem;
                    }

                    .feature-item {
                        font-size: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .brand-title {
                        font-size: 2.25rem;
                    }

                    .brand-subtitle {
                        font-size: 1rem;
                    }
                }

                /* Right Panel */
                .auth-form-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: var(--bg-light);
                }

                .auth-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    width: 100%;
                    max-width: 420px;
                    overflow: hidden;
                    animation: slideUp 0.6s ease-out;
                }

                .card-header {
                    text-align: center;
                    padding: 2rem 2rem 1rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .card-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .card-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin: 0;
                }

                .card-body {
                    padding: 0 2rem 2rem 2rem;
                }

                 {
                    /* .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                }

                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                } */
                }

                .form-group {
                    margin-bottom: 1.5rem;
                    display: grid;
                    grid-template-rows: auto auto auto; /* label, input, error */
                    gap: 0.5rem;
                }

                .form-label {
                    grid-row: 1;
                    display: block;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    margin-bottom: 0; /* Remove margin since we're using grid gap */
                }

                .input-group {
                    grid-row: 2;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-muted);
                    z-index: 5;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    background: var(--bg-light);
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
                }

                .form-input.is-invalid {
                    border-color: var(--danger-color);
                    background: #fef2f2;
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    z-index: 5;
                }

                .password-toggle:hover {
                    color: var(--text-secondary);
                }

                 {
                    /* .error-message {
                    color: var(--danger-color);
                    font-size: 0.8rem;
                    margin-top: 0.375rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                } */
                }
                .error-message {
                    grid-row: 3;
                    color: var(--danger-color);
                    font-size: 0.8rem;
                    line-height: 1.4;
                    padding-left: 0.25rem;
                    margin: 0; /* Remove margin since we're using grid gap */
                }

                /* Hide error message when there's no error */
                .form-group:not(.has-error) .error-message {
                    display: none;
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 1.25rem 0;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .checkbox-label input {
                    margin-right: 0.5rem;
                }

                .forgot-link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .forgot-link:hover {
                    color: var(--primary-hover);
                    text-decoration: underline;
                }

                .submit-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: linear-gradient(
                        135deg,
                        var(--primary-color) 0%,
                        var(--primary-hover) 100%
                    );
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 25px rgba(74, 144, 226, 0.3);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner {
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid transparent;
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .divider {
                    text-align: center;
                    margin: 1.5rem 0;
                    position: relative;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                .divider::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--border-color);
                }

                .divider span {
                    background: white;
                    padding: 0 1rem;
                    position: relative;
                }

                .register-links {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .register-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    color: var(--text-primary);
                }

                .register-btn:hover {
                    text-decoration: none;
                    transform: translateY(-1px);
                }

                .register-btn.client:hover {
                    border-color: var(--primary-color);
                    background: rgba(74, 144, 226, 0.05);
                    color: var(--primary-color);
                }

                .register-btn.provider:hover {
                    border-color: var(--success-color);
                    background: rgba(16, 185, 129, 0.05);
                    color: var(--success-color);
                }

                .demo-section {
                    background: var(--bg-light);
                    border-top: 1px solid var(--border-color);
                    padding: 1.5rem 2rem;
                }

                .demo-header {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .demo-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .demo-btn {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .demo-btn:hover {
                    border-color: #d1d5db;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .demo-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    flex-shrink: 0;
                }

                .demo-icon.client {
                    background: rgba(74, 144, 226, 0.1);
                    color: var(--primary-color);
                }

                .demo-icon.provider {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--success-color);
                }

                .demo-info {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .demo-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.8rem;
                    margin-bottom: 0.125rem;
                }

                .demo-desc {
                    color: var(--text-secondary);
                    font-size: 0.7rem;
                }

                .alert {
                    padding: 0.875rem;
                    border-radius: 8px;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                }

                .alert-danger {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                }

                .illustration-container {
                    margin-bottom: 3rem;
                }

                .illustration-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    position: relative;
                    min-height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .illustration-image-full {
                    width: 100%;
                    height: 100%;
                    min-height: 250px;
                    object-fit: cover;
                    object-position: center;
                    border-radius: 16px;
                    display: block;
                }

                .illustration-fallback {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    height: 100%;
                    min-height: 250px;
                    opacity: 0.9;
                }

                /* Optional: Text overlay styles */
                .illustration-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(
                        to top,
                        rgba(0, 0, 0, 0.7),
                        transparent
                    );
                    padding: 1.5rem;
                    color: white;
                    text-align: center;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }

                .illustration-card:hover .illustration-overlay {
                    transform: translateY(0);
                }

                .illustration-text h4 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                .illustration-text p {
                    font-size: 0.875rem;
                    opacity: 0.9;
                    margin: 0;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                @media (max-width: 768px) {
                    .illustration-card {
                        min-height: 200px;
                    }

                    .illustration-image-full {
                        min-height: 200px;
                    }

                    .illustration-fallback {
                        min-height: 200px;
                        padding: 1.5rem;
                    }

                    .illustration-overlay {
                        position: relative;
                        transform: none;
                        background: rgba(0, 0, 0, 0.5);
                        padding: 1rem;
                    }
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .auth-form-panel {
                        padding: 1rem;
                    }

                    .auth-card {
                        max-width: none;
                        margin: 0;
                    }

                    .card-header {
                        padding: 1.5rem 1.5rem 1rem 1.5rem;
                    }

                    .card-body {
                        padding: 0 1.5rem 1.5rem 1.5rem;
                    }

                    .demo-section {
                        padding: 1.25rem 1.5rem;
                    }

                    .card-title {
                        font-size: 1.5rem;
                    }

                    .brand-title {
                        font-size: 2.5rem;
                    }
                }

                @media (max-width: 576px) {
                    .register-links {
                        grid-template-columns: 1fr;
                    }

                    .demo-buttons {
                        grid-template-columns: 1fr;
                    }

                    .form-input {
                        padding: 0.75rem 1rem 0.75rem 2.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
