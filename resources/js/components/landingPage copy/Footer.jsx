import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = {
        services: [
            { name: "Healthcare & Caregiving", icon: "fas fa-heart" },
            { name: "Education & Tutoring", icon: "fas fa-graduation-cap" },
            { name: "Home Services", icon: "fas fa-tools" },
            { name: "Transportation", icon: "fas fa-car" },
            { name: "Cleaning Services", icon: "fas fa-broom" },
            { name: "Tech Support", icon: "fas fa-laptop-code" },
        ],
        company: [
            { name: "About Us", path: "/about" },
            { name: "How It Works", path: "/#how-it-works" },
            { name: "Careers", path: "/careers" },
            { name: "Press", path: "/press" },
            { name: "Blog", path: "/blog" },
            { name: "Contact Us", path: "/contact" },
        ],
        support: [
            { name: "Help Center", path: "/help" },
            { name: "Safety Guidelines", path: "/safety" },
            { name: "Community Guidelines", path: "/community" },
            { name: "Terms of Service", path: "/terms" },
            { name: "Privacy Policy", path: "/privacy" },
            { name: "Cookie Policy", path: "/cookies" },
        ],
        forProviders: [
            {
                name: "Become a Provider",
                path: "/register?role=service_provider",
            },
            { name: "Provider Resources", path: "/provider-resources" },
            { name: "Provider App", path: "/provider-app" },
            { name: "Success Stories", path: "/success-stories" },
            { name: "Provider Support", path: "/provider-support" },
            { name: "Pricing", path: "/pricing" },
        ],
    };

    const socialLinks = [
        {
            platform: "Facebook",
            icon: "fab fa-facebook-f",
            url: "https://facebook.com/hireme",
            color: "text-primary",
        },
        {
            platform: "Twitter",
            icon: "fab fa-twitter",
            url: "https://twitter.com/hireme",
            color: "text-info",
        },
        {
            platform: "Instagram",
            icon: "fab fa-instagram",
            url: "https://instagram.com/hireme",
            color: "text-danger",
        },
        {
            platform: "LinkedIn",
            icon: "fab fa-linkedin-in",
            url: "https://linkedin.com/company/hireme",
            color: "text-primary",
        },
        {
            platform: "YouTube",
            icon: "fab fa-youtube",
            url: "https://youtube.com/hireme",
            color: "text-danger",
        },
    ];

    const handleScrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className="footer bg-dark text-light">
            {/* Newsletter Section */}
            <div className="newsletter-section bg-primary py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <h3 className="fw-bold text-white mb-2">
                                Stay Updated
                            </h3>
                            <p className="text-light opacity-90 mb-0">
                                Get the latest updates on new services,
                                features, and special offers.
                            </p>
                        </div>
                        <div className="col-lg-6">
                            <form className="newsletter-form">
                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="form-control form-control-lg border-0"
                                        placeholder="Enter your email address"
                                        style={{
                                            borderRadius: "50px 0 0 50px",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-light btn-lg px-4 fw-semibold"
                                        style={{
                                            borderRadius: "0 50px 50px 0",
                                        }}
                                    >
                                        Subscribe
                                    </button>
                                </div>
                                <small className="text-light opacity-75 mt-2 d-block">
                                    We respect your privacy. Unsubscribe at any
                                    time.
                                </small>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="footer-content py-5">
                <div className="container">
                    <div className="row g-4">
                        {/* Brand Section */}
                        <div className="col-lg-4 col-md-6">
                            <div className="footer-brand mb-4">
                                <Link
                                    to="/"
                                    className="text-decoration-none d-flex align-items-center mb-3"
                                >
                                    <div className="brand-icon me-2">
                                        <i className="fas fa-handshake text-primary fa-2x"></i>
                                    </div>
                                    <span className="h3 fw-bold text-white mb-0">
                                        HireMe
                                    </span>
                                </Link>
                                <p className="text-light opacity-75 mb-4">
                                    Connecting clients with trusted
                                    professionals across various industries.
                                    Your one-stop platform for reliable,
                                    verified service providers.
                                </p>

                                {/* Social Links */}
                                <div className="social-links">
                                    <h6 className="fw-semibold text-white mb-3">
                                        Follow Us
                                    </h6>
                                    <div className="d-flex gap-3">
                                        {socialLinks.map((social, index) => (
                                            <a
                                                key={index}
                                                href={social.url}
                                                className="social-link bg-secondary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center text-decoration-none transition-all"
                                                style={{
                                                    width: "45px",
                                                    height: "45px",
                                                }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={social.platform}
                                            >
                                                <i
                                                    className={`${social.icon} ${social.color}`}
                                                ></i>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title fw-bold text-white mb-3">
                                Services
                            </h6>
                            <ul className="footer-links list-unstyled">
                                {footerSections.services.map(
                                    (service, index) => (
                                        <li key={index} className="mb-2">
                                            <a
                                                href="#services"
                                                className="footer-link text-light opacity-75 text-decoration-none d-flex align-items-center"
                                            >
                                                <i
                                                    className={`${service.icon} me-2 text-primary`}
                                                    style={{
                                                        fontSize: "0.9rem",
                                                    }}
                                                ></i>
                                                <span className="small">
                                                    {service.name}
                                                </span>
                                            </a>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        {/* Company Section */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title fw-bold text-white mb-3">
                                Company
                            </h6>
                            <ul className="footer-links list-unstyled">
                                {footerSections.company.map((item, index) => (
                                    <li key={index} className="mb-2">
                                        {item.path.startsWith("/#") ? (
                                            <button
                                                className="footer-link text-light opacity-75 border-0 bg-transparent p-0 text-start"
                                                onClick={() =>
                                                    handleScrollToSection(
                                                        item.path.substring(2)
                                                    )
                                                }
                                            >
                                                {item.name}
                                            </button>
                                        ) : (
                                            <Link
                                                to={item.path}
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                {item.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support Section */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title fw-bold text-white mb-3">
                                Support
                            </h6>
                            <ul className="footer-links list-unstyled">
                                {footerSections.support.map((item, index) => (
                                    <li key={index} className="mb-2">
                                        <Link
                                            to={item.path}
                                            className="footer-link text-light opacity-75 text-decoration-none"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* For Providers Section */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title fw-bold text-white mb-3">
                                For Providers
                            </h6>
                            <ul className="footer-links list-unstyled">
                                {footerSections.forProviders.map(
                                    (item, index) => (
                                        <li key={index} className="mb-2">
                                            <Link
                                                to={item.path}
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Download Section */}
            <div className="app-download-section bg-secondary bg-opacity-25 py-4">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-3 mb-lg-0">
                            <h6 className="fw-semibold text-white mb-2">
                                Get the HireMe App
                            </h6>
                            <p className="text-light opacity-75 mb-0 small">
                                Download our mobile app for the best experience
                                on iOS and Android.
                            </p>
                        </div>
                        <div className="col-lg-6">
                            <div className="d-flex gap-3 justify-content-lg-end">
                                <a
                                    href="#"
                                    className="app-store-btn btn btn-dark d-flex align-items-center text-decoration-none"
                                >
                                    <i className="fab fa-apple fa-2x me-2"></i>
                                    <div className="text-start">
                                        <div className="small">
                                            Download on the
                                        </div>
                                        <div className="fw-semibold">
                                            App Store
                                        </div>
                                    </div>
                                </a>
                                <a
                                    href="#"
                                    className="app-store-btn btn btn-dark d-flex align-items-center text-decoration-none"
                                >
                                    <i className="fab fa-google-play fa-2x me-2"></i>
                                    <div className="text-start">
                                        <div className="small">Get it on</div>
                                        <div className="fw-semibold">
                                            Google Play
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom bg-black py-3">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-2 mb-md-0">
                            <p className="text-light opacity-50 mb-0 small">
                                © {currentYear} HireMe. All rights reserved.
                                Made with ❤️ for connecting people.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-md-end gap-3 flex-wrap">
                                <Link
                                    to="/terms"
                                    className="text-light opacity-50 text-decoration-none small"
                                >
                                    Terms
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="text-light opacity-50 text-decoration-none small"
                                >
                                    Privacy
                                </Link>
                                <Link
                                    to="/cookies"
                                    className="text-light opacity-50 text-decoration-none small"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    to="/accessibility"
                                    className="text-light opacity-50 text-decoration-none small"
                                >
                                    Accessibility
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
