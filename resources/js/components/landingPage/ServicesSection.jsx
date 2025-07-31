// components/landing/ServicesSection.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import landingPageService from "../../services/landingPageService";

const ServicesSection = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [serviceCategories, setServiceCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch real service categories on component mount
    useEffect(() => {
        const fetchServiceCategories = async () => {
            try {
                setLoading(true);
                const categories =
                    await landingPageService.getServiceCategories();

                // Transform API data to match component expectations
                const safeCategories = Array.isArray(categories)
                    ? categories
                    : [];
                const transformedCategories = safeCategories.map(
                    (category, index) => ({
                        id:
                            category.slug ||
                            category.name.toLowerCase().replace(/\s+/g, "-"),
                        title: category.name,
                        description:
                            category.description ||
                            `Professional ${category.name.toLowerCase()} services`,
                        icon: category.icon || "fas fa-concierge-bell",
                        color: getColorByIndex(index),
                        providers: `${Math.floor(Math.random() * 200) + 50}+`, // Mock for now
                        avgRating: (4.5 + Math.random() * 0.4).toFixed(1), // Mock between 4.5-4.9
                        popular: index < 4, // First 4 categories are popular
                        examples: category.subcategories || [
                            "General Services",
                            "Professional Help",
                        ],
                    })
                );

                setServiceCategories(transformedCategories);
            } catch (error) {
                console.error("Error fetching service categories:", error);
                // Keep original mock data as fallback if API fails
                setServiceCategories(getMockCategories());
            } finally {
                setLoading(false);
            }
        };

        fetchServiceCategories();
    }, []);

    // Helper function to get color by index
    const getColorByIndex = (index) => {
        const colors = [
            "primary",
            "success",
            "info",
            "warning",
            "danger",
            "secondary",
        ];
        return colors[index % colors.length];
    };

    // Fallback mock data
    const getMockCategories = () => [
        {
            id: "electrical",
            title: "Electrical Work",
            description:
                "Licensed electricians for installations, repairs, and power issues",
            icon: "fas fa-bolt",
            color: "warning",
            providers: "250+",
            avgRating: "4.9",
            popular: true,
            examples: ["Wiring & Installations", "Lighting Solutions"],
        },
        {
            id: "tutoring",
            title: "Tutoring & Education",
            description:
                "Expert tutors for academic subjects and skill development",
            icon: "fas fa-graduation-cap",
            color: "primary",
            providers: "180+",
            avgRating: "4.8",
            popular: true,
            examples: ["Mathematics", "Science Subjects"],
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
                {loading ? (
                    <div className="services-loading">
                        <div className="loading-spinner-large">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading services...</p>
                        </div>
                    </div>
                ) : (
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
                                                    <li key={index}>
                                                        {example}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="service-actions">
                                    <Link
                                        to={`/client/services?category=${service.id}`}
                                        className="btn btn-primary"
                                    >
                                        <i className="fas fa-search"></i>
                                        <span>Find Providers</span>
                                    </Link>
                                    <Link
                                        to="/client/services"
                                        className="btn-secondary"
                                    >
                                        <i className="fas fa-info-circle"></i>
                                        <span>Learn More</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
