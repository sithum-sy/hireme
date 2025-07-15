import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicLayout = ({
    children,
    showNavbar = true,
    showFooter = true,
    navbarVariant = "transparent", // "transparent", "white", "primary"
    footerVariant = "dark", // "dark", "light", "primary"
}) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Navbar state
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        if (navbarVariant === "transparent") {
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [navbarVariant]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Navigation items for public pages
    const publicNavItems = [
        {
            label: "Services",
            path: "/services",
            scroll: "services",
        },
        {
            label: "How It Works",
            path: "/how-it-works",
            scroll: "how-it-works",
        },
        {
            label: "About",
            path: "/about",
            scroll: "stats",
        },
        {
            label: "Reviews",
            path: "/reviews",
            scroll: "reviews",
        },
        {
            label: "Contact",
            path: "/contact",
        },
    ];

    // Get dashboard path based on user role
    const getDashboardPath = () => {
        if (!isAuthenticated || !user) return "/login";

        switch (user.role) {
            case "admin":
                return "/admin/dashboard";
            case "staff":
                return "/staff/dashboard";
            case "service_provider":
                return "/provider/dashboard";
            case "client":
            default:
                return "/client/dashboard";
        }
    };

    // Handle smooth scroll to section
    const scrollToSection = (sectionId) => {
        if (location.pathname !== "/") {
            navigate("/", { state: { scrollTo: sectionId } });
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
        setIsMobileMenuOpen(false);
    };

    // Handle navigation click
    const handleNavClick = (item) => {
        if (item.scroll && location.pathname === "/") {
            scrollToSection(item.scroll);
        } else if (item.scroll) {
            navigate("/", { state: { scrollTo: item.scroll } });
        } else {
            navigate(item.path);
        }
    };

    // Handle scroll to section from state
    useEffect(() => {
        if (location.state?.scrollTo) {
            setTimeout(() => {
                scrollToSection(location.state.scrollTo);
            }, 100);
        }
    }, [location.state]);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Handle auth actions
    const handleGetStarted = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate("/register");
            setIsLoading(false);
        }, 300);
    };

    // Get navbar classes
    const getNavbarClasses = () => {
        const baseClasses =
            "navbar navbar-expand-lg fixed-top transition-navbar";

        if (navbarVariant === "transparent") {
            return `${baseClasses} ${
                isScrolled ? "navbar-scrolled" : "navbar-transparent"
            }`;
        } else if (navbarVariant === "white") {
            return `${baseClasses} navbar-light bg-white shadow-sm`;
        } else if (navbarVariant === "primary") {
            return `${baseClasses} navbar-dark bg-primary shadow-sm`;
        }

        return baseClasses;
    };

    // Service categories for dropdown (if needed)
    const serviceCategories = [
        {
            name: "House Cleaning",
            icon: "fas fa-home",
            path: "/services/cleaning",
        },
        { name: "Plumbing", icon: "fas fa-wrench", path: "/services/plumbing" },
        {
            name: "Electrical",
            icon: "fas fa-bolt",
            path: "/services/electrical",
        },
        { name: "Gardening", icon: "fas fa-leaf", path: "/services/gardening" },
        {
            name: "Tutoring",
            icon: "fas fa-graduation-cap",
            path: "/services/tutoring",
        },
        { name: "Tech Support", icon: "fas fa-laptop", path: "/services/tech" },
    ];

    return (
        <div className="public-layout">
            {/* Navigation Bar */}
            {showNavbar && (
                <nav className={getNavbarClasses()}>
                    <div className="container">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            {/* Brand */}
                            <Link
                                className="navbar-brand fw-bold d-flex align-items-center"
                                to="/"
                            >
                                <div className="brand-icon me-2">
                                    <i className="fas fa-handshake text-primary"></i>
                                </div>
                                <span className="brand-text">HireMe</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="d-none d-lg-flex align-items-center">
                                {/* Navigation Links */}
                                <ul className="navbar-nav me-4">
                                    {publicNavItems.map((item, index) => (
                                        <li key={index} className="nav-item">
                                            <button
                                                className="nav-link btn btn-link border-0 bg-transparent"
                                                onClick={() =>
                                                    handleNavClick(item)
                                                }
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Services Dropdown */}
                                    <li className="nav-item dropdown">
                                        <button
                                            className="nav-link dropdown-toggle btn btn-link border-0 bg-transparent"
                                            data-bs-toggle="dropdown"
                                        >
                                            Browse Services
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                                            <li>
                                                <h6 className="dropdown-header">
                                                    Popular Services
                                                </h6>
                                            </li>
                                            {serviceCategories
                                                .slice(0, 6)
                                                .map((service, index) => (
                                                    <li key={index}>
                                                        <Link
                                                            to={service.path}
                                                            className="dropdown-item"
                                                        >
                                                            <i
                                                                className={`${service.icon} me-2 text-primary`}
                                                            ></i>
                                                            {service.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            <li>
                                                <hr className="dropdown-divider" />
                                            </li>
                                            <li>
                                                <Link
                                                    to="/services"
                                                    className="dropdown-item fw-semibold"
                                                >
                                                    <i className="fas fa-th-large me-2 text-primary"></i>
                                                    View All Services
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>

                                {/* Auth Buttons */}
                                <div className="d-flex align-items-center gap-3">
                                    {isAuthenticated ? (
                                        <>
                                            <Link
                                                to={getDashboardPath()}
                                                className="btn btn-outline-primary"
                                            >
                                                <i className="fas fa-tachometer-alt me-2"></i>
                                                Dashboard
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                {user?.profile_picture ? (
                                                    <img
                                                        src={
                                                            user.profile_picture
                                                        }
                                                        alt="Profile"
                                                        className="rounded-circle"
                                                        style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                        style={{
                                                            width: "32px",
                                                            height: "32px",
                                                        }}
                                                    >
                                                        {user?.first_name?.charAt(
                                                            0
                                                        )}
                                                        {user?.last_name?.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                )}
                                                <span className="ms-2 small">
                                                    Hi, {user?.first_name}!
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                className="nav-link px-3 py-2"
                                            >
                                                Sign In
                                            </Link>
                                            <button
                                                className="btn btn-primary px-4 py-2"
                                                onClick={handleGetStarted}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-rocket me-2"></i>
                                                        Get Started
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className={`navbar-toggler border-0 p-0 d-lg-none ${
                                    isMobileMenuOpen ? "active" : ""
                                }`}
                                type="button"
                                onClick={toggleMobileMenu}
                            >
                                <span className="navbar-toggler-icon-custom">
                                    <span className="hamburger-line"></span>
                                    <span className="hamburger-line"></span>
                                    <span className="hamburger-line"></span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`mobile-menu d-lg-none ${
                            isMobileMenuOpen ? "show" : ""
                        }`}
                    >
                        <div className="mobile-menu-content">
                            {/* Mobile Navigation Links */}
                            <div className="mobile-nav-section">
                                <h6 className="mobile-nav-title">Navigation</h6>
                                {publicNavItems.map((item, index) => (
                                    <button
                                        key={index}
                                        className="mobile-nav-link btn btn-link w-100 text-start"
                                        onClick={() => handleNavClick(item)}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile Services */}
                            <div className="mobile-nav-section">
                                <h6 className="mobile-nav-title">
                                    Popular Services
                                </h6>
                                <div className="row g-2">
                                    {serviceCategories
                                        .slice(0, 4)
                                        .map((service, index) => (
                                            <div key={index} className="col-6">
                                                <Link
                                                    to={service.path}
                                                    className="mobile-service-card d-block text-decoration-none p-3 border rounded text-center"
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <i
                                                        className={`${service.icon} fa-2x text-primary mb-2`}
                                                    ></i>
                                                    <div className="small fw-semibold">
                                                        {service.name}
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                </div>
                                <Link
                                    to="/services"
                                    className="btn btn-outline-primary w-100 mt-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    View All Services
                                </Link>
                            </div>

                            {/* Mobile Auth */}
                            <div className="mobile-nav-section">
                                {isAuthenticated ? (
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            {user?.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt="Profile"
                                                    className="rounded-circle me-3"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                    }}
                                                >
                                                    {user?.first_name?.charAt(
                                                        0
                                                    )}
                                                    {user?.last_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="fw-semibold">
                                                    {user?.first_name}{" "}
                                                    {user?.last_name}
                                                </div>
                                                <small className="text-muted text-capitalize">
                                                    {user?.role}
                                                </small>
                                            </div>
                                        </div>
                                        <Link
                                            to={getDashboardPath()}
                                            className="btn btn-primary btn-sm"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="d-grid gap-2">
                                        <Link
                                            to="/login"
                                            className="btn btn-outline-primary"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Sign In
                                        </Link>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                handleGetStarted();
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isLoading
                                                ? "Loading..."
                                                : "Get Started"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div
                            className="mobile-menu-overlay"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                    )}
                </nav>
            )}

            {/* Main Content */}
            <main className={`main-content ${showNavbar ? "with-navbar" : ""}`}>
                {children}
            </main>

            {/* Footer */}
            {showFooter && (
                <footer
                    className={`footer ${
                        footerVariant === "dark"
                            ? "bg-dark text-light"
                            : footerVariant === "light"
                            ? "bg-light"
                            : "bg-primary text-white"
                    }`}
                >
                    {/* Newsletter Section */}
                    <div className="newsletter-section bg-primary py-5">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6 mb-4 mb-lg-0">
                                    <h3 className="fw-bold text-white mb-2">
                                        Stay Connected
                                    </h3>
                                    <p className="text-light opacity-90 mb-0">
                                        Get updates on new services, special
                                        offers, and platform news.
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
                                                    borderRadius:
                                                        "50px 0 0 50px",
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                className="btn btn-light btn-lg px-4 fw-semibold"
                                                style={{
                                                    borderRadius:
                                                        "0 50px 50px 0",
                                                }}
                                            >
                                                Subscribe
                                            </button>
                                        </div>
                                        <small className="text-light opacity-75 mt-2 d-block">
                                            We respect your privacy. Unsubscribe
                                            at any time.
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

                                    {/* Quick Links */}
                                    <div className="d-flex gap-3">
                                        <Link
                                            to="/about"
                                            className="text-light opacity-75 text-decoration-none small"
                                        >
                                            About
                                        </Link>
                                        <Link
                                            to="/contact"
                                            className="text-light opacity-75 text-decoration-none small"
                                        >
                                            Contact
                                        </Link>
                                        <Link
                                            to="/careers"
                                            className="text-light opacity-75 text-decoration-none small"
                                        >
                                            Careers
                                        </Link>
                                        <Link
                                            to="/blog"
                                            className="text-light opacity-75 text-decoration-none small"
                                        >
                                            Blog
                                        </Link>
                                    </div>
                                </div>

                                {/* For Clients */}
                                <div className="col-lg-2 col-md-6">
                                    <h6 className="footer-title fw-bold text-white mb-3">
                                        For Clients
                                    </h6>
                                    <ul className="footer-links list-unstyled">
                                        <li className="mb-2">
                                            <Link
                                                to="/services"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Browse Services
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/how-it-works"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                How It Works
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/register?role=client"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Sign Up as Client
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/help"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Help Center
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* For Providers */}
                                <div className="col-lg-2 col-md-6">
                                    <h6 className="footer-title fw-bold text-white mb-3">
                                        For Providers
                                    </h6>
                                    <ul className="footer-links list-unstyled">
                                        <li className="mb-2">
                                            <Link
                                                to="/register?role=service_provider"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Become a Provider
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/provider-resources"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Resources
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/success-stories"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Success Stories
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/provider-support"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Support
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Company */}
                                <div className="col-lg-2 col-md-6">
                                    <h6 className="footer-title fw-bold text-white mb-3">
                                        Company
                                    </h6>
                                    <ul className="footer-links list-unstyled">
                                        <li className="mb-2">
                                            <Link
                                                to="/about"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                About Us
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/careers"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Careers
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/press"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Press
                                            </Link>
                                        </li>
                                        <li className="mb-2">
                                            <Link
                                                to="/investors"
                                                className="footer-link text-light opacity-75 text-decoration-none"
                                            >
                                                Investors
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Connect */}
                                <div className="col-lg-2 col-md-6">
                                    <h6 className="footer-title fw-bold text-white mb-3">
                                        Connect
                                    </h6>
                                    <div className="social-links mb-3">
                                        <div className="d-flex gap-2">
                                            <a
                                                href="#"
                                                className="social-link bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                <i className="fab fa-facebook-f text-white"></i>
                                            </a>
                                            <a
                                                href="#"
                                                className="social-link bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                <i className="fab fa-twitter text-white"></i>
                                            </a>
                                            <a
                                                href="#"
                                                className="social-link bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                <i className="fab fa-instagram text-white"></i>
                                            </a>
                                            <a
                                                href="#"
                                                className="social-link bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                <i className="fab fa-linkedin-in text-white"></i>
                                            </a>
                                        </div>
                                    </div>

                                    {/* App Downloads */}
                                    <div className="app-downloads">
                                        <small className="text-light opacity-75 d-block mb-2">
                                            Get the App
                                        </small>
                                        <div className="d-flex flex-column gap-1">
                                            <a
                                                href="#"
                                                className="app-download-link text-decoration-none"
                                            >
                                                <img
                                                    src="/images/app-store.png"
                                                    alt="Download on App Store"
                                                    className="img-fluid"
                                                    style={{ height: "30px" }}
                                                />
                                            </a>
                                            <a
                                                href="#"
                                                className="app-download-link text-decoration-none"
                                            >
                                                <img
                                                    src="/images/google-play.png"
                                                    alt="Get it on Google Play"
                                                    className="img-fluid"
                                                    style={{ height: "30px" }}
                                                />
                                            </a>
                                        </div>
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
                                        © {new Date().getFullYear()} HireMe. All
                                        rights reserved. Made with ❤️ for
                                        connecting people.
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-md-end gap-3 flex-wrap">
                                        <Link
                                            to="/terms"
                                            className="text-light opacity-50 text-decoration-none small"
                                        >
                                            Terms of Service
                                        </Link>
                                        <Link
                                            to="/privacy"
                                            className="text-light opacity-50 text-decoration-none small"
                                        >
                                            Privacy Policy
                                        </Link>
                                        <Link
                                            to="/cookies"
                                            className="text-light opacity-50 text-decoration-none small"
                                        >
                                            Cookie Policy
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
            )}

            {/* Custom Styles */}
            <style>{`
                .public-layout {
                    min-height: 100vh;
                }

                /* Navbar Styles */
                .navbar {
                    transition: all 0.3s ease;
                    z-index: 1030;
                }

                .navbar-transparent {
                    background: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(10px);
                }

                .navbar-scrolled {
                    background: rgba(255, 255, 255, 0.98) !important;
                    backdrop-filter: blur(15px);
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                }

                .brand-icon {
                    transition: transform 0.3s ease;
                }

                .brand-icon:hover {
                    transform: scale(1.1);
                }

                /* Mobile Menu */
                .navbar-toggler-icon-custom {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    width: 24px;
                    height: 18px;
                }

                .hamburger-line {
                    display: block;
                    height: 2px;
                    width: 100%;
                    background-color: currentColor;
                    transition: all 0.3s ease;
                }

                .navbar-toggler.active .hamburger-line:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }

                .navbar-toggler.active .hamburger-line:nth-child(2) {
                    opacity: 0;
                }

                .navbar-toggler.active .hamburger-line:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }

                .mobile-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border-top: 1px solid #dee2e6;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    z-index: 1025;
                }

                .mobile-menu.show {
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .mobile-menu-content {
                    padding: 1.5rem;
                }

                .mobile-nav-section {
                    margin-bottom: 2rem;
                }

                .mobile-nav-section:last-child {
                    margin-bottom: 0;
                }

                .mobile-nav-title {
                    color: #6c757d;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 0.5rem;
                }

                .mobile-nav-link {
                    color: #212529;
                    text-decoration: none;
                    padding: 0.75rem 0;
                    border: none;
                    transition: color 0.2s ease;
                }

                .mobile-nav-link:hover {
                    color: #0d6efd;
                }

                .mobile-service-card {
                    color: #212529;
                    transition: all 0.2s ease;
                }

                .mobile-service-card:hover {
                    color: #0d6efd;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1020;
                }

                /* Main Content */
                .main-content {
                    min-height: 100vh;
                }

                .main-content.with-navbar {
                    padding-top: 76px; /* Navbar height */
                }

                /* Navigation Links */
                .nav-link {
                    font-weight: 500;
                    transition: color 0.2s ease;
                    position: relative;
                }

                .nav-link:hover {
                    color: #0d6efd !important;
                }

                .nav-link::after {
                    content: "";
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background-color: #0d6efd;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-link:hover::after {
                    width: 80%;
                }

                /* Dropdown Menus */
                .dropdown-menu {
                    border: none;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    border-radius: 12px;
                    padding: 1rem 0;
                    margin-top: 0.5rem;
                }

                .dropdown-item {
                    padding: 0.75rem 1.5rem;
                    transition: all 0.2s ease;
                    border-radius: 0;
                }

                .dropdown-item:hover {
                    background-color: #f8f9fa;
                    color: #0d6efd;
                    transform: translateX(5px);
                }

                .dropdown-header {
                    padding: 0.5rem 1.5rem 1rem;
                    color: #6c757d;
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Button Styles */
                .btn {
                    border-radius: 50px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #0d6efd, #0056b3);
                    border: none;
                    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
                }

                .btn-outline-primary {
                    border: 2px solid #0d6efd;
                    color: #0d6efd;
                    background: transparent;
                }

                .btn-outline-primary:hover {
                    background: #0d6efd;
                    border-color: #0d6efd;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
                }

                /* Footer Styles */
                .footer {
                    margin-top: auto;
                }

                .newsletter-section {
                    background: linear-gradient(
                        135deg,
                        #0d6efd,
                        #0056b3
                    ) !important;
                }

                .footer-content {
                    background: #1a1a1a;
                }

                .footer-title {
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                }

                .footer-link {
                    transition: all 0.2s ease;
                    display: inline-block;
                }

                .footer-link:hover {
                    color: #0d6efd !important;
                    transform: translateX(5px);
                }

                .social-link {
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    transform: translateY(-2px);
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .navbar-nav {
                        margin-top: 1rem;
                    }

                    .main-content.with-navbar {
                        padding-top: 70px;
                    }

                    .mobile-menu-content {
                        padding: 1rem;
                    }

                    .newsletter-section {
                        text-align: center;
                    }

                    .newsletter-section .col-lg-6:first-child {
                        margin-bottom: 2rem;
                    }
                }

                @media (max-width: 767.98px) {
                    .brand-text {
                        font-size: 1.1rem;
                    }

                    .mobile-nav-section {
                        margin-bottom: 1.5rem;
                    }

                    .footer-content .row > div {
                        margin-bottom: 2rem;
                    }

                    .footer-content .row > div:last-child {
                        margin-bottom: 0;
                    }
                }

                @media (max-width: 575.98px) {
                    .container {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }

                    .newsletter-form .input-group {
                        flex-direction: column;
                    }

                    .newsletter-form .form-control,
                    .newsletter-form .btn {
                        border-radius: 50px !important;
                        margin-bottom: 0.5rem;
                    }

                    .footer-bottom .d-flex {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }

                /* Animation Classes */
                .fade-in {
                    animation: fadeIn 0.6s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .slide-up {
                    animation: slideUp 0.6s ease-out;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Loading States */
                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }

                /* Accessibility Improvements */
                .nav-link:focus,
                .btn:focus,
                .dropdown-item:focus {
                    outline: 2px solid #0d6efd;
                    outline-offset: 2px;
                }

                /* Dark Mode Support (Optional) */
                @media (prefers-color-scheme: dark) {
                    .navbar-transparent,
                    .navbar-scrolled {
                        background: rgba(33, 37, 41, 0.95) !important;
                    }

                    .mobile-menu {
                        background: #212529;
                        color: #fff;
                    }

                    .mobile-nav-link {
                        color: #fff;
                    }

                    .mobile-service-card {
                        color: #fff;
                        border-color: #495057;
                    }
                }

                /* Print Styles */
                @media print {
                    .navbar,
                    .footer,
                    .mobile-menu {
                        display: none !important;
                    }

                    .main-content {
                        padding-top: 0 !important;
                    }
                }

                /* High Contrast Mode */
                @media (prefers-contrast: high) {
                    .btn-primary {
                        background: #0000ff;
                        border-color: #0000ff;
                    }

                    .btn-outline-primary {
                        border-color: #0000ff;
                        color: #0000ff;
                    }

                    .nav-link::after {
                        background-color: #0000ff;
                    }
                }

                /* Reduced Motion */
                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PublicLayout;
