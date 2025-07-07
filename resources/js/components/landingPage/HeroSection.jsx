import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
    const handleScroll = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <section className="hero-section position-relative overflow-hidden">
            {/* Background Elements */}
            <div className="hero-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="container position-relative">
                <div className="row min-vh-100 align-items-center py-5">
                    <div className="col-lg-6 order-2 order-lg-1">
                        <div className="hero-content">
                            <h1 className="hero-title display-4 fw-bold mb-4">
                                Connect with
                                <span className="text-gradient">
                                    {" "}
                                    Trusted Professionals
                                </span>
                            </h1>
                            <p className="hero-subtitle lead mb-4">
                                Find skilled caregivers, tutors, plumbers, and
                                more. Book appointments instantly and track your
                                service provider in real-time.
                            </p>

                            <div className="hero-cta-buttons d-flex flex-column flex-sm-row gap-3 mb-5">
                                <Link
                                    to="/register?role=client"
                                    className="btn btn-primary btn-lg px-4 py-3"
                                >
                                    <i className="fas fa-search me-2"></i>
                                    Find Services
                                </Link>
                                <Link
                                    to="/register?role=service_provider"
                                    className="btn btn-outline-light btn-lg px-4 py-3"
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    Become a Provider
                                </Link>
                            </div>

                            <div className="hero-features d-flex flex-wrap gap-4">
                                <div className="feature-item d-flex align-items-center">
                                    <i className="fas fa-shield-alt text-success me-2"></i>
                                    <span className="small">
                                        Verified Providers
                                    </span>
                                </div>
                                <div className="feature-item d-flex align-items-center">
                                    <i className="fas fa-map-marker-alt text-info me-2"></i>
                                    <span className="small">
                                        Real-time Tracking
                                    </span>
                                </div>
                                <div className="feature-item d-flex align-items-center">
                                    <i className="fas fa-clock text-warning me-2"></i>
                                    <span className="small">24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 order-1 order-lg-2">
                        <div className="hero-visual position-relative">
                            <div className="phone-mockup">
                                <div className="phone-screen">
                                    <div className="app-interface">
                                        <div className="app-header">
                                            <div className="app-title">
                                                HireMe
                                            </div>
                                            <div className="notification-icon">
                                                <i className="fas fa-bell"></i>
                                            </div>
                                        </div>
                                        <div className="map-preview">
                                            <div className="map-marker">
                                                <i className="fas fa-map-marker-alt"></i>
                                            </div>
                                            <div className="provider-card">
                                                <div className="provider-avatar"></div>
                                                <div className="provider-info">
                                                    <div className="provider-name">
                                                        John Smith
                                                    </div>
                                                    <div className="provider-service">
                                                        Plumber
                                                    </div>
                                                    <div className="provider-eta">
                                                        ETA: 15 min
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="floating-card card-1">
                                <i className="fas fa-star text-warning"></i>
                                <span>4.9 Rating</span>
                            </div>
                            <div className="floating-card card-2">
                                <i className="fas fa-users text-primary"></i>
                                <span>1000+ Providers</span>
                            </div>
                            <div className="floating-card card-3">
                                <i className="fas fa-clock text-success"></i>
                                <span>Quick Response</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div className="scroll-indicator position-absolute bottom-0 start-50 translate-middle-x mb-4">
                    <button
                        className="btn btn-link text-white p-0"
                        onClick={() => handleScroll("services")}
                    >
                        <div className="scroll-mouse">
                            <div className="scroll-wheel"></div>
                        </div>
                        <div className="small mt-2">Scroll to explore</div>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
