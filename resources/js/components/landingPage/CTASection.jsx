// components/landing/CTASection.jsx
import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
    return (
        <section className="cta-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-10 mx-auto">
                        <div className="cta-container">
                            {/* Main CTA */}
                            <div className="cta-content">
                                <h2 className="cta-title">
                                    Ready to Get Started?
                                </h2>
                                <p className="cta-subtitle">
                                    Join thousands of satisfied customers and
                                    professional service providers
                                </p>
                            </div>

                            {/* Two-path CTA */}
                            <div className="cta-paths">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="cta-path">
                                            <div className="path-icon client-icon">
                                                <i className="fas fa-search"></i>
                                            </div>
                                            <h3 className="path-title">
                                                I Need Services
                                            </h3>
                                            <p className="path-description">
                                                Find trusted professionals for
                                                any service you need
                                            </p>
                                            <Link
                                                to="/register?role=client"
                                                className="btn btn-primary btn-lg w-100"
                                            >
                                                <i className="fas fa-user me-2"></i>
                                                Sign Up as Client
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="cta-path">
                                            <div className="path-icon provider-icon">
                                                <i className="fas fa-briefcase"></i>
                                            </div>
                                            <h3 className="path-title">
                                                I Provide Services
                                            </h3>
                                            <p className="path-description">
                                                Grow your business and connect
                                                with new clients
                                            </p>
                                            <Link
                                                to="/register?role=service_provider"
                                                className="btn btn-outline-primary btn-lg w-100"
                                            >
                                                <i className="fas fa-user-tie me-2"></i>
                                                Become a Provider
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="cta-info">
                                <div className="info-items">
                                    <div className="info-item">
                                        <i className="fas fa-check-circle text-success me-2"></i>
                                        <span>Free to join</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-shield-alt text-primary me-2"></i>
                                        <span>Secure & verified</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-headset text-info me-2"></i>
                                        <span>24/7 support</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .cta-section {
                    padding: 6rem 0;
                    background: linear-gradient(
                        135deg,
                        #4a90e2 0%,
                        #357abd 100%
                    );
                    position: relative;
                    overflow: hidden;
                }

                .cta-section::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                            circle at 20% 80%,
                            rgba(255, 255, 255, 0.1) 0%,
                            transparent 50%
                        ),
                        radial-gradient(
                            circle at 80% 20%,
                            rgba(255, 255, 255, 0.05) 0%,
                            transparent 50%
                        );
                    pointer-events: none;
                }

                .cta-container {
                    position: relative;
                    z-index: 1;
                    background: white;
                    border-radius: 24px;
                    padding: 3rem;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                }

                .cta-content {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .cta-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 1rem;
                }

                .cta-subtitle {
                    font-size: 1.25rem;
                    color: #6b7280;
                    margin-bottom: 0;
                }

                .cta-paths {
                    margin-bottom: 3rem;
                }

                .cta-path {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 2rem;
                    text-align: center;
                    height: 100%;
                    border: 2px solid #f1f5f9;
                    transition: all 0.3s ease;
                }

                .cta-path:hover {
                    border-color: #4a90e2;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(74, 144, 226, 0.1);
                }

                .path-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: white;
                    margin: 0 auto 1.5rem;
                }

                .client-icon {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                }

                .provider-icon {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .path-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 1rem;
                }

                .path-description {
                    color: #6b7280;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .btn-lg {
                    padding: 1rem 2rem;
                    font-weight: 600;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }

                .btn-primary.btn-lg {
                    background: #4a90e2;
                    border: none;
                    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
                }

                .btn-primary.btn-lg:hover {
                    background: #357abd;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(74, 144, 226, 0.4);
                }

                .btn-outline-primary.btn-lg {
                    border: 2px solid #4a90e2;
                    color: #4a90e2;
                    background: white;
                }

                .btn-outline-primary.btn-lg:hover {
                    background: #4a90e2;
                    border-color: #4a90e2;
                    color: white;
                    transform: translateY(-2px);
                }

                .cta-info {
                    text-align: center;
                    padding-top: 2rem;
                    border-top: 1px solid #f1f5f9;
                }

                .info-items {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    color: #6b7280;
                    font-weight: 500;
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .cta-section {
                        padding: 4rem 0;
                    }

                    .cta-container {
                        padding: 2rem;
                    }

                    .cta-title {
                        font-size: 2rem;
                    }

                    .cta-content {
                        margin-bottom: 2rem;
                    }

                    .cta-paths {
                        margin-bottom: 2rem;
                    }
                }

                @media (max-width: 767.98px) {
                    .cta-section {
                        padding: 3rem 0;
                    }

                    .cta-container {
                        padding: 1.5rem;
                    }

                    .cta-title {
                        font-size: 1.75rem;
                    }

                    .cta-subtitle {
                        font-size: 1.125rem;
                    }

                    .cta-path {
                        padding: 1.5rem;
                    }

                    .path-icon {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }

                    .path-title {
                        font-size: 1.25rem;
                    }

                    .info-items {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default CTASection;
