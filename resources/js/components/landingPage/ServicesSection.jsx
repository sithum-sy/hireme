// components/landing/ServicesSection.jsx
import React from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
    const services = [
        {
            icon: "fas fa-heart",
            title: "Healthcare & Care",
            description: "Professional caregivers, nurses, and health support",
            color: "danger",
            path: "/services/healthcare",
            popular: true,
        },
        {
            icon: "fas fa-graduation-cap",
            title: "Education & Tutoring",
            description: "Expert tutors and educational support",
            color: "info",
            path: "/services/education",
        },
        {
            icon: "fas fa-tools",
            title: "Home Services",
            description: "Repairs, maintenance, and improvements",
            color: "warning",
            path: "/services/home",
        },
        {
            icon: "fas fa-car",
            title: "Transportation",
            description: "Reliable rides and delivery services",
            color: "primary",
            path: "/services/transport",
        },
        {
            icon: "fas fa-broom",
            title: "Cleaning Services",
            description: "Professional cleaning and housekeeping",
            color: "success",
            path: "/services/cleaning",
        },
        {
            icon: "fas fa-laptop-code",
            title: "Tech Support",
            description: "IT help, setup, and troubleshooting",
            color: "secondary",
            path: "/services/tech",
        },
    ];

    return (
        <section id="services" className="services-section">
            <div className="container">
                {/* Section Header */}
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center section-header">
                        <h2 className="section-title">Popular Services</h2>
                        <p className="section-subtitle">
                            Find verified professionals for any service you need
                        </p>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="row g-4">
                    {services.map((service, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <Link
                                to={service.path}
                                className="service-card-link"
                            >
                                <div className="service-card">
                                    {service.popular && (
                                        <div className="popular-badge">
                                            <i className="fas fa-star me-1"></i>
                                            Popular
                                        </div>
                                    )}

                                    <div className="service-icon-container">
                                        <div
                                            className={`service-icon bg-${service.color}`}
                                        >
                                            <i className={service.icon}></i>
                                        </div>
                                    </div>

                                    <div className="service-content">
                                        <h3 className="service-title">
                                            {service.title}
                                        </h3>
                                        <p className="service-description">
                                            {service.description}
                                        </p>
                                    </div>

                                    <div className="service-arrow">
                                        <i className="fas fa-arrow-right"></i>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="row mt-5">
                    <div className="col-12 text-center">
                        <div className="services-cta">
                            <p className="cta-text">
                                Can't find what you're looking for?
                            </p>
                            <Link
                                to="/services"
                                className="btn btn-outline-primary btn-lg"
                            >
                                <i className="fas fa-th-large me-2"></i>
                                View All Services
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .services-section {
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

                .service-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    height: 100%;
                }

                .service-card {
                    background: white;
                    border: 2px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 2rem;
                    height: 100%;
                    position: relative;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }

                .service-card:hover {
                    border-color: #4a90e2;
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(74, 144, 226, 0.1);
                }

                .popular-badge {
                    position: absolute;
                    top: -10px;
                    right: 1rem;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }

                .service-icon-container {
                    margin-bottom: 1.5rem;
                }

                .service-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    color: white;
                    margin: 0 auto;
                }

                .service-icon.bg-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .service-icon.bg-info {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                }

                .service-icon.bg-warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .service-icon.bg-primary {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                }

                .service-icon.bg-success {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .service-icon.bg-secondary {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                }

                .service-content {
                    text-align: center;
                    flex: 1;
                }

                .service-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.75rem;
                }

                .service-description {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 0;
                }

                .service-arrow {
                    display: flex;
                    justify-content: center;
                    margin-top: 1.5rem;
                    color: #4a90e2;
                    font-size: 1.2rem;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }

                .service-card:hover .service-arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

                .services-cta {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 3rem 2rem;
                    border: 2px dashed #d1d5db;
                }

                .cta-text {
                    font-size: 1.125rem;
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .services-section {
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
                    .services-section {
                        padding: 3rem 0;
                    }

                    .service-card {
                        padding: 1.5rem;
                    }

                    .section-title {
                        font-size: 1.75rem;
                    }

                    .services-cta {
                        padding: 2rem 1rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default ServicesSection;
