import React from "react";

const AuthLayout = ({ children, showBranding = true }) => {
    return (
        <div className="min-vh-100 d-flex">
            {/* Left Panel - Branding (Hidden on mobile) */}
            {showBranding && (
                <div className="d-none d-lg-flex col-lg-6 position-relative overflow-hidden">
                    {/* Background with gradient */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                    ></div>

                    {/* Pattern overlay */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            opacity: 0.3,
                        }}
                    ></div>

                    {/* Content */}
                    <div
                        className="position-relative d-flex flex-column justify-content-center text-white p-5"
                        style={{ zIndex: 10 }}
                    >
                        <div style={{ maxWidth: "400px" }}>
                            {/* Logo */}
                            <div className="d-flex align-items-center mb-4">
                                <div
                                    className="d-flex align-items-center justify-content-center me-3 text-white"
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.2)",
                                        borderRadius: "16px",
                                        backdropFilter: "blur(10px)",
                                    }}
                                >
                                    <i className="fas fa-handshake fa-2x"></i>
                                </div>
                                <h1 className="h2 fw-bold mb-0">HireMe</h1>
                            </div>

                            {/* Heading */}
                            <h2 className="display-6 fw-bold mb-4 lh-sm">
                                Connect with Trusted Professionals
                            </h2>

                            {/* Description */}
                            <p className="fs-5 mb-4 opacity-90 lh-base">
                                Find skilled service providers for all your
                                needs. From home repairs to tutoring, we connect
                                you with verified professionals who deliver
                                quality work.
                            </p>

                            {/* Features */}
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-3"
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            backgroundColor: "#10b981",
                                            borderRadius: "50%",
                                        }}
                                    ></div>
                                    <span className="opacity-90">
                                        Verified Service Providers
                                    </span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-3"
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            backgroundColor: "#10b981",
                                            borderRadius: "50%",
                                        }}
                                    ></div>
                                    <span className="opacity-90">
                                        Secure Payment Processing
                                    </span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-3"
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            backgroundColor: "#10b981",
                                            borderRadius: "50%",
                                        }}
                                    ></div>
                                    <span className="opacity-90">
                                        24/7 Customer Support
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Panel - Form */}
            <div
                className={`${
                    showBranding ? "d-lg-flex col-lg-6" : ""
                } w-100 d-flex align-items-center justify-content-center p-4`}
            >
                <div className="w-100" style={{ maxWidth: "400px" }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
