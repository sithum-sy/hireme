import React from "react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
    const steps = [
        {
            step: 1,
            title: "Choose Your Service",
            description:
                "Browse through our categories and select the service you need from our verified professionals.",
            icon: "fas fa-search",
            color: "primary",
            image: "search-service",
        },
        {
            step: 2,
            title: "Book & Get Quotes",
            description:
                "Schedule your appointment and receive competitive quotes from qualified service providers nearby.",
            icon: "fas fa-calendar-check",
            color: "success",
            image: "book-appointment",
        },
        {
            step: 3,
            title: "Track & Connect",
            description:
                "Track your service provider in real-time and connect seamlessly when they arrive at your location.",
            icon: "fas fa-map-marker-alt",
            color: "info",
            image: "track-provider",
        },
    ];

    const ServiceCard = ({ icon, title, description }) => (
        <div className="service-preview-card p-3 bg-white rounded shadow-sm border-0 mb-3">
            <div className="d-flex align-items-center">
                <div className="service-icon me-3">
                    <i className={`${icon} fa-lg text-primary`}></i>
                </div>
                <div>
                    <h6 className="mb-1 fw-semibold">{title}</h6>
                    <small className="text-muted">{description}</small>
                </div>
            </div>
        </div>
    );

    return (
        <section id="how-it-works" className="how-it-works-section py-5">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 mx-auto text-center mb-5">
                        <h2 className="section-title fw-bold mb-3">
                            How HireMe Works
                        </h2>
                        <p className="section-subtitle lead text-muted">
                            Simple steps to connect with trusted professionals
                            in minutes
                        </p>
                    </div>
                </div>

                <div className="row g-5 align-items-center">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.step}>
                            <div className="col-lg-4">
                                <div className="step-card text-center h-100">
                                    <div className="step-number-container position-relative mb-4">
                                        <div
                                            className={`step-number bg-${step.color} text-white rounded-circle d-inline-flex align-items-center justify-content-center`}
                                        >
                                            {step.step}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="step-connector d-none d-lg-block position-absolute"></div>
                                        )}
                                    </div>

                                    <div className="step-icon mb-3">
                                        <i
                                            className={`${step.icon} fa-3x text-${step.color}`}
                                        ></i>
                                    </div>

                                    <h4 className="step-title fw-bold mb-3">
                                        {step.title}
                                    </h4>

                                    <p className="step-description text-muted">
                                        {step.description}
                                    </p>

                                    {/* Step-specific preview */}
                                    <div className="step-preview mt-4">
                                        {step.step === 1 && (
                                            <div className="service-categories-preview">
                                                <ServiceCard
                                                    icon="fas fa-heart"
                                                    title="Healthcare"
                                                    description="Professional caregivers"
                                                />
                                                <ServiceCard
                                                    icon="fas fa-tools"
                                                    title="Home Services"
                                                    description="Skilled technicians"
                                                />
                                            </div>
                                        )}

                                        {step.step === 2 && (
                                            <div className="booking-preview p-3 bg-light rounded">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="small fw-semibold">
                                                        Available Slots
                                                    </span>
                                                    <i className="fas fa-clock text-success"></i>
                                                </div>
                                                <div className="time-slots d-flex gap-2 flex-wrap">
                                                    <span className="badge bg-primary">
                                                        9:00 AM
                                                    </span>
                                                    <span className="badge bg-primary">
                                                        11:00 AM
                                                    </span>
                                                    <span className="badge bg-primary">
                                                        2:00 PM
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {step.step === 3 && (
                                            <div className="tracking-preview p-3 bg-light rounded">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="provider-info d-flex align-items-center">
                                                        <div
                                                            className="provider-avatar bg-primary rounded-circle me-2"
                                                            style={{
                                                                width: "30px",
                                                                height: "30px",
                                                            }}
                                                        ></div>
                                                        <div>
                                                            <div className="small fw-semibold">
                                                                John Smith
                                                            </div>
                                                            <div className="text-success small">
                                                                <i
                                                                    className="fas fa-circle me-1"
                                                                    style={{
                                                                        fontSize:
                                                                            "8px",
                                                                    }}
                                                                ></i>
                                                                On the way
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="eta text-end">
                                                        <div className="small text-muted">
                                                            ETA
                                                        </div>
                                                        <div className="fw-bold text-primary">
                                                            15 min
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="row mt-5">
                    <div className="col-lg-8 mx-auto text-center">
                        <div className="cta-card bg-primary text-white rounded-3 p-4">
                            <h4 className="fw-bold mb-3">
                                Ready to Get Started?
                            </h4>
                            <p className="mb-4">
                                Join thousands of satisfied clients and service
                                providers
                            </p>
                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                <Link
                                    to="/register?role=client"
                                    className="btn btn-light px-4"
                                >
                                    <i className="fas fa-user me-2"></i>
                                    Find Services
                                </Link>
                                <Link
                                    to="/register?role=service_provider"
                                    className="btn btn-outline-light px-4"
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    Become a Provider
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
