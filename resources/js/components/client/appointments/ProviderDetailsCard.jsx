import React from "react";
import { constructProfileImageUrl } from "../../../hooks/useServiceImages";

const ProviderDetailsCard = ({ appointment }) => {
    if (!appointment.provider) {
        return null;
    }

    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
                <h5 className="fw-bold mb-0">
                    <i className="fas fa-user me-2 text-primary"></i>
                    Service Provider
                </h5>
            </div>
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <div className="d-flex align-items-center mb-3">
                            <div className="me-3">
                                {(() => {
                                    // Use the dedicated profile image URL constructor
                                    const profileImageUrl =
                                        constructProfileImageUrl(
                                            appointment.provider
                                                ?.profile_picture
                                        );

                                    return profileImageUrl ? (
                                        <img
                                            src={profileImageUrl}
                                            alt={`${appointment.provider.first_name} ${appointment.provider.last_name}`}
                                            className="rounded-circle"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                            }}
                                            onError={(e) => {
                                                console.error(
                                                    "Provider profile image failed to load:",
                                                    profileImageUrl
                                                );
                                                // Hide failed image and show fallback
                                                e.target.style.display = "none";
                                                const fallback =
                                                    e.target.nextSibling;
                                                if (fallback) {
                                                    fallback.style.display =
                                                        "flex";
                                                }
                                            }}
                                        />
                                    ) : null;
                                })()}
                            </div>

                            <div>
                                <h6 className="fw-bold mb-1">
                                    {appointment.provider?.first_name}{" "}
                                    {appointment.provider?.last_name}
                                </h6>
                                {appointment.provider?.provider_profile
                                    ?.business_name && (
                                    <div className="text-muted small mb-1">
                                        {
                                            appointment.provider
                                                .provider_profile.business_name
                                        }
                                    </div>
                                )}
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-star text-warning me-1"></i>
                                    <span className="me-2">
                                        {appointment.provider?.provider_profile
                                            ?.average_rating || 0}
                                    </span>
                                    <span className="text-muted small">
                                        (
                                        {appointment.provider?.provider_profile
                                            ?.total_reviews || 0}{" "}
                                        reviews)
                                    </span>
                                    {appointment.provider?.provider_profile
                                        ?.verification_status ===
                                        "verified" && (
                                        <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                            <i className="fas fa-check-circle me-1"></i>
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="provider-contact">
                            {appointment.provider?.contact_number && (
                                <div className="mb-2">
                                    <i className="fas fa-phone text-muted me-2"></i>
                                    <a
                                        href={`tel:${appointment.provider.contact_number}`}
                                        className="text-decoration-none"
                                    >
                                        {appointment.provider.contact_number}
                                    </a>
                                </div>
                            )}
                            {appointment.provider?.email && (
                                <div className="mb-2">
                                    <i className="fas fa-envelope text-muted me-2"></i>
                                    <a
                                        href={`mailto:${appointment.provider.email}`}
                                        className="text-decoration-none"
                                    >
                                        {appointment.provider.email}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-4 text-end">
                        <div className="contact-actions">
                            {appointment.provider?.contact_number && (
                                <a
                                    href={`tel:${appointment.provider.contact_number}`}
                                    className="btn btn-outline-success btn-sm mb-2 w-100"
                                >
                                    <i className="fas fa-phone me-2"></i>
                                    Call Provider
                                </a>
                            )}
                            <button className="btn btn-outline-primary btn-sm w-100">
                                <i className="fas fa-comments me-2"></i>
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .provider-image {
                    transition: var(--transition);
                }
                .provider-image:hover {
                    transform: scale(1.05);
                }

                @media (max-width: 768px) {
                    .provider-avatar {
                        margin-bottom: var(--space-3);
                        text-align: center;
                    }

                    .provider-contact .mb-2 {
                        justify-content: center;
                        text-align: center;
                    }

                    .contact-actions {
                        text-align: center !important;
                        margin-top: var(--space-3);
                    }

                    .contact-actions .btn {
                        width: 100%;
                        margin-bottom: var(--space-2);
                    }

                    .contact-actions .btn:last-child {
                        margin-bottom: 0;
                    }
                }

                @media (max-width: 576px) {
                    .card-body .row {
                        text-align: center;
                    }

                    .provider-avatar img,
                    .provider-avatar > div {
                        width: 50px !important;
                        height: 50px !important;
                    }

                    .provider-contact {
                        margin-top: var(--space-3);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProviderDetailsCard;
