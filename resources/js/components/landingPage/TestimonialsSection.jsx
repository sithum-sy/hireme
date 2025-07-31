// components/landingPage/TestimonialsSection.jsx
import React, { useState, useEffect } from "react";
import landingPageService from "../../services/landingPageService";

const TestimonialsSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch testimonials on component mount
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setLoading(true);
                const testimonialData = await landingPageService.getTestimonials();
                setTestimonials(testimonialData);
            } catch (error) {
                console.error("Error fetching testimonials:", error);
                // Keep fallback mock data
                setTestimonials(getMockTestimonials());
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Fallback mock data
    const getMockTestimonials = () => [
        {
            id: 1,
            name: "Priya Wickramasinghe",
            role: "Client",
            location: "Colombo", 
            service: "Electrical Work",
            rating: 5,
            comment: "Found an excellent electrician through HireMe within 15 minutes!",
            avatar: "PW",
            verified: true,
            serviceProvider: "Kamal Fernando",
        },
        {
            id: 2,
            name: "Chaminda Perera",
            role: "Service Provider",
            location: "Galle",
            service: "Tutoring", 
            rating: 5,
            comment: "HireMe has completely transformed my business. Highly recommend!",
            avatar: "CP",
            verified: true,
            clientsServed: "50+",
        },
    ];

    useEffect(() => {
        if (!isAutoPlaying || loading || testimonials.length === 0) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoPlaying, loading, testimonials.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + testimonials.length) % testimonials.length
        );
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={`fas fa-star ${
                    i < rating ? "star-filled" : "star-empty"
                }`}
            ></i>
        ));
    };

    return (
        <section className="section-modern testimonials-section" id="testimonials">
            <div className="container-custom">
                {/* Section Header */}
                <div className="section-header">
                    <div className="section-badge">
                        <span>💬 Testimonials</span>
                    </div>
                    <h2 className="section-title">
                        What Our <span className="text-primary">Community</span>{" "}
                        Says
                    </h2>
                    <p className="section-subtitle">
                        Real stories from clients and service providers across
                        Sri Lanka who have transformed their experience with
                        HireMe.
                    </p>
                </div>

                {/* Testimonials Carousel */}
                {loading ? (
                    <div className="testimonials-loading">
                        <div className="loading-spinner-large">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading testimonials...</p>
                        </div>
                    </div>
                ) : testimonials.length > 0 ? (
                    <div className="testimonials-carousel">
                    <div className="carousel-container">
                        <button
                            className="carousel-nav prev"
                            onClick={prevSlide}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        <div className="testimonial-slide">
                            <div className="testimonial-card card-modern">
                                {/* Quote Icon */}
                                <div className="quote-icon">
                                    <i className="fas fa-quote-left"></i>
                                </div>

                                {/* Testimonial Content */}
                                <div className="testimonial-content">
                                    <div className="rating">
                                        {renderStars(
                                            testimonials[currentSlide].rating
                                        )}
                                    </div>

                                    <blockquote className="testimonial-text">
                                        "{testimonials[currentSlide].comment}"
                                    </blockquote>
                                </div>

                                {/* Author Info */}
                                <div className="testimonial-author">
                                    <div className="author-avatar">
                                        <span className="avatar-text">
                                            {testimonials[currentSlide].avatar}
                                        </span>
                                        {testimonials[currentSlide]
                                            .verified && (
                                            <div className="verified-badge">
                                                <i className="fas fa-check"></i>
                                            </div>
                                        )}
                                    </div>

                                    <div className="author-details">
                                        <h4 className="author-name">
                                            {testimonials[currentSlide].name}
                                        </h4>
                                        <div className="author-meta">
                                            <span className="author-role">
                                                {
                                                    testimonials[currentSlide]
                                                        .role
                                                }
                                            </span>
                                            <span className="separator">•</span>
                                            <span className="author-service">
                                                {
                                                    testimonials[currentSlide]
                                                        .service
                                                }
                                            </span>
                                        </div>
                                        <div className="author-location">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span>
                                                {
                                                    testimonials[currentSlide]
                                                        .location
                                                }
                                            </span>
                                        </div>
                                        {testimonials[currentSlide]
                                            .serviceProvider && (
                                            <div className="service-provider">
                                                Service:{" "}
                                                {
                                                    testimonials[currentSlide]
                                                        .serviceProvider
                                                }
                                            </div>
                                        )}
                                        {testimonials[currentSlide]
                                            .clientsServed && (
                                            <div className="clients-served">
                                                Clients served:{" "}
                                                {
                                                    testimonials[currentSlide]
                                                        .clientsServed
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="carousel-nav next"
                            onClick={nextSlide}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    {/* Dots Navigation */}
                    <div className="carousel-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${
                                    index === currentSlide ? "active" : ""
                                }`}
                                onClick={() => goToSlide(index)}
                            />
                        ))}
                    </div>
                    </div>
                ) : (
                    <div className="no-testimonials">
                        <p>No testimonials available at the moment.</p>
                    </div>
                )}

                {/* Trust Metrics */}
                <div className="trust-metrics">
                    <div className="metric-item">
                        <div className="metric-number">4.9/5</div>
                        <div className="metric-label">Average Rating</div>
                    </div>
                    <div className="metric-divider"></div>
                    <div className="metric-item">
                        <div className="metric-number">25,000+</div>
                        <div className="metric-label">Happy Customers</div>
                    </div>
                    <div className="metric-divider"></div>
                    <div className="metric-item">
                        <div className="metric-number">98%</div>
                        <div className="metric-label">Satisfaction Rate</div>
                    </div>
                    <div className="metric-divider"></div>
                    <div className="metric-item">
                        <div className="metric-number">10,000+</div>
                        <div className="metric-label">Service Providers</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
