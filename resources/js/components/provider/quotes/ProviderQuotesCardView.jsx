import React from "react";
import { Link } from "react-router-dom";

const ProviderQuotesCardView = ({
    quotes = [],
    loading = false,
    onQuoteAction,
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        try {
            const timeParts = timeString.toString().split(":");
            if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = timeParts[1];
                const ampm = hours >= 12 ? "PM" : "AM";
                const displayHour = hours % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            }
        } catch (error) {
            console.warn("Error formatting time:", error);
        }
        return timeString.toString();
    };

    const formatPrice = (price) => {
        if (!price) return "Not quoted";
        return `Rs. ${parseInt(price).toLocaleString()}`;
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            quoted: "bg-info text-white",
            accepted: "bg-success text-white",
            rejected: "bg-danger text-white",
            withdrawn: "bg-secondary text-white",
            expired: "bg-dark text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Awaiting Response",
            quoted: "Quote Sent",
            accepted: "Accepted",
            rejected: "Declined",
            withdrawn: "Withdrawn",
            expired: "Expired",
        };
        return statusTexts[status] || status.replace("_", " ").toUpperCase();
    };

    const getUrgencyBadge = (urgency) => {
        if (!urgency || urgency === "normal") return null;

        const badges = {
            urgent: "bg-warning text-dark",
            emergency: "bg-danger text-white",
        };

        return (
            <span className={`badge ${badges[urgency]} me-2`}>
                <i className="fas fa-exclamation-triangle me-1"></i>
                {urgency.toUpperCase()}
            </span>
        );
    };

    const renderServiceCategory = (quote) => {
        const category = quote.service_category;
        if (!category) {
            return <small className="text-muted">No category</small>;
        }

        const iconClass = category.icon || "fas fa-cog";
        const colorClass = category.color
            ? `text-${category.color}`
            : "text-primary";

        return (
            <small className="text-muted d-flex align-items-center">
                <i className={`${iconClass} ${colorClass} me-1`}></i>
                <span>{category.name}</span>
            </small>
        );
    };

    if (loading) {
        return (
            <div className="row">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="col-md-6 col-lg-4 mb-4">
                        <div className="card quote-card">
                            <div className="card-body">
                                <div
                                    className="d-flex justify-content-center align-items-center"
                                    style={{ minHeight: "200px" }}
                                >
                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (quotes.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-quote-left fa-4x text-muted mb-4"></i>
                <h4 className="text-muted mb-3">No quote requests found</h4>
                <p className="text-muted mb-4">
                    You haven't received any quote requests yet. Make sure your
                    services are visible and attractive to potential clients.
                </p>
                <Link
                    to="/provider/services"
                    className="btn btn-primary btn-lg"
                >
                    <i className="fas fa-cog me-2"></i>
                    Manage Services
                </Link>
            </div>
        );
    }

    return (
        <div className="row">
            {quotes.map((quote) => (
                <div key={quote.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card quote-card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 className="card-title mb-1">
                                        <Link
                                            to={`/provider/quotes/${quote.id}`}
                                            className="text-decoration-none"
                                        >
                                            {quote.quote_number ||
                                                `Q${String(quote.id).padStart(
                                                    6,
                                                    "0"
                                                )}`}
                                        </Link>
                                    </h6>
                                    <small className="text-muted">
                                        Received {formatDate(quote.created_at)}
                                    </small>
                                </div>
                                <div className="d-flex flex-column align-items-end">
                                    <span
                                        className={`badge ${getStatusBadge(
                                            quote.status
                                        )} mb-1`}
                                    >
                                        {getStatusText(quote.status)}
                                    </span>
                                    {getUrgencyBadge(quote.urgency)}
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="mb-3">
                                <h6 className="mb-1 text-truncate">
                                    {quote.service_title ||
                                        quote.service?.title ||
                                        "Service"}
                                </h6>
                                {renderServiceCategory(quote)}
                            </div>

                            {/* Client Info */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-user me-2 text-muted"></i>
                                    <span className="me-2">
                                        {quote.client_name ||
                                            "Client"}
                                    </span>
                                    {quote.client_verified && (
                                        <i
                                            className="fas fa-check-circle text-success"
                                            title="Verified Client"
                                        ></i>
                                    )}
                                </div>
                            </div>

                            {/* Quote Details */}
                            <div className="mb-3">
                                <div className="row g-2 small">
                                    <div className="col-6">
                                        <div className="text-muted">
                                            Requested Date:
                                        </div>
                                        <div className="fw-medium">
                                            {formatDate(quote.requested_date)}
                                        </div>
                                        {quote.requested_time && (
                                            <div className="text-muted small">
                                                {formatTime(
                                                    quote.requested_time
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-6">
                                        <div className="text-muted">
                                            Your Quote:
                                        </div>
                                        <div className="fw-medium text-success">
                                            {formatPrice(quote.quoted_price)}
                                        </div>
                                        {quote.travel_fee &&
                                            quote.travel_fee > 0 && (
                                                <div className="small text-muted">
                                                    + Rs. {quote.travel_fee}{" "}
                                                    travel
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Request Message Preview */}
                            {quote.message && (
                                <div className="mb-3">
                                    <div className="text-muted small">
                                        Client Request:
                                    </div>
                                    <p className="small mb-0 text-truncate-2">
                                        {quote.message}
                                    </p>
                                </div>
                            )}

                            {/* Your Response Preview */}
                            {quote.provider_response && (
                                <div className="mb-3">
                                    <div className="text-muted small">
                                        Your Response:
                                    </div>
                                    <p className="small mb-0 text-truncate-2">
                                        {quote.provider_response}
                                    </p>
                                </div>
                            )}

                            {/* Expiry Info */}
                            {quote.expires_at && quote.status === "quoted" && (
                                <div className="mb-3">
                                    <div className="alert alert-warning alert-sm py-2 px-3 mb-0">
                                        <i className="fas fa-clock me-1"></i>
                                        <small>
                                            Expires:{" "}
                                            {formatDate(quote.expires_at)}
                                        </small>
                                    </div>
                                </div>
                            )}

                            {/* Location Info */}
                            {quote.location_summary && (
                                <div className="mb-3">
                                    <div className="d-flex align-items-center small text-muted">
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        <span>{quote.location_summary}</span>
                                    </div>
                                </div>
                            )}

                            {/* Revenue Potential */}
                            {quote.quoted_price && (
                                <div className="mb-3">
                                    <div className="d-flex align-items-center small">
                                        <i className="fas fa-coins me-2 text-warning"></i>
                                        <span className="text-muted">
                                            Potential Revenue:{" "}
                                        </span>
                                        <span className="fw-bold text-success ms-1">
                                            Rs.{" "}
                                            {parseInt(
                                                quote.quoted_price +
                                                    (quote.travel_fee || 0)
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-auto pt-3 border-top">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex">
                                        <Link
                                            to={`/provider/quotes/${quote.id}`}
                                            className="btn btn-outline-primary btn-sm me-2"
                                        >
                                            <i className="fas fa-eye me-1"></i>
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProviderQuotesCardView;
