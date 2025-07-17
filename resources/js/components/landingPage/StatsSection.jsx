// components/landing/StatsSection.jsx
import React, { useState, useEffect, useRef } from "react";

const StatsSection = () => {
    const [inView, setInView] = useState(false);
    const sectionRef = useRef(null);

    const stats = [
        {
            icon: "fas fa-users",
            number: 10000,
            suffix: "+",
            title: "Happy Clients",
            description: "Satisfied customers",
        },
        {
            icon: "fas fa-user-tie",
            number: 2500,
            suffix: "+",
            title: "Verified Providers",
            description: "Professional experts",
        },
        {
            icon: "fas fa-calendar-check",
            number: 50000,
            suffix: "+",
            title: "Bookings Completed",
            description: "Successful appointments",
        },
        {
            icon: "fas fa-star",
            number: 4.9,
            suffix: "/5",
            title: "Average Rating",
            description: "Customer satisfaction",
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
                        setCurrentNumber(Math.floor(current * 10) / 10);
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
        <section className="stats-section" ref={sectionRef}>
            <div className="container">
                {/* Section Header */}
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center section-header">
                        <h2 className="section-title">Trusted by Thousands</h2>
                        <p className="section-subtitle">
                            Join our growing community of satisfied users
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="row g-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="col-lg-3 col-md-6">
                            <div className="stat-card">
                                <div className="stat-icon">
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
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .stats-section {
                    padding: 6rem 0;
                    background: #f8fafc;
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

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    text-align: center;
                    height: 100%;
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                    border-color: #e2e8f0;
                }

                .stat-icon {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    font-size: 1.75rem;
                    color: white;
                }

                .stat-content {
                    text-align: center;
                }

                .stat-number-container {
                    margin-bottom: 0.75rem;
                }

                .stat-number {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    display: block;
                }

                .stat-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.5rem;
                }

                .stat-description {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-bottom: 0;
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .stats-section {
                        padding: 4rem 0;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .section-header {
                        margin-bottom: 3rem;
                    }
                }

                @media (max-width: 767.98px) {
                    .stats-section {
                        padding: 3rem 0;
                    }

                    .stat-card {
                        padding: 1.5rem;
                    }

                    .stat-number {
                        font-size: 2rem;
                    }

                    .section-title {
                        font-size: 1.75rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default StatsSection;
