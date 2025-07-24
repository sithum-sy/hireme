import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [status, setStatus] = useState('form'); // 'form', 'resetting', 'success', 'error'
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [redirectTimer, setRedirectTimer] = useState(null);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid reset link. Please request a new password reset.');
        }
    }, [token, email]);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (redirectTimer) {
                clearInterval(redirectTimer);
            }
        };
    }, [redirectTimer]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear field-specific errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Please confirm your password';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            setStatus('resetting');

            const response = await axios.post('/api/reset-password', {
                token: token,
                email: email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });

            if (response.data.success) {
                setStatus('success');
                setMessage(response.data.message || 'Password reset successful!');
                
                // Refresh CSRF token after password reset (async but don't wait)
                if (window.refreshCSRFToken) {
                    window.refreshCSRFToken().catch(console.error);
                }
                
                // Start countdown and redirect to login after 5 seconds
                setCountdown(5);
                const countdownInterval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval);
                            setRedirectTimer(null);
                            navigate('/login', {
                                state: {
                                    message: 'Password reset successful! You can now log in with your new password.',
                                    type: 'success'
                                }
                            });
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                
                // Store the interval so we can clear it if needed
                setRedirectTimer(countdownInterval);
            } else {
                setStatus('error');
                setMessage(response.data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setStatus('form'); // Return to form on error
            
            if (error.response?.data) {
                const { error_code, message, errors: fieldErrors } = error.response.data;
                
                if (fieldErrors) {
                    setErrors(fieldErrors);
                } else {
                    if (error_code === 'TOKEN_EXPIRED') {
                        setStatus('error');
                        setMessage(message || 'Reset link has expired.');
                    } else if (error_code === 'INVALID_TOKEN') {
                        setStatus('error');
                        setMessage(message || 'Invalid reset link.');
                    } else {
                        setMessage(message || 'Failed to reset password.');
                    }
                }
            } else {
                setMessage('Network error. Please check your connection and try again.');
            }
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="text-center">
                        <div className="success-icon mb-4">
                            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="text-success mb-3">Password Reset Successful!</h4>
                        <div className="alert alert-success" role="alert">
                            <i className="fas fa-check me-2"></i>
                            {message}
                        </div>
                        {countdown !== null && countdown > 0 ? (
                            <p className="text-muted mb-4">
                                Redirecting to login page in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...
                            </p>
                        ) : (
                            <p className="text-muted mb-4">
                                Redirecting to login page...
                            </p>
                        )}
                        <Link to="/login" className="btn btn-primary">
                            <i className="fas fa-sign-in-alt me-2"></i>
                            Go to Login Now
                        </Link>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="error-icon mb-4">
                            <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="text-danger mb-3">Reset Failed</h4>
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {message}
                        </div>
                        <div className="d-flex gap-2 justify-content-center">
                            <Link to="/forgot-password" className="btn btn-outline-primary">
                                <i className="fas fa-arrow-left me-2"></i>
                                Request New Reset
                            </Link>
                            <Link to="/login" className="btn btn-primary">
                                <i className="fas fa-sign-in-alt me-2"></i>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                );

            case 'form':
            default:
                return (
                    <>
                        {message && (
                            <div className="alert alert-danger" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Password Field */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label fw-semibold">
                                    New Password
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fas fa-lock text-muted"></i>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                                        placeholder="Enter your new password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={status === 'resetting'}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary border-start-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={status === 'resetting'}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="invalid-feedback d-block">
                                        <i className="fas fa-exclamation-circle me-1"></i>
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div className="mb-4">
                                <label htmlFor="password_confirmation" className="form-label fw-semibold">
                                    Confirm New Password
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fas fa-lock text-muted"></i>
                                    </span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className={`form-control border-start-0 border-end-0 ${errors.password_confirmation ? 'is-invalid' : ''}`}
                                        placeholder="Confirm your new password"
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        disabled={status === 'resetting'}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary border-start-0"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={status === 'resetting'}
                                    >
                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <div className="invalid-feedback d-block">
                                        <i className="fas fa-exclamation-circle me-1"></i>
                                        {errors.password_confirmation}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mb-3"
                                disabled={status === 'resetting'}
                            >
                                {status === 'resetting' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                );
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="logo-section mb-3">
                                        <div className="logo-icon mx-auto" style={{ 
                                            width: '60px', 
                                            height: '60px',
                                            background: 'var(--primary-color, #0d6efd)', 
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                                        }}>
                                            <img
                                                src="/images/hireme-logo.png"
                                                alt="HireMe"
                                                style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <i className="fas fa-key" style={{ fontSize: '1.5rem', display: 'none' }}></i>
                                        </div>
                                    </div>
                                    <h2 className="fw-bold text-dark">Reset Password</h2>
                                    <p className="text-muted">
                                        Enter your new password below
                                    </p>
                                </div>

                                {/* Content */}
                                {renderContent()}

                                {/* Footer */}
                                <div className="text-center pt-3 border-top">
                                    <p className="text-muted small mb-0">
                                        Remember your password? <Link to="/login" className="text-decoration-none">Sign In</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .success-icon, .error-icon {
                    animation: fadeInScale 0.5s ease-out;
                }
                
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .card {
                    border-radius: 16px !important;
                    animation: fadeInUp 0.6s ease-out;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .input-group-text {
                    border-right: none !important;
                }

                .form-control {
                    border-left: none !important;
                    border-right: none !important;
                }

                .form-control:focus {
                    box-shadow: none;
                }

                .input-group:focus-within .input-group-text {
                    border-color: #86b7fe;
                    background-color: #f8f9fa;
                }

                .input-group:focus-within .form-control {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .input-group:focus-within .btn-outline-secondary {
                    border-color: #86b7fe;
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;