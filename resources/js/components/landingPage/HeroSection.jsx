// components/landing/HeroSection.jsx
import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <section className="hero-section">
            <div className="container">
                <div className="row min-vh-100 align-items-center py-5">
                    <div className="col-lg-6 order-2 order-lg-1">
                        <div className="hero-content">
                            {/* Trust Badge */}
                            <div className="trust-badge">
                                <div className="badge-content">
                                    <i className="fas fa-star text-warning me-1"></i>
                                    <span>4.9 rating</span>
                                    <span className="separator">•</span>
                                    <span>10,000+ happy customers</span>
                                </div>
                            </div>

                            {/* Main Headline */}
                            <h1 className="hero-title">
                                Find trusted
                                <span className="text-primary">
                                    {" "}
                                    professionals
                                </span>
                                <br />
                                for every need
                            </h1>

                            {/* Subtitle */}
                            <p className="hero-subtitle">
                                Connect with verified service providers in your
                                area. From home repairs to personal care, book
                                appointments instantly and track your service in
                                real-time.
                            </p>

                            {/* CTA Buttons */}
                            <div className="hero-actions">
                                <Link
                                    to="/register?role=client"
                                    className="btn btn-primary btn-cta"
                                >
                                    <i className="fas fa-search me-2"></i>
                                    Find Services
                                </Link>
                                <Link
                                    to="/register?role=service_provider"
                                    className="btn btn-outline-primary btn-cta"
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    Become a Provider
                                </Link>
                            </div>

                            {/* Features List */}
                            <div className="hero-features">
                                <div className="feature-item">
                                    <i className="fas fa-shield-check"></i>
                                    <span>Verified providers</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fas fa-clock"></i>
                                    <span>Instant booking</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fas fa-headset"></i>
                                    <span>24/7 support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 order-1 order-lg-2">
                        <div className="hero-visual">
                            <div className="hero-image-container">
                                <div className="hero-image">
                                    <img
                                        src="/images/hero-professional.jpg"
                                        alt="Professional services"
                                        className="main-image"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />
                                    <div
                                        className="image-fallback"
                                        style={{ display: "none" }}
                                    >
                                        <i className="fas fa-users fa-4x"></i>
                                        <h4>Professional Services</h4>
                                        <p>
                                            Connecting you with trusted
                                            providers
                                        </p>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <div className="floating-card card-1">
                                    <div className="card-icon">
                                        <i className="fas fa-map-marker-alt text-primary"></i>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title">
                                            Live Tracking
                                        </div>
                                        <div className="card-subtitle">
                                            Real-time updates
                                        </div>
                                    </div>
                                </div>

                                <div className="floating-card card-2">
                                    <div className="card-icon">
                                        <i className="fas fa-thumbs-up text-success"></i>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title">
                                            Quality Service
                                        </div>
                                        <div className="card-subtitle">
                                            Guaranteed satisfaction
                                        </div>
                                    </div>
                                </div>

                                <div className="floating-card card-3">
                                    <div className="card-icon">
                                        <i className="fas fa-bolt text-warning"></i>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title">
                                            Quick Response
                                        </div>
                                        <div className="card-subtitle">
                                            15 min average
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator">
                    <button
                        className="scroll-btn"
                        onClick={() => scrollToSection("services")}
                        aria-label="Scroll to services section"
                    >
                        <i className="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .hero-section {
                    background: linear-gradient(
                        135deg,
                        #f8fafc 0%,
                        #e8f2ff 100%
                    );
                    position: relative;
                    overflow: hidden;
                    padding-top: 80px;
                }

                .hero-section::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                            circle at 20% 80%,
                            rgba(74, 144, 226, 0.1) 0%,
                            transparent 50%
                        ),
                        radial-gradient(
                            circle at 80% 20%,
                            rgba(74, 144, 226, 0.05) 0%,
                            transparent 50%
                        );
                    pointer-events: none;
                }

                .container {
                    position: relative;
                    z-index: 1;
                }

                .trust-badge {
                    margin-bottom: 2rem;
                }

                .badge-content {
                    display: inline-flex;
                    align-items: center;
                    background: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #6b7280;
                    gap: 0.5rem;
                }

                .separator {
                    color: #d1d5db;
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 700;
                    line-height: 1.1;
                    color: #1a202c;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.02em;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    line-height: 1.6;
                    color: #6b7280;
                    margin-bottom: 2.5rem;
                    max-width: 90%;
                }

                .hero-actions {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 3rem;
                    flex-wrap: wrap;
                }

                .btn-cta {
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    min-width: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-primary.btn-cta {
                    background: #4a90e2;
                    border: none;
                    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
                }

                .btn-primary.btn-cta:hover {
                    background: #357abd;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(74, 144, 226, 0.4);
                }

                .btn-outline-primary.btn-cta {
                    border: 2px solid #4a90e2;
                    color: #4a90e2;
                    background: white;
                }

                .btn-outline-primary.btn-cta:hover {
                    background: #4a90e2;
                    border-color: #4a90e2;
                    color: white;
                    transform: translateY(-2px);
                }

                .hero-features {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .feature-item i {
                    color: #4a90e2;
                    font-size: 1.1rem;
                }

                /* Hero Visual */
                .hero-visual {
                    position: relative;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .hero-image-container {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                }

                .hero-image {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    background: white;
                    aspect-ratio: 4/3;
                }

                .main-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .image-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #6b7280;
                    padding: 2rem;
                    background: linear-gradient(
                        135deg,
                        #f8fafc 0%,
                        #e8f2ff 100%
                    );
                }

                .image-fallback h4 {
                    margin: 1rem 0 0.5rem 0;
                    color: #1a202c;
                }

                .image-fallback p {
                    margin: 0;
                    font-size: 0.95rem;
                }

                /* Floating Cards */
                .floating-card {
                    position: absolute;
                    background: white;
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    animation: float 6s ease-in-out infinite;
                    z-index: 2;
                }

                .card-1 {
                    top: 10%;
                    right: -10%;
                    animation-delay: 0s;
                }

                .card-2 {
                    bottom: 30%;
                    left: -15%;
                    animation-delay: 2s;
                }

                .card-3 {
                    top: 60%;
                    right: -5%;
                    animation-delay: 4s;
                }

                .card-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    flex-shrink: 0;
                }

                .card-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.25rem;
                }

                .card-subtitle {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                /* Scroll Indicator */
                .scroll-indicator {
                    position: absolute;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .scroll-btn {
                    background: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    color: #4a90e2;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    animation: bounce 2s infinite;
                }

                .scroll-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                /* Animations */
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes bounce {
                    0%,
                    20%,
                    50%,
                    80%,
                    100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .hero-title {
                        font-size: 2.75rem;
                    }

                    .hero-subtitle {
                        font-size: 1.125rem;
                    }

                    .hero-actions {
                        justify-content: center;
                    }

                    .hero-features {
                        justify-content: center;
                    }

                    .floating-card {
                        display: none;
                    }
                }

                @media (max-width: 767.98px) {
                    .hero-section {
                        padding-top: 60px;
                    }

                    .hero-title {
                        font-size: 2.25rem;
                        text-align: center;
                    }

                    .hero-subtitle {
                        text-align: center;
                        max-width: 100%;
                    }

                    .hero-actions {
                        flex-direction: column;
                        align-items: center;
                    }

                    .btn-cta {
                        width: 100%;
                        max-width: 280px;
                    }

                    .hero-features {
                        flex-direction: column;
                        align-items: center;
                        gap: 1rem;
                    }

                    .trust-badge {
                        text-align: center;
                    }

                    .hero-image-container {
                        margin-top: 2rem;
                    }
                }

                @media (max-width: 575.98px) {
                    .hero-title {
                        font-size: 2rem;
                    }

                    .badge-content {
                        padding: 0.5rem 1rem;
                        font-size: 0.8rem;
                    }

                    .scroll-indicator {
                        display: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default HeroSection;
