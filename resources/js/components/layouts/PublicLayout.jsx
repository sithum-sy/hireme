// components/layouts/PublicLayout.jsx
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
            label: "Features",
            path: "/features",
            scroll: "features",
        },
        {
            label: "About",
            path: "/about",
            scroll: "stats",
        },
        {
            label: "Reviews",
            path: "/reviews",
            scroll: "testimonials",
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
        const baseClasses = "navbar navbar-expand-lg fixed-top";

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

    // Service categories for dropdown
    const serviceCategories = [
        {
            name: "Healthcare & Care",
            icon: "fas fa-heart",
            path: "/services/healthcare",
            color: "danger",
        },
        {
            name: "Education & Tutoring",
            icon: "fas fa-graduation-cap",
            path: "/services/education",
            color: "info",
        },
        {
            name: "Home Services",
            icon: "fas fa-tools",
            path: "/services/home",
            color: "warning",
        },
        {
            name: "Transportation",
            icon: "fas fa-car",
            path: "/services/transport",
            color: "primary",
        },
        {
            name: "Cleaning Services",
            icon: "fas fa-broom",
            path: "/services/cleaning",
            color: "success",
        },
        {
            name: "Tech Support",
            icon: "fas fa-laptop-code",
            path: "/services/tech",
            color: "secondary",
        },
    ];

    return (
        <div className="public-layout">
            {/* Navigation Bar */}
            {showNavbar && (
                <nav className={getNavbarClasses()}>
                    <div className="container">
                        <div className="navbar-content">
                            {/* Brand */}
                            <Link className="navbar-brand" to="/">
                                <div className="brand-container">
                                    <img
                                        src="/images/hireme-logo.png"
                                        alt="HireMe Logo"
                                        className="brand-logo"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />
                                    <div
                                        className="brand-fallback"
                                        style={{ display: "none" }}
                                    >
                                        <div className="brand-icon">
                                            <i className="fas fa-handshake"></i>
                                        </div>
                                        <span className="brand-text">
                                            HireMe
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="navbar-desktop">
                                {/* Navigation Links */}
                                <ul className="navbar-nav">
                                    {publicNavItems.map((item, index) => (
                                        <li key={index} className="nav-item">
                                            <button
                                                className="nav-link"
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
                                            className="nav-link dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                        >
                                            Browse Services
                                        </button>
                                        <div className="dropdown-menu">
                                            <div className="dropdown-header">
                                                <h6>Popular Services</h6>
                                                <p>Find the service you need</p>
                                            </div>
                                            <div className="dropdown-content">
                                                <div className="services-grid">
                                                    {serviceCategories.map(
                                                        (service, index) => (
                                                            <Link
                                                                key={index}
                                                                to={
                                                                    service.path
                                                                }
                                                                className="service-dropdown-item"
                                                            >
                                                                <div
                                                                    className={`service-icon bg-${service.color}`}
                                                                >
                                                                    <i
                                                                        className={
                                                                            service.icon
                                                                        }
                                                                    ></i>
                                                                </div>
                                                                <div className="service-info">
                                                                    <span className="service-name">
                                                                        {
                                                                            service.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        )
                                                    )}
                                                </div>
                                                <div className="dropdown-footer">
                                                    <Link
                                                        to="/services"
                                                        className="view-all-btn"
                                                    >
                                                        <i className="fas fa-th-large me-2"></i>
                                                        View All Services
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>

                                {/* Auth Buttons */}
                                <div className="navbar-auth">
                                    {isAuthenticated ? (
                                        <div className="user-menu">
                                            <Link
                                                to={getDashboardPath()}
                                                className="btn btn-outline-primary"
                                            >
                                                <i className="fas fa-tachometer-alt me-2"></i>
                                                Dashboard
                                            </Link>
                                            <div className="user-profile">
                                                {user?.profile_picture ? (
                                                    <img
                                                        src={
                                                            user.profile_picture
                                                        }
                                                        alt="Profile"
                                                        className="user-avatar"
                                                    />
                                                ) : (
                                                    <div className="user-avatar-placeholder">
                                                        {user?.first_name?.charAt(
                                                            0
                                                        )}
                                                        {user?.last_name?.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                )}
                                                <span className="user-greeting">
                                                    Hi, {user?.first_name}!
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="auth-buttons">
                                            <Link
                                                to="/login"
                                                className="btn btn-ghost"
                                            >
                                                Sign In
                                            </Link>
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleGetStarted}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner"></span>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-rocket me-2"></i>
                                                        Get Started
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className={`navbar-toggler ${
                                    isMobileMenuOpen ? "active" : ""
                                }`}
                                type="button"
                                onClick={toggleMobileMenu}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`mobile-menu ${
                            isMobileMenuOpen ? "active" : ""
                        }`}
                    >
                        <div className="mobile-menu-content">
                            {/* Mobile Navigation Links */}
                            <div className="mobile-nav-section">
                                <h6 className="mobile-section-title">
                                    Navigation
                                </h6>
                                <div className="mobile-nav-links">
                                    {publicNavItems.map((item, index) => (
                                        <button
                                            key={index}
                                            className="mobile-nav-link"
                                            onClick={() => handleNavClick(item)}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Services */}
                            <div className="mobile-nav-section">
                                <h6 className="mobile-section-title">
                                    Popular Services
                                </h6>
                                <div className="mobile-services-grid">
                                    {serviceCategories
                                        .slice(0, 4)
                                        .map((service, index) => (
                                            <Link
                                                key={index}
                                                to={service.path}
                                                className="mobile-service-card"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                <div
                                                    className={`service-icon bg-${service.color}`}
                                                >
                                                    <i
                                                        className={service.icon}
                                                    ></i>
                                                </div>
                                                <span className="service-name">
                                                    {service.name}
                                                </span>
                                            </Link>
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
                                    <div className="mobile-user-info">
                                        <div className="user-profile-mobile">
                                            {user?.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt="Profile"
                                                    className="user-avatar-mobile"
                                                />
                                            ) : (
                                                <div className="user-avatar-placeholder-mobile">
                                                    {user?.first_name?.charAt(
                                                        0
                                                    )}
                                                    {user?.last_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="user-info-mobile">
                                                <div className="user-name">
                                                    {user?.first_name}{" "}
                                                    {user?.last_name}
                                                </div>
                                                <div className="user-role">
                                                    {user?.role}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to={getDashboardPath()}
                                            className="btn btn-primary w-100"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Go to Dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mobile-auth-buttons">
                                        <Link
                                            to="/login"
                                            className="btn btn-outline-primary w-100"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Sign In
                                        </Link>
                                        <button
                                            className="btn btn-primary w-100"
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
                <footer className="footer">
                    {/* Newsletter Section */}
                    <div className="newsletter-section">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6 mb-4 mb-lg-0">
                                    <div className="newsletter-content">
                                        <h3 className="newsletter-title">
                                            Stay in the Loop
                                        </h3>
                                        <p className="newsletter-subtitle">
                                            Get the latest updates on new
                                            services, features, and special
                                            offers.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <form className="newsletter-form">
                                        <div className="newsletter-input-group">
                                            <input
                                                type="email"
                                                className="newsletter-input"
                                                placeholder="Enter your email address"
                                            />
                                            <button
                                                type="submit"
                                                className="newsletter-btn"
                                            >
                                                Subscribe
                                            </button>
                                        </div>
                                        <small className="newsletter-privacy">
                                            We respect your privacy. Unsubscribe
                                            anytime.
                                        </small>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Footer Content */}
                    <div className="footer-content">
                        <div className="container">
                            <div className="row g-4">
                                {/* Brand Section */}
                                <div className="col-lg-4 col-md-6">
                                    <div className="footer-brand">
                                        <Link
                                            to="/"
                                            className="footer-brand-link"
                                        >
                                            <img
                                                src="/images/logo-white.png"
                                                alt="HireMe Logo"
                                                className="footer-logo"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        "none";
                                                    e.target.nextSibling.style.display =
                                                        "flex";
                                                }}
                                            />
                                            <div
                                                className="footer-brand-fallback"
                                                style={{ display: "none" }}
                                            >
                                                <div className="footer-brand-icon">
                                                    <i className="fas fa-handshake"></i>
                                                </div>
                                                <span className="footer-brand-text">
                                                    HireMe
                                                </span>
                                            </div>
                                        </Link>
                                        <p className="footer-brand-description">
                                            Connecting clients with trusted
                                            professionals across various
                                            industries. Your one-stop platform
                                            for reliable, verified service
                                            providers.
                                        </p>

                                        {/* Social Links */}
                                        <div className="social-links">
                                            <h6 className="social-title">
                                                Follow Us
                                            </h6>
                                            <div className="social-icons">
                                                {[
                                                    {
                                                        icon: "fab fa-facebook-f",
                                                        href: "#",
                                                        color: "#1877f2",
                                                    },
                                                    {
                                                        icon: "fab fa-twitter",
                                                        href: "#",
                                                        color: "#1da1f2",
                                                    },
                                                    {
                                                        icon: "fab fa-instagram",
                                                        href: "#",
                                                        color: "#e4405f",
                                                    },
                                                    {
                                                        icon: "fab fa-linkedin-in",
                                                        href: "#",
                                                        color: "#0077b5",
                                                    },
                                                ].map((social, index) => (
                                                    <a
                                                        key={index}
                                                        href={social.href}
                                                        className="social-link"
                                                        style={{
                                                            "--social-color":
                                                                social.color,
                                                        }}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i
                                                            className={
                                                                social.icon
                                                            }
                                                        ></i>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* For Clients */}
                                <div className="col-lg-2 col-md-6">
                                    <div className="footer-section">
                                        <h6 className="footer-section-title">
                                            For Clients
                                        </h6>
                                        <ul className="footer-links">
                                            <li>
                                                <Link to="/services">
                                                    Browse Services
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/#features">
                                                    How It Works
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/register?role=client">
                                                    Sign Up as Client
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/help">
                                                    Help Center
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/safety">
                                                    Safety Guidelines
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* For Providers */}
                                <div className="col-lg-2 col-md-6">
                                    <div className="footer-section">
                                        <h6 className="footer-section-title">
                                            For Providers
                                        </h6>
                                        <ul className="footer-links">
                                            <li>
                                                <Link to="/register?role=service_provider">
                                                    Become a Provider
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/provider-resources">
                                                    Resources
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/success-stories">
                                                    Success Stories
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/provider-support">
                                                    Support
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/pricing">
                                                    Pricing
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Company */}
                                <div className="col-lg-2 col-md-6">
                                    <div className="footer-section">
                                        <h6 className="footer-section-title">
                                            Company
                                        </h6>
                                        <ul className="footer-links">
                                            <li>
                                                <Link to="/about">
                                                    About Us
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/careers">
                                                    Careers
                                                </Link>
                                            </li>
                                            <li>
                                                <Link to="/press">Press</Link>
                                            </li>
                                            <li>
                                                <Link to="/blog">Blog</Link>
                                            </li>
                                            <li>
                                                <Link to="/contact">
                                                    Contact
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Connect & Download */}
                                <div className="col-lg-2 col-md-6">
                                    <div className="footer-section">
                                        <h6 className="footer-section-title">
                                            Get the App
                                        </h6>
                                        <div className="app-downloads">
                                            <a
                                                href="#"
                                                className="app-download-btn"
                                            >
                                                <img
                                                    src="/images/app-store.svg"
                                                    alt="Download on App Store"
                                                />
                                            </a>
                                            <a
                                                href="#"
                                                className="app-download-btn"
                                            >
                                                <img
                                                    src="/images/google-play.svg"
                                                    alt="Get it on Google Play"
                                                />
                                            </a>
                                        </div>

                                        <div className="trust-badges">
                                            <h6 className="trust-title">
                                                Security & Trust
                                            </h6>
                                            <div className="trust-items">
                                                <div className="trust-item">
                                                    <i className="fas fa-shield-alt"></i>
                                                    <span>SSL Secured</span>
                                                </div>
                                                <div className="trust-item">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>
                                                        Verified Platform
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <div className="container">
                            <div className="footer-bottom-content">
                                <div className="footer-copyright">
                                    <p>
                                        © {new Date().getFullYear()} HireMe. All
                                        rights reserved. Made with ❤️ for
                                        connecting people.
                                    </p>
                                </div>
                                <div className="footer-legal">
                                    <Link to="/terms">Terms of Service</Link>
                                    <Link to="/privacy">Privacy Policy</Link>
                                    <Link to="/cookies">Cookie Policy</Link>
                                    <Link to="/accessibility">
                                        Accessibility
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            <style jsx>{`
                .public-layout {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                /* Navbar Styles */
                .navbar {
                    padding: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1050;
                }

                .navbar-transparent {
                    background: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .navbar-scrolled {
                    background: rgba(255, 255, 255, 0.98) !important;
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    box-shadow: 0 2px 40px rgba(0, 0, 0, 0.1);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }

                .navbar-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 0;
                    width: 100%;
                }

                .navbar-scrolled .navbar-content {
                    padding: 0.75rem 0;
                }

                /* Brand Styles */
                .navbar-brand {
                    text-decoration: none;
                    transition: transform 0.3s ease;
                }

                .navbar-brand:hover {
                    transform: scale(1.02);
                }

                .brand-container {
                    display: flex;
                    align-items: center;
                }

                .brand-logo {
                    height: 50px;
                    width: auto;
                    object-fit: contain;
                }

                .brand-fallback {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .brand-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }

                .brand-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    letter-spacing: -0.02em;
                }

                /* Desktop Navigation */
                .navbar-desktop {
                    display: none;
                    align-items: center;
                    gap: 2rem;
                }

                @media (min-width: 992px) {
                    .navbar-desktop {
                        display: flex;
                    }
                }

                .navbar-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .nav-item {
                    position: relative;
                }

                .nav-link {
                    background: none;
                    border: none;
                    color: #374151;
                    font-weight: 500;
                    font-size: 0.95rem;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    position: relative;
                    text-decoration: none;
                }

                .nav-link:hover {
                    color: #4a90e2;
                    background: rgba(74, 144, 226, 0.05);
                }

                .nav-link::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: #4a90e2;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-link:hover::after {
                    width: 70%;
                }

                /* Dropdown Styles */
                .dropdown {
                    position: relative;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    padding: 0;
                    margin-top: 0.5rem;
                    min-width: 480px;
                    z-index: 1000;
                    overflow: hidden;
                }

                .dropdown-header {
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #f1f5f9;
                }

                .dropdown-header h6 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.25rem;
                }

                .dropdown-header p {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .dropdown-content {
                    padding: 1.5rem;
                }

                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .service-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #374151;
                    transition: all 0.2s ease;
                }

                .service-dropdown-item:hover {
                    background: #f8fafc;
                    color: #4a90e2;
                    transform: translateX(4px);
                }

                .service-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.875rem;
                    flex-shrink: 0;
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

                .service-name {
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .dropdown-footer {
                    padding-top: 1rem;
                    border-top: 1px solid #f1f5f9;
                }

                .view-all-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 0.75rem;
                    background: #4a90e2;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .view-all-btn:hover {
                    background: #357abd;
                    color: white;
                    transform: translateY(-1px);
                }

                /* Auth Buttons */
                .navbar-auth {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .user-avatar,
                .user-avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .user-avatar-placeholder {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.75rem;
                }

                .user-greeting {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                }

                .auth-buttons {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .btn {
                    padding: 0.5rem 1.25rem;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-ghost {
                    background: transparent;
                    color: #374151;
                }

                .btn-ghost:hover {
                    color: #4a90e2;
                    background: rgba(74, 144, 226, 0.05);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    color: white;
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
                }

                .btn-outline-primary {
                    background: transparent;
                    color: #4a90e2;
                    border: 1px solid #4a90e2;
                }

                .btn-outline-primary:hover {
                    background: #4a90e2;
                    color: white;
                    transform: translateY(-1px);
                }

                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* Mobile Toggle */
                .navbar-toggler {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    gap: 4px;
                    transition: all 0.3s ease;
                }

                @media (min-width: 992px) {
                    .navbar-toggler {
                        display: none;
                    }
                }

                .navbar-toggler span {
                    display: block;
                    height: 2px;
                    width: 100%;
                    background: #374151;
                    border-radius: 1px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: center;
                }

                .navbar-toggler.active span:nth-child(1) {
                    transform: rotate(45deg) translate(4px, 4px);
                }

                .navbar-toggler.active span:nth-child(2) {
                    opacity: 0;
                    transform: translateX(20px);
                }

                .navbar-toggler.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(4px, -4px);
                }

                /* Mobile Menu */
                .mobile-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                    transform: translateY(-20px);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                }

                .mobile-menu.active {
                    transform: translateY(0);
                    opacity: 1;
                    visibility: visible;
                }

                .mobile-menu-content {
                    padding: 2rem 1.5rem;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .mobile-nav-section {
                    margin-bottom: 2rem;
                }

                .mobile-nav-section:last-child {
                    margin-bottom: 0;
                }

                .mobile-section-title {
                    color: #6b7280;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .mobile-nav-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .mobile-nav-link {
                    background: none;
                    border: none;
                    color: #374151;
                    font-weight: 500;
                    padding: 0.75rem 0;
                    text-align: left;
                    transition: color 0.2s ease;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .mobile-nav-link:hover {
                    color: #4a90e2;
                }

                .mobile-services-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .mobile-service-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #374151;
                    transition: all 0.2s ease;
                    text-align: center;
                }

                .mobile-service-card:hover {
                    color: #4a90e2;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .mobile-service-card .service-name {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .mobile-user-info {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .user-profile-mobile {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-avatar-mobile,
                .user-avatar-placeholder-mobile {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .user-avatar-placeholder-mobile {
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .user-info-mobile {
                    flex: 1;
                }

                .user-name {
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.25rem;
                }

                .user-role {
                    color: #6b7280;
                    font-size: 0.875rem;
                    text-transform: capitalize;
                }

                .mobile-auth-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .mobile-auth-buttons .btn {
                    width: 100%;
                    justify-content: center;
                }

                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                }

                /* Main Content */
                .main-content {
                    flex: 1;
                }

                .main-content.with-navbar {
                    padding-top: 80px;
                }

                /* Footer Styles */
                .footer {
                    margin-top: auto;
                    background: #1a202c;
                    color: white;
                }

                /* Newsletter Section */
                .newsletter-section {
                    background: linear-gradient(
                        135deg,
                        #4a90e2 0%,
                        #357abd 100%
                    );
                    padding: 4rem 0;
                    position: relative;
                    overflow: hidden;
                }

                .newsletter-section::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                            circle at 20% 80%,
                            rgba(255, 255, 255, 0.1) 0%,
                            transparent 50%
                        ),
                        radial-gradient(
                            circle at 80% 20%,
                            rgba(255, 255, 255, 0.05) 0%,
                            transparent 50%
                        );
                    pointer-events: none;
                }

                .newsletter-content {
                    position: relative;
                    z-index: 1;
                }

                .newsletter-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .newsletter-subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1.125rem;
                    margin: 0;
                }

                .newsletter-form {
                    position: relative;
                    z-index: 1;
                }

                .newsletter-input-group {
                    display: flex;
                    background: white;
                    border-radius: 12px;
                    padding: 0.25rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    margin-bottom: 0.75rem;
                }

                .newsletter-input {
                    flex: 1;
                    border: none;
                    padding: 1rem 1.25rem;
                    font-size: 1rem;
                    background: transparent;
                    border-radius: 8px;
                    outline: none;
                }

                .newsletter-input::placeholder {
                    color: #9ca3af;
                }

                .newsletter-btn {
                    background: #4a90e2;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .newsletter-btn:hover {
                    background: #357abd;
                    transform: translateY(-1px);
                }

                .newsletter-privacy {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.875rem;
                    text-align: center;
                    display: block;
                }

                /* Footer Content */
                .footer-content {
                    padding: 4rem 0 2rem;
                    background: #1a202c;
                }

                .footer-brand {
                    margin-bottom: 2rem;
                }

                .footer-brand-link {
                    display: inline-flex;
                    align-items: center;
                    text-decoration: none;
                    margin-bottom: 1rem;
                }

                .footer-logo {
                    height: 40px;
                    width: auto;
                    object-fit: contain;
                    filter: brightness(0) invert(1);
                }

                .footer-brand-fallback {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .footer-brand-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }

                .footer-brand-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }

                .footer-brand-description {
                    color: #9ca3af;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    max-width: 90%;
                }

                .social-links {
                    margin-bottom: 1rem;
                }

                .social-title {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .social-icons {
                    display: flex;
                    gap: 0.75rem;
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .social-link::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--social-color);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .social-link:hover::before {
                    opacity: 1;
                }

                .social-link i {
                    position: relative;
                    z-index: 1;
                }

                .social-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                /* Footer Sections */
                .footer-section {
                    margin-bottom: 2rem;
                }

                .footer-section-title {
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    position: relative;
                    padding-bottom: 0.5rem;
                }

                .footer-section-title::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 30px;
                    height: 2px;
                    background: #4a90e2;
                    border-radius: 1px;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-links li {
                    margin-bottom: 0.75rem;
                }

                .footer-links a {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    display: inline-block;
                }

                .footer-links a:hover {
                    color: #4a90e2;
                    transform: translateX(4px);
                }

                /* App Downloads */
                .app-downloads {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .app-download-btn {
                    display: block;
                    transition: transform 0.2s ease;
                }

                .app-download-btn:hover {
                    transform: translateY(-2px);
                }

                .app-download-btn img {
                    height: 40px;
                    width: auto;
                    object-fit: contain;
                }

                /* Trust Badges */
                .trust-badges {
                    margin-top: 1.5rem;
                }

                .trust-title {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .trust-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .trust-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #9ca3af;
                    font-size: 0.75rem;
                }

                .trust-item i {
                    color: #10b981;
                    width: 16px;
                }

                /* Footer Bottom */
                .footer-bottom {
                    background: #111827;
                    padding: 1.5rem 0;
                    border-top: 1px solid #374151;
                }

                .footer-bottom-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .footer-copyright p {
                    color: #9ca3af;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .footer-legal {
                    display: flex;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .footer-legal a {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: color 0.2s ease;
                }

                .footer-legal a:hover {
                    color: white;
                }

                /* Responsive Design */
                @media (max-width: 991.98px) {
                    .main-content.with-navbar {
                        padding-top: 70px;
                    }

                    .newsletter-section {
                        padding: 3rem 0;
                        text-align: center;
                    }

                    .newsletter-title {
                        font-size: 1.75rem;
                    }

                    .dropdown-menu {
                        min-width: 320px;
                    }

                    .services-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 767.98px) {
                    .navbar-content {
                        padding: 0.75rem 0;
                    }

                    .newsletter-input-group {
                        flex-direction: column;
                        gap: 0.5rem;
                        padding: 0.75rem;
                    }

                    .newsletter-btn {
                        width: 100%;
                    }

                    .mobile-services-grid {
                        grid-template-columns: 1fr;
                    }

                    .footer-content {
                        padding: 3rem 0 1.5rem;
                    }

                    .footer-bottom-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .footer-legal {
                        justify-content: center;
                    }

                    .social-icons {
                        justify-content: center;
                    }
                }

                @media (max-width: 575.98px) {
                    .newsletter-section {
                        padding: 2rem 0;
                    }

                    .newsletter-title {
                        font-size: 1.5rem;
                    }

                    .footer-legal {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .brand-logo,
                    .footer-logo {
                        height: 32px;
                    }
                }

                /* Accessibility */
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .navbar-transparent,
                    .navbar-scrolled {
                        background: rgba(17, 24, 39, 0.95) !important;
                        border-bottom-color: rgba(55, 65, 81, 0.3);
                    }

                    .navbar-transparent .nav-link,
                    .navbar-scrolled .nav-link {
                        color: #f9fafb;
                    }

                    .mobile-menu {
                        background: #111827;
                    }

                    .mobile-nav-link {
                        color: #f9fafb;
                    }
                }
            `}</style>
        </div>
    );
};

export default PublicLayout;
