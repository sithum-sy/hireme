// components/landingPage/TestimonialsSection.jsx
import React, { useState, useEffect } from "react";

const TestimonialsSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            id: 1,
            name: "Priya Wickramasinghe",
            role: "Client",
            location: "Colombo",
            service: "Electrical Work",
            rating: 5,
            comment:
                "Found an excellent electrician through HireMe within 15 minutes! The location-based search made it so easy to find someone nearby. Professional service and fair pricing.",
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
            comment:
                "As a math tutor, HireMe has completely transformed my business. I get consistent bookings, and the payment system is secure and transparent. Highly recommend for fellow educators!",
            avatar: "CP",
            verified: true,
            clientsServed: "50+",
        },
        {
            id: 3,
            name: "Sanduni Silva",
            role: "Client",
            location: "Kandy",
            service: "Home Cleaning",
            rating: 5,
            comment:
                "The cleaning service I found through HireMe was exceptional. The provider was verified, professional, and punctual. The app made booking and payment seamless.",
            avatar: "SS",
            verified: true,
            serviceProvider: "Clean Pro Services",
        },
        {
            id: 4,
            name: "Ruwan Jayawardena",
            role: "Service Provider",
            location: "Negombo",
            service: "Plumbing",
            rating: 5,
            comment:
                "HireMe gave me a platform to showcase my plumbing skills and connect with clients who really need my services. The verification process built trust with customers.",
            avatar: "RJ",
            verified: true,
            clientsServed: "75+",
        },
        {
            id: 5,
            name: "Nishadi Fernando",
            role: "Client",
            location: "Matara",
            service: "Caregiving",
            rating: 5,
            comment:
                "When I needed a caregiver for my elderly mother, HireMe connected me with a compassionate and qualified professional. The peace of mind is invaluable.",
            avatar: "NF",
            verified: true,
            serviceProvider: "CareHeart Lanka",
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
        <section className="section-modern testimonials-section">
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
