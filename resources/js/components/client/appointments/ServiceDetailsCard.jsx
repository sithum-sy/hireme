import React from "react";
import { useServicePrimaryImage } from "../../../hooks/useServiceImages";

const ServiceDetailsCard = ({ appointment }) => {
    if (!appointment.service) {
        return null;
    }

    const serviceImage = useServicePrimaryImage(appointment.service);

    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
                <h5 className="fw-bold mb-0">
                    <i className="fas fa-concierge-bell me-2 text-primary"></i>
                    Service Details
                </h5>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className={serviceImage ? "col-md-8" : "col-12"}>
                        <h6 className="fw-bold mb-2">
                            {appointment.service.title}
                        </h6>
                        <p className="text-muted mb-3">
                            {appointment.service.description ||
                                "Service description not available"}
                        </p>

                        {appointment.service.category && (
                            <div className="mb-3">
                                <span
                                    className={`badge bg-${
                                        appointment.service.category.color ||
                                        "primary"
                                    } bg-opacity-10 text-${
                                        appointment.service.category.color ||
                                        "primary"
                                    }`}
                                >
                                    <i
                                        className={`${
                                            appointment.service.category.icon ||
                                            "fas fa-tag"
                                        } me-1`}
                                    ></i>
                                    {appointment.service.category.name}
                                </span>
                            </div>
                        )}

                        <div className="service-meta">
                            <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-clock text-muted me-2"></i>
                                <span>
                                    Duration: {appointment.duration_hours} hour
                                    {appointment.duration_hours > 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    {serviceImage && (
                        <div className="col-md-4 text-center">
                            <img
                                src={serviceImage}
                                alt={appointment.service.title}
                                className="img-fluid rounded"
                                style={{
                                    maxHeight: "120px",
                                    objectFit: "cover",
                                }}
                                onError={(e) => {
                                    // Hide image if it fails to load
                                    e.target.closest('.col-md-4').style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .card-body .row {
                        text-align: center;
                    }

                    .card-body .col-md-8 {
                        margin-bottom: var(--space-3);
                    }

                    .service-meta {
                        justify-content: center;
                    }
                }

                @media (max-width: 576px) {
                    .card-body {
                        padding: var(--space-3);
                    }

                    .card-body h6 {
                        font-size: var(--text-base);
                    }

                    .service-meta .d-flex {
                        justify-content: center;
                    }

                    .badge {
                        font-size: var(--text-xs);
                    }
                }
            `}</style>
        </div>
    );
};

export default ServiceDetailsCard;