// components/landing/ServicesSection.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
    const [activeFilter, setActiveFilter] = useState("all");

    const serviceCategories = [
        {
            id: "electrical",
            title: "Electrical Work",
            description:
                "Licensed electricians for installations, repairs, and power issues across Sri Lanka",
            icon: "fas fa-bolt",
            color: "warning",
            providers: "250+",
            avgRating: "4.9",
            popular: true,
            examples: [
                "Wiring & Installations",
                "Lighting Solutions",
                "Power Troubleshooting",
                "Electrical Repairs",
            ],
        },
        {
            id: "tutoring",
            title: "Tutoring & Education",
            description:
                "Expert tutors for academic subjects, test preparation, and skill development",
            icon: "fas fa-graduation-cap",
            color: "primary",
            providers: "180+",
            avgRating: "4.8",
            popular: true,
            examples: [
                "Mathematics",
                "Science Subjects",
                "Language Learning",
                "Exam Preparation",
            ],
        },
        {
            id: "cleaning",
            title: "Home Cleaning",
            description:
                "Professional cleaning services for homes, offices, and commercial spaces",
            icon: "fas fa-broom",
            color: "success",
            providers: "320+",
            avgRating: "4.7",
            popular: true,
            examples: [
                "House Cleaning",
                "Office Cleaning",
                "Deep Cleaning",
                "Move-in/out Cleaning",
            ],
        },
        {
            id: "caregiving",
            title: "Caregiving Services",
            description:
                "Compassionate care for elderly, children, and healthcare assistance",
            icon: "fas fa-heart",
            color: "danger",
            providers: "150+",
            avgRating: "4.9",
            popular: true,
            examples: [
                "Elder Care",
                "Child Care",
                "Medical Assistance",
                "Companion Services",
            ],
        },
        {
            id: "computer",
            title: "Computer & IT Support",
            description:
                "Technical support, repairs, and IT solutions for all your technology needs",
            icon: "fas fa-laptop",
            color: "info",
            providers: "200+",
            avgRating: "4.6",
            popular: false,
            examples: [
                "Computer Repair",
                "Software Installation",
                "Network Setup",
                "Data Recovery",
            ],
        },
        {
            id: "plumbing",
            title: "Plumbing Services",
            description:
                "Professional plumbers for installations, repairs, and maintenance",
            icon: "fas fa-wrench",
            color: "secondary",
            providers: "180+",
            avgRating: "4.8",
            popular: false,
            examples: [
                "Pipe Repairs",
                "Leak Detection",
                "Bathroom Fixes",
                "Installation Services",
            ],
        },
    ];

    const filters = [
        { id: "all", label: "All Services", icon: "fas fa-th-large" },
        { id: "popular", label: "Most Popular", icon: "fas fa-fire" },
        { id: "home", label: "Home Services", icon: "fas fa-home" },
        { id: "professional", label: "Professional", icon: "fas fa-briefcase" },
    ];

    const filteredServices =
        activeFilter === "all"
            ? serviceCategories
            : activeFilter === "popular"
            ? serviceCategories.filter((service) => service.popular)
            : serviceCategories;

    return (
        <section
            className="section-modern"
            id="services"
            style={{ background: "var(--bg-light)" }}
        >
            <div className="container-custom">
                {/* Section Header */}
                <div className="section-header">
                    <div className="section-badge">
                        <span>🔧 Our Services</span>
                    </div>
                    <h2 className="section-title">
                        Find the{" "}
                        <span className="text-primary">Perfect Service</span>{" "}
                        for Your Needs
                    </h2>
                    <p className="section-subtitle">
                        From electrical work to tutoring, discover trusted
                        professionals across Sri Lanka ready to help you today.
                    </p>
                </div>

                {/* Service Filters */}
                <div className="service-filters">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            className={`filter-btn ${
                                activeFilter === filter.id ? "active" : ""
                            }`}
                            onClick={() => setActiveFilter(filter.id)}
                        >
                            <i className={filter.icon}></i>
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>

                {/* Services Grid */}
                <div className="services-grid">
                    {filteredServices.map((service) => (
                        <div key={service.id} className="service-card">
                            {service.popular && (
                                <div className="popularity-badge">
                                    <i className="fas fa-star"></i>
                                    <span>Popular</span>
                                </div>
                            )}

                            <div className="service-header">
                                <div
                                    className={`service-icon ${service.color}`}
                                >
                                    <i className={service.icon}></i>
                                </div>
                                <div className="service-meta">
                                    <div className="service-providers">
                                        <span className="provider-count">
                                            {service.providers}
                                        </span>
                                        <span className="provider-label">
                                            providers
                                        </span>
                                    </div>
                                    <div className="service-rating">
                                        <i className="fas fa-star"></i>
                                        <span>{service.avgRating}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="service-content">
                                <h3 className="service-title">
                                    {service.title}
                                </h3>
                                <p className="service-description">
                                    {service.description}
                                </p>

                                <div className="service-examples">
                                    <h6>Popular services include:</h6>
                                    <ul className="examples-list">
                                        {service.examples.map(
                                            (example, index) => (
                                                <li key={index}>{example}</li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="service-actions">
                                <Link
                                    to={`/services/${service.id}`}
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-search"></i>
                                    <span>Find Providers</span>
                                </Link>
                                <Link
                                    to={`/services/${service.id}/info`}
                                    className="btn-secondary"
                                >
                                    <i className="fas fa-info-circle"></i>
                                    <span>Learn More</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div
                    className="services-cta gradient-section"
                    style={{
                        borderRadius: "24px",
                        padding: "3rem 2rem",
                        textAlign: "center",
                        color: "white",
                    }}
                >
                    <div
                        className="cta-content"
                        style={{
                            position: "relative",
                            zIndex: 1,
                            maxWidth: "600px",
                            margin: "0 auto",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                marginBottom: "1rem",
                            }}
                        >
                            Don't see what you're looking for?
                        </h3>
                        <p
                            style={{
                                fontSize: "1.125rem",
                                opacity: 0.9,
                                marginBottom: "2rem",
                                lineHeight: 1.6,
                            }}
                        >
                            We're constantly adding new service categories. Post
                            your request and we'll connect you with the right
                            professional.
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
                            <Link
                                to="/request-service"
                                className="btn-primary-large"
                            >
                                <i className="fas fa-plus"></i>
                                <span>Request a Service</span>
                            </Link>
                            <Link
                                to="/register?role=service_provider"
                                className="btn-secondary-outline"
                            >
                                <i className="fas fa-user-plus"></i>
                                <span>Become a Provider</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
