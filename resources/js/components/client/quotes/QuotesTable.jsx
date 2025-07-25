import React from "react";
import { Link } from "react-router-dom";
import QuoteStatusBadge from "./QuoteStatusBadge";

const QuotesTable = ({
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
        if (!price) return "Pending";
        return `Rs. ${parseInt(price).toLocaleString()}`;
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

    const getActionButtons = (quote) => {
        const buttons = [];
        const status = quote.status;

        // View button - always available
        buttons.push(
            <Link
                key="view"
                to={`/client/quotes/${quote.id}`}
                className="btn btn-sm btn-outline-primary me-1"
                title="View Details"
            >
                <i className="fas fa-eye"></i>
            </Link>
        );

        // Status-specific actions
        if (status === "quoted") {
            buttons.push(
                <button
                    key="accept"
                    className="btn btn-sm btn-success me-1"
                    onClick={() => onQuoteAction("accept", quote)}
                    title="Accept Quote"
                >
                    <i className="fas fa-check"></i>
                </button>
            );
            buttons.push(
                <button
                    key="decline"
                    className="btn btn-sm btn-outline-danger me-1"
                    onClick={() => onQuoteAction("decline", quote)}
                    title="Decline Quote"
                >
                    <i className="fas fa-times"></i>
                </button>
            );
        }

        // PDF download
        // buttons.push(
        //     <button
        //         key="pdf"
        //         className="btn btn-sm btn-outline-secondary"
        //         onClick={() => onQuoteAction("download", quote)}
        //         title="Download PDF"
        //     >
        //         <i className="fas fa-download"></i>
        //     </button>
        // );

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
                    <h5 className="text-muted">No quotes found</h5>
                    <p className="text-muted">
                        You haven't requested any quotes yet. Start by browsing
                        services and requesting quotes from providers.
                    </p>
                    <Link to="/client/services" className="btn btn-primary">
                        <i className="fas fa-search me-2"></i>
                        Browse Services
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
                                <th
                                    className="ps-3 cursor-pointer"
                                    onClick={() =>
                                        onSort && onSort("quote_number")
                                    }
                                >
                                    Quote ID
                                    {/* {getSortIcon("quote_number")} */}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onSort && onSort("service_title")
                                    }
                                >
                                    Service
                                    {/* {getSortIcon("service_title")} */}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onSort && onSort("provider_name")
                                    }
                                >
                                    Provider
                                    {/* {getSortIcon("provider_name")} */}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onSort && onSort("requested_date")
                                    }
                                >
                                    Requested Date
                                    {/* {" "}{getSortIcon("requested_date")} */}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onSort && onSort("quoted_price")
                                    }
                                >
                                    Quote Price
                                    {/* {getSortIcon("quoted_price")} */}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() => onSort && onSort("status")}
                                >
                                    Status
                                    {/* {getSortIcon("status")} */}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() =>
                                        onSort && onSort("created_at")
                                    }
                                >
                                    Created
                                    {/* {getSortIcon("created_at")} */}
                                </th>
                                <th className="pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="align-middle">
                                    <td className="ps-3">
                                        <Link
                                            to={`/client/quotes/${quote.id}`}
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
                                                        "Service"}
                                                </div>
                                                {quote.service_category && (
                                                    <div className="small text-muted">
                                                        {quote.service_category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <div className="fw-medium">
                                                    {quote.provider?.name ||
                                                        quote.provider
                                                            ?.first_name +
                                                            " " +
                                                            (quote.provider
                                                                ?.last_name ||
                                                                "") ||
                                                        "Provider"}
                                                </div>
                                                {(quote.provider_profile
                                                    ?.business_name ||
                                                    quote.provider
                                                        ?.provider_profile
                                                        ?.business_name) && (
                                                    <div className="small text-muted">
                                                        {quote.provider_profile
                                                            ?.business_name ||
                                                            quote.provider
                                                                ?.provider_profile
                                                                ?.business_name}
                                                    </div>
                                                )}
                                                {(quote.provider_verified ||
                                                    quote.provider
                                                        ?.verified) && (
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
                                        <QuoteStatusBadge
                                            status={quote.status}
                                        />
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

export default QuotesTable;
