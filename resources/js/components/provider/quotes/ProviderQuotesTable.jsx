import React from "react";
import { Link } from "react-router-dom";

const ProviderQuotesTable = ({
    quotes = [],
    loading = false,
    onSort,
    sortField,
    sortDirection,
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

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <i className="fas fa-sort text-muted ms-1"></i>;
        }
        return sortDirection === "asc" ? (
            <i className="fas fa-sort-up text-primary ms-1"></i>
        ) : (
            <i className="fas fa-sort-down text-primary ms-1"></i>
        );
    };

    const renderServiceCategory = (quote) => {
        const category = quote.service_category;
        if (!category) {
            return <div className="small text-muted">No category</div>;
        }

        const iconClass = category.icon || "fas fa-cog";
        const colorClass = category.color
            ? `text-${category.color}`
            : "text-primary";

        return (
            <div className="small text-muted d-flex align-items-center">
                <i className={`${iconClass} ${colorClass} me-1`}></i>
                <span>{category.name}</span>
            </div>
        );
    };

    const getActionButtons = (quote) => {
        const buttons = [];
        const status = quote.status;

        // View button - always available
        buttons.push(
            <Link
                key="view"
                to={`/provider/quotes/${quote.id}`}
                className="btn btn-sm btn-outline-primary me-1"
                title="View Details"
            >
                <i className="fas fa-eye"></i> View Quote
            </Link>
        );

        return buttons;
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-body">
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ minHeight: "200px" }}
                    >
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (quotes.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <i className="fas fa-quote-left fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No quote requests found</h5>
                    <p className="text-muted">
                        You haven't received any quote requests yet. Make sure
                        your services are visible and attractive to potential
                        clients.
                    </p>
                    <Link to="/provider/services" className="btn btn-primary">
                        <i className="fas fa-cog me-2"></i>
                        Manage Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 cursor-pointer">
                                    Quote ID
                                </th>
                                <th className="cursor-pointer">Service</th>
                                <th className="cursor-pointer">Client</th>
                                <th className="cursor-pointer">
                                    Requested Date
                                </th>
                                <th className="cursor-pointer">Your Quote</th>
                                <th className="cursor-pointer">Status</th>
                                <th className="cursor-pointer">Received</th>
                                <th className="pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="align-middle">
                                    <td className="ps-3">
                                        <Link
                                            to={`/provider/quotes/${quote.id}`}
                                            className="text-decoration-none fw-medium text-primary"
                                        >
                                            {quote.quote_number ||
                                                `Q${String(quote.id).padStart(
                                                    6,
                                                    "0"
                                                )}`}
                                        </Link>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <div
                                                    className="fw-medium text-truncate"
                                                    style={{
                                                        maxWidth: "200px",
                                                    }}
                                                >
                                                    {quote.service_title ||
                                                        quote.service?.title ||
                                                        "Service"}
                                                </div>
                                                {renderServiceCategory(quote)}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <div className="fw-medium">
                                                    {quote.client_name ||
                                                        "Client"}
                                                </div>
                                                {quote.client_verified && (
                                                    <div className="small text-success">
                                                        <i className="fas fa-check-circle me-1"></i>
                                                        Verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">
                                                {formatDate(
                                                    quote.requested_date
                                                )}
                                            </div>
                                            {quote.requested_time && (
                                                <div className="small text-muted">
                                                    {formatTime(
                                                        quote.requested_time
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-medium">
                                            {formatPrice(quote.quoted_price)}
                                        </div>
                                        {quote.travel_fee &&
                                            quote.travel_fee > 0 && (
                                                <div className="small text-muted">
                                                    + Rs. {quote.travel_fee}{" "}
                                                    travel
                                                </div>
                                            )}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${getStatusBadge(
                                                quote.status
                                            )}`}
                                        >
                                            {getStatusText(quote.status)}
                                        </span>
                                        {quote.expires_at &&
                                            quote.status === "quoted" && (
                                                <div className="small text-muted mt-1">
                                                    Expires:{" "}
                                                    {formatDate(
                                                        quote.expires_at
                                                    )}
                                                </div>
                                            )}
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">
                                                {formatDate(quote.created_at)}
                                            </div>
                                            <div className="small text-muted">
                                                {new Date(
                                                    quote.created_at
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="pe-3">
                                        <div className="d-flex">
                                            {getActionButtons(quote)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProviderQuotesTable;
