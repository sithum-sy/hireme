// components/landingPage/CTASection.jsx
import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
    const clientBenefits = [
        "Find verified professionals instantly",
        "Location-based matching",
        "Secure payment protection",
        "Real-time appointment scheduling",
        "Transparent pricing",
        "24/7 customer support",
    ];

    const providerBenefits = [
        "Reach more customers",
        "Flexible working schedule",
        "Guaranteed secure payments",
        "Professional verification",
        "Marketing support",
        "Growth analytics",
    ];

    const serviceCategories = [
        { name: "Electrical Work", icon: "fas fa-bolt", popular: true },
        { name: "Tutoring", icon: "fas fa-graduation-cap", popular: true },
        { name: "Home Cleaning", icon: "fas fa-broom", popular: true },
        { name: "Caregiving", icon: "fas fa-heart", popular: true },
        { name: "Plumbing", icon: "fas fa-wrench", popular: false },
        { name: "Computer Repair", icon: "fas fa-laptop", popular: false },
        { name: "Gardening", icon: "fas fa-leaf", popular: false },
        { name: "Beauty Services", icon: "fas fa-cut", popular: false },
    ];

    return (
        <section className="cta-section" id="about">
            <div className="container-custom">
                {/* Main CTA */}
                <div className="main-cta gradient-section">
                    <div className="cta-content">
                        <div className="cta-header">
                            <h2 className="cta-title">Ready to Get Started?</h2>
                            <p className="cta-subtitle">
                                Join thousands of satisfied users across Sri
                                Lanka. Whether you need a service or want to
                                offer your skills, HireMe is your perfect
                                platform.
                            </p>
                        </div>

                        {/* Two-path CTA */}
                        <div className="cta-paths">
                            <div className="cta-path client-path">
                                <div className="path-header">
                                    <div className="path-icon client-icon">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <h3 className="path-title">
                                        I Need a Service
                                    </h3>
                                    <p className="path-description">
                                        Find trusted professionals for any
                                        service you need
                                    </p>
                                </div>

                                <ul className="path-benefits">
                                    {clientBenefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>

                                <div className="path-actions">
                                    <Link
                                        to="/register?role=client"
                                        className="btn-primary-large"
                                    >
                                        <i className="fas fa-user"></i>
                                        <span>Sign Up as Client</span>
                                    </Link>
                                    <Link
                                        to="/client/services"
                                        className="btn-secondary-outline"
                                    >
                                        <i className="fas fa-search"></i>
                                        <span>Browse Services</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="cta-path provider-path">
                                <div className="path-header">
                                    <div className="path-icon provider-icon">
                                        <i className="fas fa-briefcase"></i>
                                    </div>
                                    <h3 className="path-title">
                                        I Provide Services
                                    </h3>
                                    <p className="path-description">
                                        Grow your business and connect with new
                                        clients
                                    </p>
                                </div>

                                <ul className="path-benefits">
                                    {providerBenefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>

                                <div className="path-actions">
                                    <Link
                                        to="/register?role=service_provider"
                                        className="btn-primary-large"
                                    >
                                        <i className="fas fa-user-tie"></i>
                                        <span>Become a Provider</span>
                                    </Link>
                                    <Link
                                        to="/provider-info"
                                        className="btn-secondary-outline"
                                    >
                                        <i className="fas fa-info-circle"></i>
                                        <span>Learn More</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="cta-trust">
                            <div className="trust-item">
                                <i className="fas fa-check-circle"></i>
                                <span>100% Free to join</span>
                            </div>
                            <div className="trust-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Secure & verified platform</span>
                            </div>
                            <div className="trust-item">
                                <i className="fas fa-headset"></i>
                                <span>24/7 customer support</span>
                            </div>
                            <div className="trust-item">
                                <i className="fas fa-star"></i>
                                <span>4.9/5 user satisfaction</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Categories Preview */}
                <div className="categories-preview">
                    <div className="categories-header">
                        <h3>Popular Service Categories</h3>
                        <p>
                            Discover the most in-demand services on our platform
                        </p>
                    </div>

                    <div className="categories-grid">
                        {serviceCategories.map((category, index) => (
                            <Link
                                key={index}
                                to={`/client/services?category=${category.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                                className="category-card"
                            >
                                <div className="category-icon">
                                    <i className={category.icon}></i>
                                </div>
                                <span className="category-name">
                                    {category.name}
                                </span>
                                {category.popular && (
                                    <div className="popular-badge">Popular</div>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="categories-footer">
                        <Link to="/client/services" className="view-all-categories">
                            <span>View All Service Categories</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="final-cta">
                    <div className="final-cta-content">
                        <h3>
                            Don't Wait - Your Perfect Service Match is Just a
                            Click Away!
                        </h3>
                        <p>
                            Join the HireMe community today and experience the
                            future of service marketplace.
                        </p>
                        <div className="final-cta-actions">
                            <Link to="/register" className="btn-primary-large">
                                <i className="fas fa-rocket"></i>
                                <span>Get Started Now</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="contact-section" id="contact">
                    <div className="contact-content">
                        <h3>Need Help? We're Here for You</h3>
                        <p>
                            Have questions or need assistance? Our support team is ready to help you 24/7.
                        </p>
                        <div className="contact-methods">
                            <div className="contact-method">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <h4>Email Support</h4>
                                    <p>support@hireme.lk</p>
                                </div>
                            </div>
                            <div className="contact-method">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <h4>Phone Support</h4>
                                    <p>+94 11 234 5678</p>
                                </div>
                            </div>
                            <div className="contact-method">
                                <i className="fas fa-comments"></i>
                                <div>
                                    <h4>Live Chat</h4>
                                    <p>Available 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
