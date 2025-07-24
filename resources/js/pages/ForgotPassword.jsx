import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // 'sending', 'sent', 'error'
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
        
        // Basic validation
        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        try {
            setStatus('sending');
            
            const response = await axios.post('/api/forgot-password', {
                email: email.trim()
            });

            if (response.data.success) {
                setStatus('sent');
                setMessage(response.data.message || 'Password reset email sent! Please check your inbox.');
            } else {
                setStatus('error');
                setMessage(response.data.message || 'Failed to send password reset email.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setStatus('error');
            
            if (error.response?.data) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setMessage(error.response.data.message || 'Failed to send password reset email.');
                }
            } else {
                setMessage('Network error. Please check your connection and try again.');
            }
        }
    };

    const handleTryAgain = () => {
        setStatus('');
        setMessage('');
        setErrors({});
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
                                            <i className="fas fa-lock" style={{ fontSize: '1.5rem', display: 'none' }}></i>
                                        </div>
                                    </div>
                                    <h2 className="fw-bold text-dark">Forgot Password?</h2>
                                    <p className="text-muted">
                                        Enter your email address and we'll send you a link to reset your password
                                    </p>
                                </div>

                                {/* Content based on status */}
                                {status === 'sent' ? (
                                    // Success state
                                    <div className="text-center">
                                        <div className="success-icon mb-4">
                                            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h4 className="text-success mb-3">Email Sent!</h4>
                                        <div className="alert alert-success" role="alert">
                                            <i className="fas fa-envelope me-2"></i>
                                            {message}
                                        </div>
                                        <p className="text-muted mb-4">
                                            Please check your email inbox and spam folder for the password reset link.
                                        </p>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button 
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={handleTryAgain}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Send Another Email
                                            </button>
                                            <Link to="/login" className="btn btn-primary">
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    // Form state
                                    <>
                                        {/* Error message */}
                                        {status === 'error' && message && (
                                            <div className="alert alert-danger" role="alert">
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                {message}
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label htmlFor="email" className="form-label fw-semibold">
                                                    Email Address
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <i className="fas fa-envelope text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                                                        placeholder="Enter your email address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={status === 'sending'}
                                                        autoFocus
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <div className="invalid-feedback d-block">
                                                        <i className="fas fa-exclamation-circle me-1"></i>
                                                        {errors.email}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100 mb-3"
                                                disabled={status === 'sending' || !email.trim()}
                                            >
                                                {status === 'sending' ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Sending Email...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane me-2"></i>
                                                        Send Reset Link
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}

                                {/* Footer */}
                                <div className="text-center pt-3 border-top">
                                    <p className="text-muted mb-0">
                                        Remember your password? <Link to="/login" className="text-decoration-none">Sign In</Link>
                                    </p>
                                    <p className="text-muted small mt-2 mb-0">
                                        Don't have an account? <Link to="/register" className="text-decoration-none">Sign Up</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .success-icon {
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
                    padding-left: 0.5rem;
                }

                .form-control:focus {
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .input-group:focus-within .input-group-text {
                    border-color: #86b7fe;
                    background-color: #f8f9fa;
                }

                .input-group:focus-within .form-control {
                    border-color: #86b7fe;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;