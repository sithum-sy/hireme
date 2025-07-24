import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ResetPassword from './ResetPassword';

const TokenValidation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [validationStatus, setValidationStatus] = useState('validating'); // 'validating', 'valid', 'invalid', 'expired'
    const [message, setMessage] = useState('');
    const [validatedToken, setValidatedToken] = useState(null);
    const [validatedEmail, setValidatedEmail] = useState(null);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setValidationStatus('invalid');
            setMessage('Invalid reset link. Please request a new password reset.');
            return;
        }

        validateToken();
    }, [token, email]);

    const validateToken = async () => {
        try {
            setValidationStatus('validating');
            
            const response = await axios.post('/api/validate-reset-token', {
                token: token,
                email: email
            });

            if (response.data.success) {
                setValidationStatus('valid');
                setValidatedToken(token);
                setValidatedEmail(email);
                
                // Clear the URL parameters for security
                navigate('/reset-password', { replace: true });
            } else {
                const { error_code, message } = response.data;
                
                if (error_code === 'TOKEN_EXPIRED') {
                    setValidationStatus('expired');
                } else {
                    setValidationStatus('invalid');
                }
                
                setMessage(message || 'Invalid or expired reset token.');
            }
        } catch (error) {
            console.error('Token validation error:', error);
            
            if (error.response?.data) {
                const { error_code, message } = error.response.data;
                
                if (error_code === 'TOKEN_EXPIRED') {
                    setValidationStatus('expired');
                    setMessage(message || 'Reset token has expired.');
                } else if (error_code === 'INVALID_TOKEN') {
                    setValidationStatus('invalid');
                    setMessage(message || 'Invalid reset token.');
                } else {
                    setValidationStatus('invalid');
                    setMessage(message || 'Token validation failed.');
                }
            } else {
                setValidationStatus('invalid');
                setMessage('Network error. Please check your connection and try again.');
            }
        }
    };

    // If token is valid, render the ResetPassword component with validated credentials
    if (validationStatus === 'valid' && validatedToken && validatedEmail) {
        return <ResetPassword 
            preValidatedToken={validatedToken} 
            preValidatedEmail={validatedEmail} 
        />;
    }

    // Otherwise render validation states
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
                                            <i className="fas fa-shield-alt" style={{ fontSize: '1.5rem', display: 'none' }}></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Content based on validation status */}
                                {validationStatus === 'validating' && (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                        <h4 className="mb-3">Validating Reset Link</h4>
                                        <p className="text-muted">
                                            Please wait while we verify your password reset request...
                                        </p>
                                    </div>
                                )}

                                {validationStatus === 'expired' && (
                                    <div className="text-center">
                                        <div className="warning-icon mb-4">
                                            <i className="fas fa-clock text-warning" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h4 className="text-warning mb-3">Link Expired</h4>
                                        <div className="alert alert-warning" role="alert">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {message}
                                        </div>
                                        <p className="text-muted mb-4">
                                            Password reset links expire after 60 minutes for security reasons.
                                        </p>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <a href="/forgot-password" className="btn btn-primary">
                                                <i className="fas fa-envelope me-2"></i>
                                                Request New Reset Link
                                            </a>
                                            <a href="/login" className="btn btn-outline-primary">
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Back to Login
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {(validationStatus === 'invalid') && (
                                    <div className="text-center">
                                        <div className="error-icon mb-4">
                                            <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h4 className="text-danger mb-3">Invalid Reset Link</h4>
                                        <div className="alert alert-danger" role="alert">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {message}
                                        </div>
                                        <p className="text-muted mb-4">
                                            This reset link is invalid or has already been used.
                                        </p>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <a href="/forgot-password" className="btn btn-primary">
                                                <i className="fas fa-envelope me-2"></i>
                                                Request New Reset Link
                                            </a>
                                            <a href="/login" className="btn btn-outline-primary">
                                                <i className="fas fa-sign-in-alt me-2"></i>
                                                Back to Login
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="text-center pt-3 border-top mt-4">
                                    <p className="text-muted small mb-0">
                                        Need help? <a href="/contact" className="text-decoration-none">Contact Support</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .warning-icon, .error-icon {
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
            `}</style>
        </div>
    );
};

export default TokenValidation;