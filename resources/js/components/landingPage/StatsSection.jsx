// components/landingPage/StatsSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const StatsSection = () => {
    const [inView, setInView] = useState(false);
    const sectionRef = useRef(null);

    const stats = [
        {
            icon: "fas fa-users",
            number: 25000,
            suffix: "+",
            title: "Happy Customers",
            description: "Satisfied clients across Sri Lanka",
            color: "primary",
        },
        {
            icon: "fas fa-user-tie",
            number: 10000,
            suffix: "+",
            title: "Verified Providers",
            description: "Skilled professionals ready to serve",
            color: "success",
        },
        {
            icon: "fas fa-calendar-check",
            number: 150000,
            suffix: "+",
            title: "Services Completed",
            description: "Successfully finished appointments",
            color: "info",
        },
        {
            icon: "fas fa-map-marker-alt",
            number: 25,
            suffix: "+",
            title: "Cities Covered",
            description: "Expanding across Sri Lanka",
            color: "warning",
        },
        {
            icon: "fas fa-star",
            number: 4.9,
            suffix: "/5",
            title: "Average Rating",
            description: "Exceptional customer satisfaction",
            color: "danger",
        },
        {
            icon: "fas fa-clock",
            number: 15,
            suffix: " min",
            title: "Average Response",
            description: "Quick connection to providers",
            color: "secondary",
        },
    ];

    const achievements = [
        {
            title: "Most Trusted Platform",
            description:
                "Recognized as Sri Lanka's most trusted service marketplace",
            icon: "fas fa-trophy",
            year: "2024",
        },
        {
            title: "Best User Experience",
            description: "Award for exceptional platform design and usability",
            icon: "fas fa-award",
            year: "2024",
        },
        {
            title: "Innovation in Tech",
            description:
                "Leading innovation in location-based service matching",
            icon: "fas fa-lightbulb",
            year: "2023",
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
                const duration = 2000;
                const steps = 60;
                const increment = number / steps;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        setCurrentNumber(number);
                        clearInterval(timer);
                    } else {
                        setCurrentNumber(
                            number % 1 === 0
                                ? Math.floor(current)
                                : parseFloat(current.toFixed(1))
                        );
                    }
                }, duration / steps);

                return () => clearInterval(timer);
            }
        }, [inView, number]);

        return (
            <span className="stat-number">
                {number % 1 === 0
                    ? currentNumber.toLocaleString()
                    : currentNumber.toFixed(1)}
                {suffix}
            </span>
        );
    };

    return (
        <section
            className="section-modern stats-section gradient-section"
            ref={sectionRef}
        >
            <div className="container-custom">
                {/* Section Header */}
                <div className="section-header">
                    <div className="section-badge">
                        <span>📊 Our Impact</span>
                    </div>
                    <h2 className="section-title" style={{ color: "white" }}>
                        Trusted by{" "}
                        <span className="text-gradient">Thousands</span> Across
                        Sri Lanka
                    </h2>
                    <p
                        className="section-subtitle"
                        style={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                        See how HireMe is transforming the service industry and
                        creating opportunities for both clients and service
                        providers.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className={`stat-icon ${stat.color}`}>
                                <i className={stat.icon}></i>
                            </div>

                            <div className="stat-content">
                                <div className="stat-number-container">
                                    <AnimatedNumber
                                        number={stat.number}
                                        suffix={stat.suffix}
                                        inView={inView}
                                    />
                                </div>
                                <h3 className="stat-title">{stat.title}</h3>
                                <p className="stat-description">
                                    {stat.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Achievements Section */}
                <div className="achievements-section">
                    <div className="achievements-header">
                        <h3
                            style={{
                                color: "white",
                                fontSize: "2rem",
                                fontWeight: 700,
                                marginBottom: "1rem",
                            }}
                        >
                            Our Achievements
                        </h3>
                        <p
                            style={{
                                color: "rgba(255, 255, 255, 0.9)",
                                marginBottom: "3rem",
                            }}
                        >
                            Recognition for our commitment to excellence and
                            innovation
                        </p>
                    </div>

                    <div className="achievements-grid">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="achievement-card">
                                <div className="achievement-icon">
                                    <i className={achievement.icon}></i>
                                </div>
                                <div className="achievement-content">
                                    <div className="achievement-year">
                                        {achievement.year}
                                    </div>
                                    <h4 className="achievement-title">
                                        {achievement.title}
                                    </h4>
                                    <p className="achievement-description">
                                        {achievement.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="stats-cta">
                    <h3
                        style={{
                            color: "white",
                            fontSize: "1.75rem",
                            fontWeight: 700,
                            marginBottom: "1rem",
                        }}
                    >
                        Ready to Be Part of Our Success Story?
                    </h3>
                    <p
                        style={{
                            color: "rgba(255, 255, 255, 0.9)",
                            marginBottom: "2rem",
                        }}
                    >
                        Join thousands of satisfied users who have found their
                        perfect service match.
                    </p>
                    <div
                        className="cta-actions"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <Link to="/register" className="btn-primary-large">
                            <i className="fas fa-user-plus"></i>
                            <span>Join HireMe Today</span>
                        </Link>
                        <Link to="/about" className="btn-secondary-outline">
                            <i className="fas fa-info-circle"></i>
                            <span>Learn More</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
