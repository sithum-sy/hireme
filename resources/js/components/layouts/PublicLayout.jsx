import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicLayout = ({
    children,
    showNavbar = true,
    showFooter = true,
    navbarVariant = "transparent",
    footerVariant = "dark",
}) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // State management
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Set public body class
    useEffect(() => {
        document.body.className = "public-layout";
        return () => {
            document.body.className = "";
        };
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        if (navbarVariant === "transparent") {
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [navbarVariant]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

    // Navigation items
    const publicNavItems = [
        {
            label: "Services",
            path: "/client/services",
            icon: "fas fa-concierge-bell",
        },
        {
            label: "Features",
            path: "/#features",
            icon: "fas fa-star",
            scrollTo: true,
        },
        {
            label: "About",
            path: "/#about",
            icon: "fas fa-info-circle",
            scrollTo: true,
        },
        {
            label: "Reviews",
            path: "/#testimonials",
            icon: "fas fa-heart",
            scrollTo: true,
        },
        {
            label: "Contact",
            path: "/#contact",
            icon: "fas fa-envelope",
            scrollTo: true,
        },
    ];

    // Service categories
    const serviceCategories = [
        {
            name: "Home & Garden",
            icon: "fas fa-home",
            path: "/services/home-garden",
            color: "success",
            description: "Cleaning, gardening, repairs",
        },
        {
            name: "Health & Wellness",
            icon: "fas fa-heartbeat",
            path: "/services/health-wellness",
            color: "danger",
            description: "Healthcare, fitness, therapy",
        },
        {
            name: "Education & Skills",
            icon: "fas fa-graduation-cap",
            path: "/services/education",
            color: "info",
            description: "Tutoring, training, coaching",
        },
        {
            name: "Technology",
            icon: "fas fa-laptop-code",
            path: "/services/technology",
            color: "primary",
            description: "IT support, development, design",
        },
        {
            name: "Business Services",
            icon: "fas fa-briefcase",
            path: "/services/business",
            color: "warning",
            description: "Consulting, marketing, finance",
        },
        {
            name: "Creative Services",
            icon: "fas fa-palette",
            path: "/services/creative",
            color: "primary",
            description: "Design, writing, photography",
        },
    ];

    // Get dashboard path
    const getDashboardPath = () => {
        if (!isAuthenticated || !user) return "/login";

        const roleRoutes = {
            admin: "/admin/dashboard",
            staff: "/staff/dashboard",
            service_provider: "/provider/dashboard",
            client: "/client/dashboard",
        };

        return roleRoutes[user.role] || "/client/dashboard";
    };

    // Handle auth actions
    const handleGetStarted = () => {
        setIsLoading(true);
        setTimeout(() => {
            navigate("/register");
            setIsLoading(false);
        }, 300);
    };

    // Handle navigation with scroll
    const handleNavClick = (item, e) => {
        if (item.scrollTo && location.pathname === "/") {
            e.preventDefault();
            const targetId = item.path.split("#")[1];
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    // Get navbar classes
    const getNavbarClasses = () => {
        const baseClasses = "modern-navbar";

        if (navbarVariant === "transparent") {
            return `${baseClasses} ${isScrolled ? "scrolled" : "transparent"}`;
        }

        return `${baseClasses} ${navbarVariant}`;
    };

    return (
        <div className="modern-public-layout">
            {/* Navigation */}
            {showNavbar && (
                <nav className={getNavbarClasses()}>
                    <div className="nav-container">
                        <div className="nav-content">
                            {/* Brand */}
                            <Link to="/" className="nav-brand">
                                <div className="brand-logo">
                                    <img
                                        src="/images/hireme-logo.png"
                                        alt="HireMe"
                                        className="logo-img"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />
                                    <div
                                        className="logo-fallback"
                                        style={{ display: "none" }}
                                    >
                                        <div className="logo-icon">
                                            <i className="fas fa-handshake"></i>
                                        </div>
                                        <span className="logo-text">
                                            HireMe
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="nav-desktop">
                                <div className="nav-links">
                                    {publicNavItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            to={item.path}
                                            className="nav-link"
                                            onClick={(e) => handleNavClick(item, e)}
                                        >
                                            <i
                                                className={`${item.icon} nav-icon`}
                                            ></i>
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}

                                    {/* Services Dropdown */}
                                    {/* <div className="nav-dropdown">
                                        <button
                                            className="nav-link dropdown-trigger"
                                            onClick={() =>
                                                setDropdownOpen(!dropdownOpen)
                                            }
                                        >
                                            <i className="fas fa-th-large nav-icon"></i>
                                            <span>Browse Services</span>
                                            <i
                                                className={`fas fa-chevron-down dropdown-arrow ${
                                                    dropdownOpen ? "open" : ""
                                                }`}
                                            ></i>
                                        </button>

                                        {dropdownOpen && (
                                            <div className="dropdown-menu">
                                                <div className="dropdown-header">
                                                    <h6>Service Categories</h6>
                                                    <p>
                                                        Find the perfect service
                                                        for your needs
                                                    </p>
                                                </div>

                                                <div className="dropdown-grid">
                                                    {serviceCategories.map(
                                                        (category, index) => (
                                                            <Link
                                                                key={index}
                                                                to={
                                                                    category.path
                                                                }
                                                                className="dropdown-item"
                                                                onClick={() =>
                                                                    setDropdownOpen(
                                                                        false
                                                                    )
                                                                }
                                                            >
                                                                <div
                                                                    className={`category-icon ${category.color}`}
                                                                >
                                                                    <i
                                                                        className={
                                                                            category.icon
                                                                        }
                                                                    ></i>
                                                                </div>
                                                                <div className="category-info">
                                                                    <h6>
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </h6>
                                                                    <p>
                                                                        {
                                                                            category.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        )
                                                    )}
                                                </div>

                                                <div className="dropdown-footer">
                                                    <Link
                                                        to="/services"
                                                        className="view-all-services"
                                                    >
                                                        <i className="fas fa-arrow-right"></i>
                                                        View All Services
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div> */}
                                </div>

                                {/* Auth Section */}
                                <div className="nav-auth">
                                    {isAuthenticated ? (
                                        <div className="user-section">
                                            <Link
                                                to={getDashboardPath()}
                                                className="dashboard-btn"
                                            >
                                                <i className="fas fa-tachometer-alt"></i>
                                                <span>Dashboard</span>
                                            </Link>
                                            <div className="user-avatar">
                                                {user?.profile_picture ? (
                                                    <img
                                                        src={
                                                            user.profile_picture
                                                        }
                                                        alt="Profile"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user?.first_name?.[0]}
                                                        {user?.last_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="auth-buttons">
                                            <Link
                                                to="/login"
                                                className="btn btn-secondary"
                                            >
                                                <i className="fas fa-sign-in-alt"></i>
                                                <span>Sign In</span>
                                            </Link>
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleGetStarted}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <div className="loading-spinner"></div>
                                                ) : (
                                                    <i className="fas fa-rocket"></i>
                                                )}
                                                <span>
                                                    {isLoading
                                                        ? "Loading..."
                                                        : "Get Started"}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className={`mobile-menu-btn ${
                                    isMobileMenuOpen ? "active" : ""
                                }`}
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
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
                        <div className="mobile-content">
                            <div className="mobile-section">
                                <h6>HireMe</h6>
                                {publicNavItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.path}
                                        className="mobile-link"
                                        onClick={(e) => {
                                            handleNavClick(item, e);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <i className={item.icon}></i>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* <div className="mobile-section">
                                <h6>Popular Services</h6>
                                <div className="mobile-services">
                                    {serviceCategories
                                        .slice(0, 4)
                                        .map((category, index) => (
                                            <Link
                                                key={index}
                                                to={category.path}
                                                className="mobile-service"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                <div
                                                    className={`service-icon ${category.color}`}
                                                >
                                                    <i
                                                        className={
                                                            category.icon
                                                        }
                                                    ></i>
                                                </div>
                                                <span>{category.name}</span>
                                            </Link>
                                        ))}
                                </div>
                            </div> */}

                            <div className="mobile-section">
                                {isAuthenticated ? (
                                    <div className="mobile-user">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user?.profile_picture ? (
                                                    <img
                                                        src={
                                                            user.profile_picture
                                                        }
                                                        alt="Profile"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user?.first_name?.[0]}
                                                        {user?.last_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <h6>
                                                    {user?.first_name}{" "}
                                                    {user?.last_name}
                                                </h6>
                                                <p>{user?.role}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to={getDashboardPath()}
                                            className="mobile-dashboard-btn"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <i className="fas fa-tachometer-alt"></i>
                                            <span>Dashboard</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="mobile-auth">
                                        <Link
                                            to="/login"
                                            className="mobile-btn secondary"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <i className="fas fa-sign-in-alt"></i>
                                            <span>Sign In</span>
                                        </Link>
                                        <button
                                            className="mobile-btn primary"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                handleGetStarted();
                                            }}
                                        >
                                            <i className="fas fa-rocket"></i>
                                            <span>Get Started</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Overlay */}
                    {isMobileMenuOpen && (
                        <div
                            className="mobile-overlay"
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
                <footer className="modern-footer">
                    {/* Newsletter Section */}
                    <div className="newsletter-section">
                        <div className="newsletter-container">
                            <div className="newsletter-content">
                                <div className="newsletter-text">
                                    <h3>Stay Connected</h3>
                                    <p>
                                        Get updates on new services, features,
                                        and exclusive offers
                                    </p>
                                </div>
                                <form className="newsletter-form">
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            className="newsletter-input"
                                        />
                                        <button
                                            type="submit"
                                            className="newsletter-btn"
                                        >
                                            <i className="fas fa-paper-plane"></i>
                                            <span>Subscribe</span>
                                        </button>
                                    </div>
                                    <p className="privacy-text">
                                        We respect your privacy. Unsubscribe
                                        anytime.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Footer Content */}
                    <div className="footer-content">
                        <div className="footer-container">
                            <div className="footer-grid">
                                {/* Brand Section */}
                                <div className="footer-brand">
                                    <Link to="/" className="footer-logo">
                                        <img
                                            src="/images/hireme-logo.png"
                                            alt="HireMe"
                                            className="logo-img"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display =
                                                    "flex";
                                            }}
                                        />
                                        <div
                                            className="logo-fallback"
                                            style={{ display: "none" }}
                                        >
                                            <div className="logo-icon">
                                                <i className="fas fa-handshake"></i>
                                            </div>
                                            <span className="logo-text">
                                                HireMe
                                            </span>
                                        </div>
                                    </Link>
                                    <p className="brand-description">
                                        Connecting clients with trusted
                                        professionals across various industries.
                                        Your one-stop platform for reliable,
                                        verified service providers.
                                    </p>
                                    <div className="social-links">
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
                                                    "--hover-color":
                                                        social.color,
                                                }}
                                            >
                                                <i className={social.icon}></i>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="footer-section">
                                    <h6>For Clients</h6>
                                    <ul>
                                        <li>
                                            <Link to="/services">
                                                Browse Services
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/features">
                                                How It Works
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/register?role=client">
                                                Sign Up
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/help">Help Center</Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className="footer-section">
                                    <h6>For Providers</h6>
                                    <ul>
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
                                            <Link to="/pricing">Pricing</Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className="footer-section">
                                    <h6>Company</h6>
                                    <ul>
                                        <li>
                                            <Link to="/about">About Us</Link>
                                        </li>
                                        <li>
                                            <Link to="/careers">Careers</Link>
                                        </li>
                                        <li>
                                            <Link to="/contact">Contact</Link>
                                        </li>
                                        <li>
                                            <Link to="/blog">Blog</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <div className="footer-container">
                            <div className="footer-bottom-content">
                                <p>
                                    © {new Date().getFullYear()} HireMe. All
                                    rights reserved.
                                </p>
                                <div className="legal-links">
                                    <Link to="/terms">Terms</Link>
                                    <Link to="/privacy">Privacy</Link>
                                    <Link to="/cookies">Cookies</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default PublicLayout;
