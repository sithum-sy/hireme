import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navbarCollapseRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                navbarCollapseRef.current &&
                !navbarCollapseRef.current.contains(event.target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    const scrollToSection = (sectionId) => {
        if (location.pathname !== "/") {
            // If not on home page, navigate to home first
            window.location.href = `/#${sectionId}`;
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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav
            className={`navbar navbar-expand-lg fixed-top transition-navbar ${
                isScrolled ? "navbar-scrolled" : "navbar-transparent"
            }`}
        >
            <div className="container">
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

                {/* Mobile Menu Toggle Button */}
                <button
                    className={`navbar-toggler border-0 p-0 ${
                        isMobileMenuOpen ? "active" : ""
                    }`}
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-controls="navbarNav"
                    aria-expanded={isMobileMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon-custom">
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </span>
                </button>

                {/* Collapsible Content */}
                <div
                    className={`collapse navbar-collapse ${
                        isMobileMenuOpen ? "show" : ""
                    }`}
                    id="navbarNav"
                    ref={navbarCollapseRef}
                >
                    {/* Navigation Links */}
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link border-0 bg-transparent text-start w-100"
                                onClick={() => scrollToSection("services")}
                            >
                                Services
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link border-0 bg-transparent text-start w-100"
                                onClick={() => scrollToSection("how-it-works")}
                            >
                                How It Works
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link border-0 bg-transparent text-start w-100"
                                onClick={() => scrollToSection("reviews")}
                            >
                                Reviews
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link btn btn-link border-0 bg-transparent text-start w-100"
                                onClick={() => scrollToSection("stats")}
                            >
                                About
                            </button>
                        </li>
                    </ul>

                    {/* Auth Buttons */}
                    <div className="navbar-nav">
                        <div className="nav-auth-buttons d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                            <Link
                                className="nav-link px-3 py-2 text-center"
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                className="btn btn-primary px-4 py-2 text-center"
                                to="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="mobile-menu-overlay d-lg-none"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
