import React from "react";
import { Link } from "react-router-dom";
import QuoteStatusBadge from "./QuoteStatusBadge";

const QuotesCardView = ({ quotes = [], loading = false, onQuoteAction }) => {
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
        if (!price) return "Pending";
        return `Rs. ${parseInt(price).toLocaleString()}`;
    };

    const getActionButtons = (quote) => {
        const buttons = [];
        const status = quote.status;

        // Status-specific actions
        if (status === "quoted") {
            buttons.push(
                <button
                    key="accept"
                    className="btn btn-success btn-sm me-2"
                    onClick={() => onQuoteAction("accept", quote)}
                >
                    <i className="fas fa-check me-1"></i>
                    Accept
                </button>
            );
            buttons.push(
                <button
                    key="decline"
                    className="btn btn-outline-danger btn-sm me-2"
                    onClick={() => onQuoteAction("decline", quote)}
                >
                    <i className="fas fa-times me-1"></i>
                    Decline
                </button>
            );
        }

        return buttons;
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
                <h4 className="text-muted mb-3">No quotes found</h4>
                <p className="text-muted mb-4">
                    You haven't requested any quotes yet. Start by browsing
                    services and requesting quotes from providers.
                </p>
                <Link to="/client/services" className="btn btn-primary btn-lg">
                    <i className="fas fa-search me-2"></i>
                    Browse Services
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
                                            to={`/client/quotes/${quote.id}`}
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
                                        Created {formatDate(quote.created_at)}
                                    </small>
                                </div>
                                <QuoteStatusBadge status={quote.status} />
                            </div>

                            {/* Service Info */}
                            <div className="mb-3">
                                <h6 className="mb-1 text-truncate">
                                    {quote.service_title || "Service"}
                                </h6>
                                {quote.service_category && (
                                    <span className={`badge bg-${quote.service_category.color || 'primary'} me-2`}>
                                        <i className={`${quote.service_category.icon || 'fas fa-cog'} me-1`}></i>
                                        {quote.service_category.name || quote.service_category}
                                    </span>
                                )}
                            </div>

                            {/* Provider Info */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-user-tie me-2 text-muted"></i>
                                    <div className="me-2">
                                        <div className="fw-medium">
                                            {quote.provider_business_name ||
                                                quote.provider_name ||
                                                "Provider"}
                                        </div>
                                        {/* {quote.provider_business_name && quote.provider_name && quote.provider_business_name !== quote.provider_name && (
                                            <div className="small text-muted">
                                                {quote.provider_name}
                                            </div>
                                        )} */}
                                    </div>
                                    {quote.provider_verified && (
                                        <i
                                            className="fas fa-check-circle text-success"
                                            title="Verified Provider"
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
                                            Quote Price:
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

                            {/* Quote Message Preview */}
                            {quote.message && (
                                <div className="mb-3">
                                    <div className="text-muted small">
                                        Request:
                                    </div>
                                    <p className="small mb-0 text-truncate-2">
                                        {quote.message}
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

                            {/* Actions */}
                            <div className="mt-auto pt-3 border-top">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex">
                                        {getActionButtons(quote)}
                                    </div>
                                    <div className="d-flex">
                                        <Link
                                            to={`/client/quotes/${quote.id}`}
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

export default QuotesCardView;
