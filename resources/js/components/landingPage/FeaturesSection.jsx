// components/landingPage/FeaturesSection.jsx
import React from "react";
import { Link } from "react-router-dom";

const FeaturesSection = () => {
    const features = [
        {
            id: "location-based",
            title: "Location-Based Matching",
            description:
                "Find service providers in your exact area using our advanced geolocation system. Get help from professionals who are nearby and available.",
            icon: "fas fa-map-marker-alt",
            color: "primary",
            benefits: [
                "Real-time location tracking",
                "Distance-based filtering",
                "Local provider network",
                "Quick response times",
            ],
        },
        {
            id: "verified-providers",
            title: "Verified Professionals",
            description:
                "All service providers undergo thorough verification including background checks, skill assessments, and document validation.",
            icon: "fas fa-shield-check",
            color: "success",
            benefits: [
                "Background verification",
                "Skill assessments",
                "Document validation",
                "Continuous monitoring",
            ],
        },
        {
            id: "appointment-system",
            title: "Smart Scheduling",
            description:
                "Advanced appointment management with automated reminders, rescheduling options, and real-time availability tracking.",
            icon: "fas fa-calendar-check",
            color: "info",
            benefits: [
                "Automated reminders",
                "Easy rescheduling",
                "Availability tracking",
                "Calendar integration",
            ],
        },
        {
            id: "secure-payments",
            title: "Secure Payments",
            description:
                "Protected payment processing with escrow services, transparent pricing, and automated invoicing for your peace of mind.",
            icon: "fas fa-credit-card",
            color: "warning",
            benefits: [
                "Escrow protection",
                "Multiple payment methods",
                "Transparent pricing",
                "Digital invoices",
            ],
        },
        {
            id: "rating-system",
            title: "Trust & Feedback",
            description:
                "Comprehensive rating system where both clients and providers can review each other, building a trusted community.",
            icon: "fas fa-star",
            color: "danger",
            benefits: [
                "Two-way reviews",
                "Detailed ratings",
                "Trust scores",
                "Community feedback",
            ],
        },
        {
            id: "multi-role",
            title: "Multi-Role Support",
            description:
                "Seamlessly switch between different user roles - client, provider, admin, or staff - all within the same platform.",
            icon: "fas fa-users-cog",
            color: "secondary",
            benefits: [
                "Role-based access",
                "Easy switching",
                "Unified dashboard",
                "Flexible permissions",
            ],
        },
    ];

    const howItWorks = [
        {
            step: "01",
            title: "Search & Discover",
            description:
                "Use our location-based search to find verified service providers in your area.",
            icon: "fas fa-search",
        },
        {
            step: "02",
            title: "Compare & Choose",
            description:
                "Compare profiles, ratings, and pricing to select the perfect professional for your needs.",
            icon: "fas fa-balance-scale",
        },
        {
            step: "03",
            title: "Book & Pay",
            description:
                "Schedule your appointment and make secure payments through our protected platform.",
            icon: "fas fa-handshake",
        },
        {
            step: "04",
            title: "Review & Rate",
            description:
                "Share your experience and help build our trusted community of professionals.",
            icon: "fas fa-thumbs-up",
        },
    ];

    return (
        <section className="section-modern" id="features">
            <div className="container-custom">
                {/* Section Header */}
                <div className="section-header">
                    <div className="section-badge">
                        <span>⚡ Platform Features</span>
                    </div>
                    <h2 className="section-title">
                        Why Choose <span className="text-primary">HireMe</span>?
                    </h2>
                    <p className="section-subtitle">
                        Experience the future of service marketplace with our
                        cutting-edge features designed for both clients and
                        service providers across Sri Lanka.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="features-grid">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="feature-card card-modern"
                        >
                            <div className="feature-header">
                                <div
                                    className={`feature-icon ${feature.color}`}
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

                                <ul className="feature-benefits">
                                    {feature.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* How It Works Section */}
                <div className="how-it-works">
                    <div
                        className="section-header"
                        style={{ marginBottom: "3rem" }}
                    >
                        <h3
                            className="section-title"
                            style={{ fontSize: "2.25rem" }}
                        >
                            How It <span className="text-primary">Works</span>
                        </h3>
                        <p className="section-subtitle">
                            Get started in just four simple steps and connect
                            with trusted professionals today.
                        </p>
                    </div>

                    <div className="steps-container">
                        {howItWorks.map((step, index) => (
                            <div key={index} className="step-item">
                                <div className="step-number">{step.step}</div>
                                <div className="step-content">
                                    <div className="step-icon">
                                        <i className={step.icon}></i>
                                    </div>
                                    <h4 className="step-title">{step.title}</h4>
                                    <p className="step-description">
                                        {step.description}
                                    </p>
                                </div>
                                {index < howItWorks.length - 1 && (
                                    <div className="step-connector"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="features-cta">
                    <div className="cta-content">
                        <h3>Ready to Experience the Difference?</h3>
                        <p>
                            Join thousands of satisfied users who have
                            transformed the way they find and offer services.
                        </p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn-primary-large">
                                <i className="fas fa-rocket"></i>
                                <span>Get Started Now</span>
                            </Link>
                            {/* <Link to="/demo" className="btn-secondary-outline">
                                <i className="fas fa-play-circle"></i>
                                <span>Watch Demo</span>
                            </Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
