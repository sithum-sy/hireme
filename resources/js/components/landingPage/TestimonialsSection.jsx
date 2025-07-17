// components/landing/TestimonialsSection.jsx
import React, { useState, useEffect } from "react";

const TestimonialsSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Client",
            service: "Home Cleaning",
            rating: 5,
            comment:
                "Outstanding service! Found a reliable cleaning professional within minutes. The app made booking so easy and the quality exceeded my expectations.",
            avatar: "SJ",
            location: "New York, NY",
            verified: true,
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Service Provider",
            service: "Plumbing",
            rating: 5,
            comment:
                "HireMe transformed my business. Consistent bookings, easy scheduling, and fair pricing. The platform truly supports both providers and clients.",
            avatar: "MC",
            location: "Los Angeles, CA",
            verified: true,
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "Client",
            service: "Tutoring",
            rating: 5,
            comment:
                "Found an amazing math tutor for my daughter. The verification process gave me confidence, and the results have been incredible.",
            avatar: "ER",
            location: "Chicago, IL",
            verified: true,
        },
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoPlaying, testimonials.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={`fas fa-star ${
                    i < rating ? "text-warning" : "text-gray"
                }`}
            ></i>
        ));
    };

    return (
        <section className="testimonials-section">
            <div className="container">
                {/* Section Header */}
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center section-header">
                        <h2 className="section-title">
                            Loved by Our Community
                        </h2>
                        <p className="section-subtitle">
                            Real stories from thousands of satisfied clients and
                            service providers
                        </p>
                    </div>
                </div>

                {/* Testimonials Carousel */}
                <div className="row">
                    <div className="col-lg-10 mx-auto">
                        <div className="testimonials-container">
                            <div className="testimonial-slide">
                                <div className="testimonial-card">
                                    {/* Quote Icon */}
                                    <div className="quote-icon">
                                        <i className="fas fa-quote-left"></i>
                                    </div>

                                    {/* Review Text */}
                                    <blockquote className="testimonial-text">
                                        "{testimonials[currentSlide].comment}"
                                    </blockquote>

                                    {/* Rating */}
                                    <div className="testimonial-rating">
                                        {renderStars(
                                            testimonials[currentSlide].rating
                                        )}
                                    </div>

                                    {/* Author Info */}
                                    <div className="testimonial-author">
                                        <div className="author-avatar">
                                            <span className="avatar-text">
                                                {
                                                    testimonials[currentSlide]
                                                        .avatar
                                                }
                                            </span>
                                            {testimonials[currentSlide]
                                                .verified && (
                                                <div className="verified-badge">
                                                    <i className="fas fa-check"></i>
                                                </div>
                                            )}
                                        </div>

                                        <div className="author-info">
                                            <h4 className="author-name">
                                                {
                                                    testimonials[currentSlide]
                                                        .name
                                                }
                                            </h4>
                                            <div className="author-details">
                                                <span className="author-role">
                                                    {
                                                        testimonials[
                                                            currentSlide
                                                        ].role
                                                    }
                                                </span>
                                                <span className="separator">
                                                    •
                                                </span>
                                                <span className="author-service">
                                                    {
                                                        testimonials[
                                                            currentSlide
                                                        ].service
                                                    }
                                                </span>
                                            </div>
                                            <div className="author-location">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                {
                                                    testimonials[currentSlide]
                                                        .location
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dots Navigation */}
                            <div className="testimonial-dots">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`dot ${
                                            index === currentSlide
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => goToSlide(index)}
                                        aria-label={`Go to testimonial ${
                                            index + 1
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Metrics */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="trust-metrics">
                            <div className="metric">
                                <div className="metric-number">4.9/5</div>
                                <div className="metric-label">
                                    Average Rating
                                </div>
                            </div>
                            <div className="metric-divider"></div>
                            <div className="metric">
                                <div className="metric-number">25,000+</div>
                                <div className="metric-label">Reviews</div>
                            </div>
                            <div className="metric-divider"></div>
                            <div className="metric">
                                <div className="metric-number">98%</div>
                                <div className="metric-label">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .testimonials-section {
                    padding: 6rem 0;
                    background: white;
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

                .testimonials-container {
                    position: relative;
                }

                .testimonial-card {
                    background: #f8fafc;
                    border-radius: 20px;
                    padding: 3rem;
                    text-align: center;
                    border: 1px solid #f1f5f9;
                    position: relative;
                    overflow: hidden;
                }

                .testimonial-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        135deg,
                        rgba(74, 144, 226, 0.02) 0%,
                        transparent 50%
                    );
                    pointer-events: none;
                }

                .quote-icon {
                    margin-bottom: 1.5rem;
                }

                .quote-icon i {
                    font-size: 2rem;
                    color: #4a90e2;
                    opacity: 0.3;
                }

                .testimonial-text {
                    font-size: 1.25rem;
                    line-height: 1.6;
                    color: #1a202c;
                    margin-bottom: 2rem;
                    font-style: italic;
                    position: relative;
                    z-index: 1;
                }

                .testimonial-rating {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: center;
                    gap: 0.25rem;
                }

                .testimonial-rating .text-gray {
                    color: #d1d5db;
                }

                .testimonial-author {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }

                .author-avatar {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .avatar-text {
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .verified-badge {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 20px;
                    height: 20px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                }

                .verified-badge i {
                    color: white;
                    font-size: 0.7rem;
                }

                .author-info {
                    text-align: left;
                }

                .author-name {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.25rem;
                }

                .author-details {
                    color: #4a90e2;
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .separator {
                    margin: 0 0.5rem;
                    color: #d1d5db;
                }

                .author-location {
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .testimonial-dots {
                    display: flex;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 2rem;
                }

                .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: none;
                    background: #d1d5db;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .dot.active {
                    background: #4a90e2;
                    transform: scale(1.2);
                }

                .dot:hover:not(.active) {
                    background: #9ca3af;
                }

                .trust-metrics {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 3rem;
                    flex-wrap: wrap;
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 2rem;
                }

                .metric {
                    text-align: center;
                }

                .metric-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 0.25rem;
                }

                .metric-label {
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .metric-divider {
                    width: 1px;
                    height: 40px;
                    background: #d1d5db;
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .testimonials-section {
                        padding: 4rem 0;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .section-header {
                        margin-bottom: 3rem;
                    }

                    .trust-metrics {
                        gap: 2rem;
                    }

                    .metric-divider {
                        display: none;
                    }
                }

                @media (max-width: 767.98px) {
                    .testimonials-section {
                        padding: 3rem 0;
                    }

                    .testimonial-card {
                        padding: 2rem 1.5rem;
                    }

                    .testimonial-text {
                        font-size: 1.125rem;
                    }

                    .testimonial-author {
                        flex-direction: column;
                        text-align: center;
                    }

                    .author-info {
                        text-align: center;
                    }

                    .trust-metrics {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .section-title {
                        font-size: 1.75rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default TestimonialsSection;
