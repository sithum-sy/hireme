import React from "react";

const ServiceStats = ({ service }) => {
    // Calculate conversion rate from real data
    const conversionRate =
        service.views_count > 0
            ? ((service.bookings_count / service.views_count) * 100).toFixed(1)
            : 0;

    // Calculate average earnings per booking
    const avgEarningsPerBooking =
        service.bookings_count > 0
            ? (service.total_earnings / service.bookings_count).toFixed(0)
            : 0;

    // Format rating display
    const formatRating = (rating) => {
        const numericRating = parseFloat(rating) || 0;
        return numericRating > 0 ? numericRating.toFixed(1) : "N/A";
    };

    // Get status based on service activity
    const getStatusColor = (isActive) => {
        return isActive ? "success" : "secondary";
    };

    // Get performance tips based on real metrics
    const getPerformanceTips = () => {
        const tips = [];

        if (service.views_count < 50) {
            tips.push({
                icon: "fas fa-search",
                color: "info",
                text: "Add more keywords to your description to improve visibility in search results.",
            });
        }

        if (service.service_images && service.service_images.length < 3) {
            tips.push({
                icon: "fas fa-camera",
                color: "primary",
                text: "Add more high-quality images to showcase your work and attract more clients.",
            });
        }

        if (service.average_rating < 4.5 && service.bookings_count > 5) {
            tips.push({
                icon: "fas fa-star",
                color: "warning",
                text: "Focus on delivering exceptional service to improve your rating and attract more bookings.",
            });
        }

        if (conversionRate < 5 && service.views_count > 50) {
            tips.push({
                icon: "fas fa-dollar-sign",
                color: "success",
                text: "Your service gets good views but low bookings. Consider adjusting your pricing or adding more details.",
            });
        }

        // Always show these general tips
        tips.push({
            icon: "fas fa-clock",
            color: "secondary",
            text: "Respond to booking requests within 2 hours to improve your response rate.",
        });

        tips.push({
            icon: "fas fa-map-marker-alt",
            color: "danger",
            text: "Expand your service areas to reach more potential clients in nearby locations.",
        });

        return tips;
    };

    return (
        <>
            {/* Performance Cards - Responsive Grid */}
            <div className="row g-3 mb-4">
                {/* Views Card */}
                <div className="col-lg-12 col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="text-info">
                                    <i className="fas fa-eye fa-lg"></i>
                                </div>
                                <span
                                    className={`badge bg-${getStatusColor(
                                        service.is_active
                                    )}`}
                                >
                                    {service.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <h5 className="fw-bold mb-1">
                                {service.views_count || 0}
                            </h5>
                            <small className="text-muted">Total Views</small>
                        </div>
                    </div>
                </div>

                {/* Bookings Card */}
                <div className="col-lg-12 col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                            <div className="text-success mb-2">
                                <i className="fas fa-calendar-check fa-lg"></i>
                            </div>
                            <h5 className="fw-bold mb-1">
                                {service.bookings_count || 0}
                            </h5>
                            <small className="text-muted">Total Bookings</small>
                        </div>
                    </div>
                </div>

                {/* Rating Card */}
                <div className="col-lg-12 col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                            <div className="text-warning mb-2">
                                <i className="fas fa-star fa-lg"></i>
                            </div>
                            <h5 className="fw-bold mb-1">
                                {formatRating(service.average_rating)}
                            </h5>
                            <small className="text-muted">Average Rating</small>
                        </div>
                    </div>
                </div>

                {/* Earnings Card */}
                <div className="col-lg-12 col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-3">
                            <div className="text-primary mb-2">
                                <i className="fas fa-dollar-sign fa-lg"></i>
                            </div>
                            <h6 className="fw-bold mb-1">
                                Rs.{" "}
                                {(service.total_earnings || 0).toLocaleString()}
                            </h6>
                            <small className="text-muted">Total Earnings</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Statistics Card */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom">
                    <h6 className="mb-0 fw-bold">
                        <i className="fas fa-chart-line text-primary me-2"></i>
                        Service Statistics
                    </h6>
                </div>
                <div className="card-body p-3">
                    <div className="stats-list">
                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-calendar-plus text-primary me-2"></i>
                                <span className="small text-secondary">
                                    Created
                                </span>
                            </div>
                            <span className="text-muted small">
                                {new Date(
                                    service.created_at
                                ).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-edit text-warning me-2"></i>
                                <span className="small text-secondary">
                                    Last Updated
                                </span>
                            </div>
                            <span className="text-muted small">
                                {new Date(
                                    service.updated_at
                                ).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-percentage text-info me-2"></i>
                                <span className="small text-secondary">
                                    Conversion Rate
                                </span>
                            </div>
                            <span className="fw-bold text-info small">
                                {conversionRate}%
                            </span>
                        </div>

                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-coins text-success me-2"></i>
                                <span className="small text-secondary">
                                    Avg. Earnings/Booking
                                </span>
                            </div>
                            <span className="fw-bold text-success small">
                                Rs. {avgEarningsPerBooking}
                            </span>
                        </div>

                        {/* <div className="stat-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-images text-purple me-2"></i>
                                <span className="small">Images</span>
                            </div>
                            <span className="text-muted small">
                                {service.service_images
                                    ? service.service_images.length
                                    : 0}{" "}
                                photos
                            </span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Performance Tips Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <h6 className="mb-0 fw-bold">
                        <i className="fas fa-lightbulb text-warning me-2"></i>
                        Performance Tips
                    </h6>
                </div>
                <div className="card-body p-3">
                    <div className="tips-list">
                        {getPerformanceTips().map((tip, index) => (
                            <div
                                key={index}
                                className="tip-item d-flex align-items-start mb-3"
                            >
                                <i
                                    className={`${tip.icon} text-${tip.color} me-2 mt-1`}
                                ></i>
                                <small className="lh-sm">{tip.text}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceStats;
