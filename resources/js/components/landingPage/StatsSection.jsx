// components/landingPage/StatsSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import landingPageService from "../../services/landingPageService";

const StatsSection = () => {
    const [inView, setInView] = useState(false);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef(null);

    // Fetch real platform statistics on component mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const platformStats = await landingPageService.getPlatformStats();
                
                // Transform API data to component format
                const transformedStats = [
                    {
                        icon: "fas fa-users",
                        number: platformStats.totalClients || 500,
                        suffix: "+",
                        title: "Happy Customers",
                        description: "Satisfied clients across Sri Lanka",
                        color: "primary",
                    },
                    {
                        icon: "fas fa-user-tie",
                        number: platformStats.totalProviders || 100,
                        suffix: "+",
                        title: "Verified Providers",
                        description: "Skilled professionals ready to serve",
                        color: "success",
                    },
                    {
                        icon: "fas fa-concierge-bell",
                        number: platformStats.totalServices || 150,
                        suffix: "+",
                        title: "Available Services",
                        description: "Diverse services to choose from",
                        color: "info",
                    },
                    {
                        icon: "fas fa-th-large",
                        number: platformStats.totalCategories || 12,
                        suffix: "+",
                        title: "Service Categories",
                        description: "Comprehensive service offerings",
                        color: "warning",
                    },
                    {
                        icon: "fas fa-star",
                        number: platformStats.averageRating || 4.9,
                        suffix: "/5",
                        title: "Average Rating",
                        description: "Exceptional customer satisfaction",
                        color: "danger",
                    },
                    {
                        icon: "fas fa-calendar-check",
                        number: platformStats.completedAppointments || 1500,
                        suffix: "+",
                        title: "Services Completed",
                        description: "Successfully finished appointments",
                        color: "secondary",
                    },
                ];
                
                setStats(transformedStats);
            } catch (error) {
                console.error("Error fetching platform stats:", error);
                // Keep fallback mock data
                setStats(getMockStats());
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Fallback mock data
    const getMockStats = () => [
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
        if (loading) return; // Don't start animation until data is loaded
        
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
    }, [loading]);

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
                {loading ? (
                    <div className="stats-loading">
                        <div className="loading-spinner-large">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading statistics...</p>
                        </div>
                    </div>
                ) : (
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
                )}

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
