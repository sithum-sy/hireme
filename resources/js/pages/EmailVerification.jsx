import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link. Please check your email or request a new verification link.');
            return;
        }

        verifyEmail();
    }, [token, email]);

    const verifyEmail = async () => {
        try {
            setStatus('verifying');
            
            const response = await axios.post('/api/verify-email', {
                token: token,
                email: email
            });

            if (response.data.success) {
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Email verified successfully! You can now log in.',
                            type: 'success'
                        }
                    });
                }, 3000);
            } else {
                handleVerificationError(response.data);
            }
        } catch (error) {
            console.error('Email verification error:', error);
            
            if (error.response?.data) {
                handleVerificationError(error.response.data);
            } else {
                setStatus('error');
                setMessage('Network error. Please check your connection and try again.');
            }
        }
    };

    const handleVerificationError = (errorData) => {
        const { error_code, message, data } = errorData;
        
        switch (error_code) {
            case 'TOKEN_EXPIRED':
                setStatus('expired');
                setMessage(message || 'Verification link has expired.');
                setCanResend(data?.can_resend || false);
                setUserEmail(data?.email || email);
                break;
            case 'INVALID_TOKEN':
                setStatus('error');
                setMessage(message || 'Invalid verification link.');
                break;
            case 'ALREADY_VERIFIED':
                setStatus('success');
                setMessage(message || 'Email is already verified.');
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Your email is already verified. You can log in now.',
                            type: 'success'
                        }
                    });
                }, 2000);
                break;
            default:
                setStatus('error');
                setMessage(message || 'Email verification failed.');
        }
    };

    const handleResendVerification = async () => {
        try {
            setIsResending(true);
            
            const response = await axios.post('/api/resend-verification', {
                email: userEmail || email
            });

            if (response.data.success) {
                setStatus('success');
                setMessage('Verification email sent! Please check your inbox and spam folder.');
                setCanResend(false);
            } else {
                setMessage(response.data.message || 'Failed to resend verification email.');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            setMessage('Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="text-center">
                        <div className="verification-spinner mb-4">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <h3 className="mb-3">Verifying your email...</h3>
                        <p className="text-muted">Please wait while we verify your email address.</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div className="success-icon mb-4">
                            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="text-success mb-3">Email Verified!</h3>
                        <p className="mb-4">{message}</p>
                        {status === 'success' && !message.includes('already verified') && (
                            <p className="text-muted small">Redirecting to login page in 3 seconds...</p>
                        )}
                    </div>
                );

            case 'expired':
                return (
                    <div className="text-center">
                        <div className="warning-icon mb-4">
                            <i className="fas fa-clock text-warning" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="text-warning mb-3">Link Expired</h3>
                        <p className="mb-4">{message}</p>
                        {canResend && (
                            <button 
                                className="btn btn-primary"
                                onClick={handleResendVerification}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-envelope me-2"></i>
                                        Send New Verification Email
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                );

            case 'error':
            default:
                return (
                    <div className="text-center">
                        <div className="error-icon mb-4">
                            <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="text-danger mb-3">Verification Failed</h3>
                        <p className="mb-4">{message}</p>
                        <div className="d-flex gap-2 justify-content-center">
                            <Link to="/login" className="btn btn-outline-primary">
                                <i className="fas fa-sign-in-alt me-2"></i>
                                Go to Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                <i className="fas fa-user-plus me-2"></i>
                                Register Again
                            </Link>
                        </div>
                    </div>
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
                                            <i className="fas fa-handshake" style={{ fontSize: '1.5rem', display: 'none' }}></i>
                                        </div>
                                    </div>
                                    <h2 className="fw-bold text-dark">Email Verification</h2>
                                </div>

                                {/* Content */}
                                {renderContent()}

                                {/* Footer */}
                                <div className="text-center mt-4 pt-3 border-top">
                                    <p className="text-muted small mb-0">
                                        Need help? <Link to="/contact" className="text-decoration-none">Contact Support</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .verification-spinner .spinner-border {
                    border-width: 3px;
                }
                
                .success-icon, .error-icon, .warning-icon {
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

export default EmailVerification;