import React, { useState, useEffect, useRef } from "react";

const StatsSection = () => {
    const [inView, setInView] = useState(false);
    const sectionRef = useRef(null);

    const stats = [
        {
            icon: "fas fa-users",
            number: 5000,
            suffix: "+",
            title: "Happy Clients",
            description:
                "Satisfied customers who found their perfect service provider",
        },
        {
            icon: "fas fa-user-tie",
            number: 1000,
            suffix: "+",
            title: "Service Providers",
            description: "Verified professionals across various industries",
        },
        {
            icon: "fas fa-handshake",
            number: 25000,
            suffix: "+",
            title: "Successful Bookings",
            description: "Completed appointments with excellent reviews",
        },
        {
            icon: "fas fa-clock",
            number: 15,
            suffix: " min",
            title: "Average Response Time",
            description: "Quick connection with available service providers",
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const AnimatedNumber = ({ number, suffix, inView }) => {
        const [currentNumber, setCurrentNumber] = useState(0);

        useEffect(() => {
            if (inView) {
                const duration = 2000; // 2 seconds
                const steps = 60;
                const increment = number / steps;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        setCurrentNumber(number);
                        clearInterval(timer);
                    } else {
                        setCurrentNumber(Math.floor(current));
                    }
                }, duration / steps);

                return () => clearInterval(timer);
            }
        }, [inView, number]);

        return (
            <span className="stat-number">
                {currentNumber.toLocaleString()}
                {suffix}
            </span>
        );
    };

    return (
        <section
            id="stats"
            className="stats-section py-5 bg-light"
            ref={sectionRef}
        >
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center mb-5">
                        <h2 className="section-title fw-bold mb-3">
                            Trusted by Thousands
                        </h2>
                        <p className="section-subtitle lead text-muted">
                            Join our growing community of satisfied clients and
                            professional service providers
                        </p>
                    </div>
                </div>

                <div className="row g-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="col-lg-3 col-md-6">
                            <div className="stat-card h-100 text-center p-4 bg-white rounded-3 shadow-sm border-0">
                                <div className="stat-icon mb-3">
                                    <i
                                        className={`${stat.icon} fa-2x text-primary`}
                                    ></i>
                                </div>
                                <div className="stat-content">
                                    <h3 className="stat-number-container fw-bold text-dark mb-2">
                                        <AnimatedNumber
                                            number={stat.number}
                                            suffix={stat.suffix}
                                            inView={inView}
                                        />
                                    </h3>
                                    <h5 className="stat-title fw-semibold mb-2 text-primary">
                                        {stat.title}
                                    </h5>
                                    <p className="stat-description text-muted small mb-0">
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="trust-indicators text-center">
                            <p className="text-muted mb-3">
                                Trusted by leading companies
                            </p>
                            <div className="d-flex justify-content-center align-items-center flex-wrap gap-4">
                                <div className="trust-logo px-3 py-2 bg-white rounded border">
                                    <i className="fas fa-shield-alt text-success me-2"></i>
                                    <span className="small fw-semibold">
                                        Verified & Secure
                                    </span>
                                </div>
                                <div className="trust-logo px-3 py-2 bg-white rounded border">
                                    <i className="fas fa-certificate text-warning me-2"></i>
                                    <span className="small fw-semibold">
                                        ISO Certified
                                    </span>
                                </div>
                                <div className="trust-logo px-3 py-2 bg-white rounded border">
                                    <i className="fas fa-lock text-info me-2"></i>
                                    <span className="small fw-semibold">
                                        SSL Protected
                                    </span>
                                </div>
                                <div className="trust-logo px-3 py-2 bg-white rounded border">
                                    <i className="fas fa-headset text-primary me-2"></i>
                                    <span className="small fw-semibold">
                                        24/7 Support
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
