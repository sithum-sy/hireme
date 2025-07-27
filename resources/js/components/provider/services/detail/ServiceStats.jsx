import React from "react";

const ServiceStats = ({ service }) => {
    const getPerformanceColor = (trend) => {
        if (trend > 0) return "success";
        if (trend < 0) return "danger";
        return "secondary";
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return "fas fa-arrow-up";
        if (trend < 0) return "fas fa-arrow-down";
        return "fas fa-minus";
    };

    return (
        <>
            {/* Performance Cards */}
            <div className="row mb-4">
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="text-info">
                                    <i className="fas fa-eye fa-2x"></i>
                                </div>
                                <span
                                    className={`badge bg-${getPerformanceColor(
                                        service.performance.trends.views_trend
                                    )}`}
                                >
                                    <i
                                        className={getTrendIcon(
                                            service.performance.trends
                                                .views_trend
                                        )}
                                    ></i>
                                    {Math.abs(
                                        service.performance.trends.views_trend
                                    )}
                                    %
                                </span>
                            </div>
                            <h4 className="fw-bold mb-1">
                                {service.views_count}
                            </h4>
                            <small className="text-muted">Total Views</small>
                            <div className="small text-muted mt-1">
                                {service.performance.last_30_days.views} this
                                month
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="text-success">
                                    <i className="fas fa-calendar-check fa-2x"></i>
                                </div>
                                <span
                                    className={`badge bg-${getPerformanceColor(
                                        service.performance.trends
                                            .bookings_trend
                                    )}`}
                                >
                                    <i
                                        className={getTrendIcon(
                                            service.performance.trends
                                                .bookings_trend
                                        )}
                                    ></i>
                                    {Math.abs(
                                        service.performance.trends
                                            .bookings_trend
                                    )}
                                    %
                                </span>
                            </div>
                            <h4 className="fw-bold mb-1">
                                {service.bookings_count}
                            </h4>
                            <small className="text-muted">Total Bookings</small>
                            <div className="small text-muted mt-1">
                                {service.performance.last_30_days.bookings} this
                                month
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="text-warning">
                                    <i className="fas fa-star fa-2x"></i>
                                </div>
                                <span
                                    className={`badge bg-${getPerformanceColor(
                                        service.performance.trends.rating_trend
                                    )}`}
                                >
                                    <i
                                        className={getTrendIcon(
                                            service.performance.trends
                                                .rating_trend
                                        )}
                                    ></i>
                                    {Math.abs(
                                        service.performance.trends.rating_trend
                                    ).toFixed(1)}
                                </span>
                            </div>
                            <h4 className="fw-bold mb-1">
                                {service.average_rating}
                            </h4>
                            <small className="text-muted">Average Rating</small>
                            <div className="small text-muted mt-1">
                                {service.performance.last_30_days.rating} this
                                month
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="text-primary mb-2">
                                <i className="fas fa-dollar-sign fa-2x"></i>
                            </div>
                            <h4 className="fw-bold mb-1">
                                Rs. {service.total_earnings.toLocaleString()}
                            </h4>
                            <small className="text-muted">Total Earnings</small>
                            <div className="small text-muted mt-1">
                                Rs.{" "}
                                {service.performance.last_30_days.earnings.toLocaleString()}{" "}
                                this month
                            </div>
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
                <div className="card-body">
                    <div className="stats-list">
                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-calendar-plus text-primary me-2"></i>
                                <span className="text-primary">Created</span>
                            </div>
                            <span className="text-muted">
                                {new Date(
                                    service.created_at
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-edit text-warning me-2"></i>
                                <span className="text-primary">
                                    Last Updated
                                </span>
                            </div>
                            <span className="text-muted">
                                {new Date(
                                    service.updated_at
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-percentage text-info me-2"></i>
                                <span className="text-primary">
                                    Conversion Rate
                                </span>
                            </div>
                            <span className="fw-bold text-info">
                                {service.views_count > 0
                                    ? (
                                          (service.bookings_count /
                                              service.views_count) *
                                          100
                                      ).toFixed(1)
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="stat-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-coins text-success me-2"></i>
                                <span className="text-primary">
                                    Avg. Earnings/Booking
                                </span>
                            </div>
                            <span className="fw-bold text-primary">
                                Rs.{" "}
                                {service.bookings_count > 0
                                    ? (
                                          service.total_earnings /
                                          service.bookings_count
                                      ).toLocaleString()
                                    : 0}
                            </span>
                        </div>
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
                <div className="card-body">
                    <div className="tips-list">
                        {service.views_count < 50 && (
                            <div className="tip-item d-flex align-items-start mb-3">
                                <i className="fas fa-search text-info me-2 mt-1"></i>
                                <small>
                                    Add more keywords to your description to
                                    improve visibility in search results.
                                </small>
                            </div>
                        )}

                        {service.service_images.length < 3 && (
                            <div className="tip-item d-flex align-items-start mb-3">
                                <i className="fas fa-camera text-primary me-2 mt-1"></i>
                                <small>
                                    Add more high-quality images to showcase
                                    your work and attract more clients.
                                </small>
                            </div>
                        )}

                        {service.average_rating < 4.5 &&
                            service.bookings_count > 5 && (
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-star text-warning me-2 mt-1"></i>
                                    <small>
                                        Focus on delivering exceptional service
                                        to improve your rating and attract more
                                        bookings.
                                    </small>
                                </div>
                            )}

                        {service.views_count / service.bookings_count > 20 &&
                            service.views_count > 50 && (
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-dollar-sign text-success me-2 mt-1"></i>
                                    <small>
                                        Your service gets good views but low
                                        bookings. Consider adjusting your
                                        pricing or adding more details.
                                    </small>
                                </div>
                            )}

                        <div className="tip-item d-flex align-items-start mb-3">
                            <i className="fas fa-clock text-secondary me-2 mt-1"></i>
                            <small>
                                Respond to booking requests within 2 hours to
                                improve your response rate.
                            </small>
                        </div>

                        <div className="tip-item d-flex align-items-start">
                            <i className="fas fa-map-marker-alt text-danger me-2 mt-1"></i>
                            <small>
                                Expand your service areas to reach more
                                potential clients in nearby locations.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceStats;
