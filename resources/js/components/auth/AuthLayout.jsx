// components/auth/AuthLayout.jsx (Updated)
import React from "react";

const AuthLayout = ({ children, showBranding = true }) => {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                {/* Left Branding Panel */}
                {showBranding && (
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
                                            document
                                                .querySelector(
                                                    ".illustration-fallback"
                                                )
                                                ?.style.setProperty(
                                                    "display",
                                                    "flex"
                                                );
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
                )}

                {/* Right Panel */}
                <div
                    className={`auth-form-panel ${
                        !showBranding ? "full-width" : ""
                    }`}
                >
                    {children}
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                .auth-layout {
                    min-height: 100vh;
                    background: ${showBranding
                        ? "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)"
                        : "#f8fafc"};
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
                        #4a90e2 0%,
                        #357abd 100%
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

                /* Right Panel */
                .auth-form-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: ${showBranding ? "white" : "#f8fafc"};
                }

                .auth-form-panel.full-width {
                    width: 100%;
                    padding: 2rem;
                    background: var(--bg-light);
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

                    .auth-form-panel {
                        padding: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .brand-title {
                        font-size: 2.25rem;
                    }

                    .brand-subtitle {
                        font-size: 1rem;
                    }

                    .auth-form-panel {
                        padding: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthLayout;
