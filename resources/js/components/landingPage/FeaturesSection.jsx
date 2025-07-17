// components/landing/FeaturesSection.jsx
import React from "react";

const FeaturesSection = () => {
    const features = [
        {
            icon: "fas fa-shield-check",
            title: "Verified Professionals",
            description:
                "All service providers are background-checked, licensed, and verified for your safety and peace of mind.",
            color: "success",
        },
        {
            icon: "fas fa-clock",
            title: "Instant Booking",
            description:
                "Book appointments in seconds with real-time availability. No waiting, no back-and-forth calls.",
            color: "primary",
        },
        {
            icon: "fas fa-map-marker-alt",
            title: "Real-time Tracking",
            description:
                "Track your service provider in real-time, know exactly when they'll arrive, and stay informed.",
            color: "info",
        },
        {
            icon: "fas fa-credit-card",
            title: "Secure Payments",
            description:
                "Safe, encrypted payments with multiple options. Pay only when you're completely satisfied.",
            color: "warning",
        },
        {
            icon: "fas fa-headset",
            title: "24/7 Support",
            description:
                "Round-the-clock customer support to help you with any questions or issues that may arise.",
            color: "danger",
        },
        {
            icon: "fas fa-star",
            title: "Quality Guarantee",
            description:
                "We stand behind every service with our quality guarantee and comprehensive review system.",
            color: "secondary",
        },
    ];

    return (
        <section className="features-section">
            <div className="container">
                {/* Section Header */}
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center section-header">
                        <h2 className="section-title">Why Choose HireMe?</h2>
                        <p className="section-subtitle">
                            We make finding and booking trusted professionals
                            simple, safe, and reliable
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="row g-4">
                    {features.map((feature, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="feature-card">
                                <div className="feature-icon-container">
                                    <div
                                        className={`feature-icon bg-${feature.color}`}
                                    >
                                        <i className={feature.icon}></i>
                                    </div>
                                </div>

                                <div className="feature-content">
                                    <h3 className="feature-title">
                                        {feature.title}
                                    </h3>
                                    <p className="feature-description">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="row mt-5">
                    <div className="col-lg-8 mx-auto text-center">
                        <div className="features-cta">
                            <h3 className="cta-title">
                                Ready to experience the difference?
                            </h3>
                            <p className="cta-subtitle">
                                Join thousands of satisfied customers who trust
                                HireMe
                            </p>
                            <a
                                href="#services"
                                className="btn btn-primary btn-lg"
                            >
                                <i className="fas fa-rocket me-2"></i>
                                Get Started Today
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .features-section {
                    padding: 6rem 0;
                    background: #f8fafc;
                }

                .section-header {
                    margin-bottom: 4rem;
                }

                .section-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 1rem;
                }

                .section-subtitle {
                    font-size: 1.125rem;
                    color: #6b7280;
                    margin-bottom: 0;
                }

                .feature-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    height: 100%;
                    text-align: center;
                    transition: all 0.3s ease;
                    border: 1px solid #f1f5f9;
                }

                .feature-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                    border-color: #e2e8f0;
                }

                .feature-icon-container {
                    margin-bottom: 1.5rem;
                }

                .feature-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    color: white;
                    margin: 0 auto;
                    position: relative;
                    overflow: hidden;
                }

                .feature-icon::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.2) 0%,
                        transparent 50%
                    );
                }

                .feature-icon.bg-success {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .feature-icon.bg-primary {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                }

                .feature-icon.bg-info {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                }

                .feature-icon.bg-warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .feature-icon.bg-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .feature-icon.bg-secondary {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                }

                .feature-content {
                    text-align: center;
                }

                .feature-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 1rem;
                }

                .feature-description {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 0;
                }

                .features-cta {
                    background: white;
                    border-radius: 20px;
                    padding: 3rem 2rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                }

                .cta-title {
                    font-size: 1.75rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.75rem;
                }

                .cta-subtitle {
                    font-size: 1.125rem;
                    color: #6b7280;
                    margin-bottom: 2rem;
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .features-section {
                        padding: 4rem 0;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .section-header {
                        margin-bottom: 3rem;
                    }
                }

                @media (max-width: 767.98px) {
                    .features-section {
                        padding: 3rem 0;
                    }

                    .feature-card {
                        padding: 1.5rem;
                    }

                    .section-title {
                        font-size: 1.75rem;
                    }

                    .features-cta {
                        padding: 2rem 1rem;
                    }

                    .cta-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default FeaturesSection;
