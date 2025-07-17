import React, { useState, useEffect } from "react";

const ReviewCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const reviews = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Client",
            service: "Home Cleaning",
            rating: 5,
            comment:
                "Amazing service! Found a reliable cleaning professional within minutes. The real-time tracking feature made me feel secure and informed throughout the process.",
            avatar: "SJ",
            location: "New York, NY",
            color: "primary",
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Service Provider",
            service: "Plumbing Services",
            rating: 5,
            comment:
                "HireMe has transformed my business. I get consistent bookings, and the payment system is seamless. The platform truly cares about both clients and providers.",
            avatar: "MC",
            location: "Los Angeles, CA",
            color: "success",
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "Client",
            service: "Tutoring",
            rating: 5,
            comment:
                "Found an excellent math tutor for my daughter. The verification process gave me confidence, and the results have been outstanding. Highly recommended!",
            avatar: "ER",
            location: "Chicago, IL",
            color: "info",
        },
        {
            id: 4,
            name: "David Wilson",
            role: "Service Provider",
            service: "Home Repair",
            rating: 5,
            comment:
                "Great platform for connecting with clients. The scheduling system is intuitive, and I appreciate how HireMe handles the administrative side of the business.",
            avatar: "DW",
            location: "Houston, TX",
            color: "warning",
        },
        {
            id: 5,
            name: "Lisa Thompson",
            role: "Client",
            service: "Elderly Care",
            rating: 5,
            comment:
                "Finding quality care for my elderly mother was stressful until I found HireMe. The caregivers are professional, vetted, and truly compassionate.",
            avatar: "LT",
            location: "Phoenix, AZ",
            color: "danger",
        },
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % reviews.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % reviews.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={`fas fa-star ${
                    i < rating ? "text-warning" : "text-muted opacity-25"
                }`}
                style={{ fontSize: "0.9rem" }}
            ></i>
        ));
    };

    return (
        <section
            id="reviews"
            className="reviews-section py-5 bg-gradient-primary position-relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                <div className="review-bg-pattern"></div>
            </div>

            <div className="container position-relative">
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center mb-5">
                        <h2 className="section-title fw-bold mb-3 text-white">
                            What Our Community Says
                        </h2>
                        <p className="section-subtitle lead text-light opacity-90">
                            Real experiences from thousands of satisfied clients
                            and service providers
                        </p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-10 mx-auto">
                        <div className="review-carousel position-relative">
                            {/* Main Carousel */}
                            <div className="review-slides-container overflow-hidden rounded-4 shadow-lg">
                                <div
                                    className="review-slides d-flex"
                                    style={{
                                        transform: `translateX(-${
                                            currentSlide * 100
                                        }%)`,
                                        transition:
                                            "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                >
                                    {reviews.map((review, index) => (
                                        <div
                                            key={review.id}
                                            className="review-slide flex-shrink-0 w-100"
                                        >
                                            <div className="review-card bg-white rounded-4 p-5 mx-3 text-center shadow-sm position-relative overflow-hidden">
                                                {/* Background Accent */}
                                                <div
                                                    className={`position-absolute top-0 end-0 bg-${review.color} opacity-10`}
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        borderRadius:
                                                            "0 0 0 100px",
                                                    }}
                                                ></div>

                                                <div className="review-content position-relative">
                                                    {/* Quote Icon */}
                                                    <div className="quote-icon mb-3">
                                                        <i className="fas fa-quote-left fa-2x text-primary opacity-25"></i>
                                                    </div>

                                                    {/* Review Text */}
                                                    <blockquote className="review-comment mb-4">
                                                        <p className="lead text-dark mb-0 lh-lg">
                                                            "{review.comment}"
                                                        </p>
                                                    </blockquote>

                                                    {/* Rating */}
                                                    <div className="review-rating mb-4">
                                                        <div className="d-flex justify-content-center gap-1">
                                                            {renderStars(
                                                                review.rating
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Author Info */}
                                                    <div className="review-author">
                                                        <div className="author-avatar mb-3">
                                                            <div
                                                                className={`avatar-circle bg-${review.color} text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold shadow`}
                                                                style={{
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    fontSize:
                                                                        "1.2rem",
                                                                }}
                                                            >
                                                                {review.avatar}
                                                            </div>
                                                        </div>

                                                        <h5 className="author-name fw-bold mb-1 text-dark">
                                                            {review.name}
                                                        </h5>

                                                        <div className="author-role mb-2">
                                                            <span
                                                                className={`badge bg-${review.color} bg-opacity-15 text-${review.color} px-3 py-2 rounded-pill fw-semibold`}
                                                            >
                                                                {review.role} •{" "}
                                                                {review.service}
                                                            </span>
                                                        </div>

                                                        <div className="author-location">
                                                            <small className="text-muted d-flex align-items-center justify-content-center">
                                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                                {
                                                                    review.location
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                className="carousel-btn carousel-btn-prev position-absolute top-50 translate-middle-y btn btn-white rounded-circle shadow-sm"
                                style={{
                                    left: "-20px",
                                    width: "50px",
                                    height: "50px",
                                }}
                                onClick={prevSlide}
                                onMouseEnter={() => setIsAutoPlaying(false)}
                                onMouseLeave={() => setIsAutoPlaying(true)}
                            >
                                <i className="fas fa-chevron-left text-primary"></i>
                            </button>

                            <button
                                className="carousel-btn carousel-btn-next position-absolute top-50 translate-middle-y btn btn-white rounded-circle shadow-sm"
                                style={{
                                    right: "-20px",
                                    width: "50px",
                                    height: "50px",
                                }}
                                onClick={nextSlide}
                                onMouseEnter={() => setIsAutoPlaying(false)}
                                onMouseLeave={() => setIsAutoPlaying(true)}
                            >
                                <i className="fas fa-chevron-right text-primary"></i>
                            </button>

                            {/* Dots Indicator */}
                            <div className="carousel-indicators d-flex justify-content-center mt-4 gap-2">
                                {reviews.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`carousel-dot rounded-circle border-0 transition-all ${
                                            index === currentSlide
                                                ? "active bg-white shadow-sm"
                                                : "bg-white bg-opacity-50 hover-bg-white"
                                        }`}
                                        style={{
                                            width:
                                                index === currentSlide
                                                    ? "12px"
                                                    : "8px",
                                            height:
                                                index === currentSlide
                                                    ? "12px"
                                                    : "8px",
                                            transition: "all 0.3s ease",
                                        }}
                                        onClick={() => goToSlide(index)}
                                    ></button>
                                ))}
                            </div>

                            {/* Auto-play indicator */}
                            {isAutoPlaying && (
                                <div className="auto-play-indicator position-absolute bottom-0 end-0 me-3 mb-3">
                                    <small className="text-white opacity-75 d-flex align-items-center">
                                        <i
                                            className="fas fa-play me-1"
                                            style={{ fontSize: "0.7rem" }}
                                        ></i>
                                        Auto-playing
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trust Metrics */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="trust-metrics d-flex justify-content-center align-items-center flex-wrap gap-5 text-white">
                            <div className="metric text-center">
                                <div className="metric-number h4 fw-bold mb-1">
                                    4.9/5
                                </div>
                                <div className="metric-label small opacity-75">
                                    Average Rating
                                </div>
                            </div>
                            <div
                                className="metric-divider d-none d-md-block bg-white opacity-25"
                                style={{ width: "1px", height: "40px" }}
                            ></div>
                            <div className="metric text-center">
                                <div className="metric-number h4 fw-bold mb-1">
                                    10,000+
                                </div>
                                <div className="metric-label small opacity-75">
                                    Reviews
                                </div>
                            </div>
                            <div
                                className="metric-divider d-none d-md-block bg-white opacity-25"
                                style={{ width: "1px", height: "40px" }}
                            ></div>
                            <div className="metric text-center">
                                <div className="metric-number h4 fw-bold mb-1">
                                    98%
                                </div>
                                <div className="metric-label small opacity-75">
                                    Satisfaction Rate
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReviewCarousel;
