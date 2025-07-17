// components/landing/HeroSection.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
    const [activeTab, setActiveTab] = useState("client");
    const [searchQuery, setSearchQuery] = useState("");

    const heroStats = [
        { number: "10,000+", label: "Verified Providers" },
        { number: "50,000+", label: "Services Completed" },
        { number: "25+", label: "Service Categories" },
    ];

    const popularServices = [
        "Electrical Work",
        "Tutoring",
        "Home Cleaning",
        "Caregiving",
        "Computer Repair",
        "Plumbing",
    ];

    return (
        <section className="hero-section gradient-section" id="hero">
            <div className="container-custom">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            <span>🚀 Sri Lanka's #1 Service Platform</span>
                        </div>

                        <h1 className="hero-title">
                            Find{" "}
                            <span className="text-gradient">
                                Skilled Professionals
                            </span>
                            <br />
                            For Every Service Need
                        </h1>

                        <p className="hero-subtitle">
                            Connect with verified service providers across Sri
                            Lanka. From electrical work to tutoring, find
                            trusted professionals in your locality within
                            minutes.
                        </p>

                        {/* Role Toggle */}
                        <div className="role-toggle">
                            <button
                                className={`toggle-btn ${
                                    activeTab === "client" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("client")}
                            >
                                <i className="fas fa-search"></i>
                                Need a Service
                            </button>
                            <button
                                className={`toggle-btn ${
                                    activeTab === "provider" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("provider")}
                            >
                                <i className="fas fa-briefcase"></i>
                                Offer Services
                            </button>
                        </div>

                        {/* Search Bar for Clients */}
                        {activeTab === "client" && (
                            <div className="search-section">
                                <div className="search-bar">
                                    <div className="search-input-group">
                                        <i className="fas fa-search search-icon"></i>
                                        <input
                                            type="text"
                                            placeholder="What service do you need? (e.g., electrician, tutor)"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="search-input"
                                        />
                                        <button className="search-btn">
                                            <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="popular-searches">
                                    <span className="popular-label">
                                        Popular:
                                    </span>
                                    {popularServices
                                        .slice(0, 4)
                                        .map((service, index) => (
                                            <button
                                                key={index}
                                                className="popular-tag"
                                            >
                                                {service}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Provider CTA */}
                        {activeTab === "provider" && (
                            <div className="provider-cta">
                                <div className="provider-benefits">
                                    <div className="benefit-item">
                                        <i className="fas fa-money-bill-wave"></i>
                                        <span>Earn Extra Income</span>
                                    </div>
                                    <div className="benefit-item">
                                        <i className="fas fa-clock"></i>
                                        <span>Flexible Schedule</span>
                                    </div>
                                    <div className="benefit-item">
                                        <i className="fas fa-users"></i>
                                        <span>Build Your Network</span>
                                    </div>
                                </div>

                                <div className="provider-actions">
                                    <Link
                                        to="/register?role=service_provider"
                                        className="btn-primary-large"
                                    >
                                        <i className="fas fa-user-plus"></i>
                                        Start Earning Today
                                    </Link>
                                    <Link
                                        to="/provider-info"
                                        className="btn-secondary-outline"
                                    >
                                        <i className="fas fa-info-circle"></i>
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="hero-actions">
                            <Link to="/register" className="btn-primary-large">
                                <i className="fas fa-rocket"></i>
                                Get Started Free
                            </Link>
                            <Link to="/about" className="btn-secondary-outline">
                                <i className="fas fa-play-circle"></i>
                                Watch Demo
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="trust-indicators">
                            <div className="trust-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Verified Providers</span>
                            </div>
                            <div className="trust-item">
                                <i className="fas fa-star"></i>
                                <span>4.9/5 Rating</span>
                            </div>
                            <div className="trust-item">
                                <i className="fas fa-lock"></i>
                                <span>Secure Payments</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="hero-visual">
                        <div className="hero-image-container">
                            <div className="service-cards">
                                <div className="floating-card card-1">
                                    <div className="card-icon electrician">
                                        <i className="fas fa-bolt"></i>
                                    </div>
                                    <div className="card-content">
                                        <h6>Electrician</h6>
                                        <p>Available Now</p>
                                    </div>
                                    <div className="card-rating">
                                        <i className="fas fa-star"></i>
                                        <span>4.9</span>
                                    </div>
                                </div>

                                <div className="floating-card card-2">
                                    <div className="card-icon tutor">
                                        <i className="fas fa-graduation-cap"></i>
                                    </div>
                                    <div className="card-content">
                                        <h6>Math Tutor</h6>
                                        <p>Online & In-Person</p>
                                    </div>
                                    <div className="card-rating">
                                        <i className="fas fa-star"></i>
                                        <span>5.0</span>
                                    </div>
                                </div>

                                <div className="floating-card card-3">
                                    <div className="card-icon cleaner">
                                        <i className="fas fa-broom"></i>
                                    </div>
                                    <div className="card-content">
                                        <h6>House Cleaning</h6>
                                        <p>Same Day Service</p>
                                    </div>
                                    <div className="card-rating">
                                        <i className="fas fa-star"></i>
                                        <span>4.8</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-phone">
                                <div className="phone-mockup">
                                    <div className="phone-screen">
                                        <div className="app-interface">
                                            <div className="app-header">
                                                <div className="location-badge">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    <span>
                                                        Colombo, Sri Lanka
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="app-content">
                                                <div className="service-category">
                                                    <div className="category-icon">
                                                        <i className="fas fa-tools"></i>
                                                    </div>
                                                    <span>Home Services</span>
                                                </div>
                                                <div className="provider-list">
                                                    <div className="provider-item">
                                                        <div className="provider-avatar"></div>
                                                        <div className="provider-info">
                                                            <h6>Kamal Silva</h6>
                                                            <p>
                                                                Electrician •
                                                                2km away
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="hero-stats stats-grid">
                    {heroStats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <div className="stat-number">{stat.number}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
