import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
    const services = [
        {
            icon: "fas fa-heart",
            title: "Healthcare & Caregiving",
            description:
                "Professional caregivers, nurses, and healthcare assistants",
            color: "text-danger",
        },
        {
            icon: "fas fa-graduation-cap",
            title: "Education & Tutoring",
            description: "Expert tutors for all subjects and grade levels",
            color: "text-success",
        },
        {
            icon: "fas fa-tools",
            title: "Home Services",
            description: "Skilled plumbers, electricians, and handymen",
            color: "text-primary",
        },
        {
            icon: "fas fa-car",
            title: "Transportation",
            description: "Reliable drivers and delivery services",
            color: "text-warning",
        },
        {
            icon: "fas fa-broom",
            title: "Cleaning Services",
            description: "Professional house and office cleaning",
            color: "text-info",
        },
        {
            icon: "fas fa-laptop-code",
            title: "Tech Support",
            description: "IT support and computer repair specialists",
            color: "text-dark",
        },
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
                <div className="container">
                    <Link className="navbar-brand fw-bold text-primary" to="/">
                        <i className="fas fa-handshake me-2"></i>
                        HireMe
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#services">
                                    Services
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#how-it-works">
                                    How It Works
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#about">
                                    About
                                </a>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className="btn btn-primary ms-2"
                                    to="/register"
                                >
                                    Get Started
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section bg-gradient-primary text-white py-5">
                <div className="container">
                    <div className="row align-items-center min-vh-100 py-5">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-4">
                                Connect with Trusted Professionals
                            </h1>
                            <p className="lead mb-4">
                                Find skilled caregivers, tutors, plumbers, and
                                more. Book appointments instantly and track your
                                service provider in real-time.
                            </p>
                            <div className="d-flex gap-3 mb-4">
                                <Link
                                    to="/register?role=client"
                                    className="btn btn-light btn-lg"
                                >
                                    <i className="fas fa-user me-2"></i>
                                    Find Services
                                </Link>
                                <Link
                                    to="/register?role=provider"
                                    className="btn btn-outline-light btn-lg"
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    Become a Provider
                                </Link>
                            </div>
                            <div className="d-flex gap-4 text-center">
                                <div>
                                    <h4 className="fw-bold">1000+</h4>
                                    <small>Service Providers</small>
                                </div>
                                <div>
                                    <h4 className="fw-bold">5000+</h4>
                                    <small>Happy Clients</small>
                                </div>
                                <div>
                                    <h4 className="fw-bold">50+</h4>
                                    <small>Service Categories</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <div className="hero-image-placeholder bg-white rounded-3 shadow-lg p-5 text-center">
                                    <i className="fas fa-mobile-alt fa-5x text-primary mb-3"></i>
                                    <h5 className="text-dark">
                                        Real-time Tracking
                                    </h5>
                                    <p className="text-muted">
                                        Track your service provider's location
                                        just like Uber
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mx-auto text-center mb-5">
                            <h2 className="fw-bold mb-3">Our Services</h2>
                            <p className="lead text-muted">
                                Connecting you with skilled professionals across
                                various industries
                            </p>
                        </div>
                    </div>
                    <div className="row g-4">
                        {services.map((service, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div className="service-card h-100 p-4 text-center bg-white rounded-3 shadow-sm border-0 hover-lift">
                                    <div
                                        className={`service-icon ${service.color} mb-3`}
                                    >
                                        <i
                                            className={`${service.icon} fa-3x`}
                                        ></i>
                                    </div>
                                    <h5 className="fw-bold mb-3">
                                        {service.title}
                                    </h5>
                                    <p className="text-muted">
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-5 bg-light">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mx-auto text-center mb-5">
                            <h2 className="fw-bold mb-3">How It Works</h2>
                            <p className="lead text-muted">
                                Simple steps to connect with professionals
                            </p>
                        </div>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-4 text-center">
                            <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                                1
                            </div>
                            <h5 className="fw-bold mb-3">
                                Choose Your Service
                            </h5>
                            <p className="text-muted">
                                Browse through our categories and select the
                                service you need
                            </p>
                        </div>
                        <div className="col-lg-4 text-center">
                            <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                                2
                            </div>
                            <h5 className="fw-bold mb-3">Book Appointment</h5>
                            <p className="text-muted">
                                Schedule your appointment and receive quotes
                                from qualified professionals
                            </p>
                        </div>
                        <div className="col-lg-4 text-center">
                            <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                                3
                            </div>
                            <h5 className="fw-bold mb-3">Track & Connect</h5>
                            <p className="text-muted">
                                Track your service provider in real-time and
                                connect seamlessly
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-5 bg-primary text-white">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mx-auto text-center">
                            <h2 className="fw-bold mb-3">
                                Ready to Get Started?
                            </h2>
                            <p className="lead mb-4">
                                Join thousands of satisfied clients and service
                                providers
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <Link
                                    to="/register?role=client"
                                    className="btn btn-light btn-lg"
                                >
                                    Find Services Now
                                </Link>
                                <Link
                                    to="/register?role=provider"
                                    className="btn btn-outline-light btn-lg"
                                >
                                    Start Earning
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-5 bg-dark text-white">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4">
                            <h5 className="fw-bold mb-3">
                                <i className="fas fa-handshake me-2"></i>
                                HireMe
                            </h5>
                            <p className="text-muted">
                                Connecting clients with trusted professionals
                                across various industries.
                            </p>
                        </div>
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-3">Services</h6>
                            <ul className="list-unstyled">
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Healthcare
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Education
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Home Services
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-3">Company</h6>
                            <ul className="list-unstyled">
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-3">Support</h6>
                            <ul className="list-unstyled">
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Safety
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted text-decoration-none"
                                    >
                                        Terms
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-3">Connect</h6>
                            <div className="d-flex gap-2">
                                <a href="#" className="text-muted">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="text-muted">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="text-muted">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="text-muted">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <div className="row">
                        <div className="col-md-6">
                            <p className="text-muted mb-0">
                                &copy; 2024 HireMe. All rights reserved.
                            </p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="text-muted mb-0">
                                Made with ❤️ for connecting people
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
