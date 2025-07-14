import React, { useState } from "react";
import { Link } from "react-router-dom";
import providerQuoteService from "../../../services/providerQuoteService";

const QuoteCard = ({ quote, onQuoteUpdate, loading = false }) => {
    const [actionLoading, setActionLoading] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState("");

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch (error) {
            return dateString;
        }
    };

    // Get days remaining until expiry
    const getDaysUntilExpiry = () => {
        if (!quote.expires_at) return null;

        try {
            const expiryDate = new Date(quote.expires_at);
            const today = new Date();
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return null;
        }
    };

    // Handle quote withdrawal
    const handleWithdraw = async () => {
        if (!withdrawReason.trim()) {
            alert("Please provide a reason for withdrawal");
            return;
        }

        setActionLoading(true);
        try {
            const result = await providerQuoteService.withdrawQuote(
                quote.id,
                withdrawReason
            );

            if (result.success && onQuoteUpdate) {
                onQuoteUpdate(result.data);
                setShowWithdrawModal(false);
                setWithdrawReason("");
            }
        } catch (error) {
            console.error("Failed to withdraw quote:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-secondary text-white",
            quoted: "bg-info text-white",
            accepted: "bg-success text-white",
            rejected: "bg-danger text-white",
            withdrawn: "bg-warning text-dark",
            expired: "bg-dark text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Draft",
            quoted: "Sent to Client",
            accepted: "Accepted",
            rejected: "Rejected",
            withdrawn: "Withdrawn",
            expired: "Expired",
        };
        return statusTexts[status] || status;
    };

    const daysUntilExpiry = getDaysUntilExpiry();

    const getClientInfo = (quote) => {
        const requestData = quote.quote_request_data || {};

        return {
            name:
                quote.client?.first_name + " " + quote.client?.last_name ||
                "Unknown Client",
            requirements:
                quote.client_requirements ||
                requestData.message ||
                "No requirements specified",
            requested_date: requestData.requested_date,
            requested_time: requestData.requested_time,
            location_type: requestData.location_type || "client_address",
            city: requestData.city,
            phone: requestData.phone || quote.client?.contact_number,
            urgency: requestData.urgency || "normal",
        };
    };

    console.log("Quote data in card:", quote);
    console.log("Service data:", quote.service);
    console.log("Title options:", {
        serviceTitle: quote.service?.title,
        title: quote.title,
        serviceTitleDirect: quote.service_title,
    });

    return (
        <>
            <div
                className={`quote-card card border-0 shadow-sm mb-3 ${
                    loading ? "opacity-50" : ""
                }`}
            >
                <div className="card-body">
                    <div className="row align-items-center">
                        {/* Quote Info */}
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="quote-info">
                                    <h6 className="fw-bold mb-1">
                                        Quote #{quote.id}
                                        <span className="badge bg-primary text-white ms-2">
                                            {quote.service?.title ||
                                                quote.title ||
                                                "Service"}
                                        </span>
                                    </h6>
                                    <div className="text-muted small mb-1">
                                        <i className="fas fa-user me-1"></i>
                                        Client: {getClientInfo(quote).name}
                                    </div>
                                    <div className="text-muted small mb-2">
                                        <i className="fas fa-calendar me-1"></i>
                                        Created: {formatDate(quote.created_at)}
                                    </div>
                                </div>

                                <span
                                    className={`badge ${getStatusBadge(
                                        quote.status
                                    )} px-2 py-1`}
                                >
                                    {getStatusText(quote.status)}
                                </span>
                            </div>

                            {/* Client Requirements Preview */}
                            <div className="client-requirements mb-2">
                                <div className="bg-light rounded p-2">
                                    <small className="text-muted">
                                        <strong>Client needs:</strong>
                                    </small>
                                    <p className="small mb-1 text-dark">
                                        "
                                        {getClientInfo(quote).requirements
                                            .length > 80
                                            ? getClientInfo(
                                                  quote
                                              ).requirements.substring(0, 80) +
                                              "..."
                                            : getClientInfo(quote).requirements}
                                        "
                                    </p>
                                    {getClientInfo(quote).requested_date && (
                                        <small className="text-muted">
                                            <i className="fas fa-calendar me-1"></i>
                                            Wants:{" "}
                                            {new Date(
                                                getClientInfo(
                                                    quote
                                                ).requested_date
                                            ).toLocaleDateString()}
                                            {getClientInfo(quote)
                                                .requested_time &&
                                                ` at ${
                                                    getClientInfo(quote)
                                                        .requested_time
                                                }`}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Location & Urgency Info */}
                            <div className="request-details small text-muted">
                                <span className="me-3">
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {getClientInfo(quote).location_type ===
                                    "client_address"
                                        ? `Client location${
                                              getClientInfo(quote).city
                                                  ? ` (${
                                                        getClientInfo(quote)
                                                            .city
                                                    })`
                                                  : ""
                                          }`
                                        : "Provider location"}
                                </span>
                                <span
                                    className={`badge badge-sm ${
                                        getClientInfo(quote).urgency ===
                                        "urgent"
                                            ? "bg-danger"
                                            : getClientInfo(quote).urgency ===
                                              "high"
                                            ? "bg-warning"
                                            : "bg-secondary"
                                    }`}
                                >
                                    {getClientInfo(quote).urgency}
                                </span>
                            </div>

                            {/* Expiry Warning - keep your existing code */}
                            {quote.status === "quoted" &&
                                daysUntilExpiry !== null && (
                                    <div
                                        className={`expiry-warning small mt-2 ${
                                            daysUntilExpiry <= 1
                                                ? "text-danger"
                                                : daysUntilExpiry <= 3
                                                ? "text-warning"
                                                : "text-muted"
                                        }`}
                                    >
                                        <i className="fas fa-clock me-1"></i>
                                        {daysUntilExpiry <= 0
                                            ? "Expired"
                                            : daysUntilExpiry === 1
                                            ? "Expires today"
                                            : `Expires in ${daysUntilExpiry} days`}
                                    </div>
                                )}
                        </div>

                        {/* Price & Actions */}
                        <div className="col-md-6 text-end">
                            <div className="quote-price mb-3">
                                <div className="fw-bold text-orange h5 mb-0">
                                    Rs. {quote.quoted_price?.toLocaleString()}
                                </div>
                                {quote.estimated_duration && (
                                    <small className="text-muted">
                                        {quote.estimated_duration} hour(s)
                                    </small>
                                )}
                                {quote.status === "accepted" && (
                                    <div className="text-success small mt-1">
                                        <i className="fas fa-check-circle me-1"></i>
                                        Won this quote!
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="quote-actions">
                                <div className="d-flex gap-2 justify-content-end">
                                    <Link
                                        to={`/provider/quotes/${quote.id}`}
                                        className="btn btn-outline-orange btn-sm"
                                    >
                                        <i className="fas fa-eye me-1"></i>
                                        View
                                    </Link>

                                    {quote.status === "pending" && (
                                        <Link
                                            to={`/provider/quotes/${quote.id}/edit`}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            <i className="fas fa-edit me-1"></i>
                                            Edit
                                        </Link>
                                    )}

                                    {quote.status === "quoted" &&
                                        daysUntilExpiry > 0 && (
                                            <button
                                                className="btn btn-outline-warning btn-sm"
                                                onClick={() =>
                                                    setShowWithdrawModal(true)
                                                }
                                                disabled={actionLoading}
                                            >
                                                <i className="fas fa-undo me-1"></i>
                                                Withdraw
                                            </button>
                                        )}

                                    {quote.status === "accepted" && (
                                        <Link
                                            to={`/provider/appointments?quote_id=${quote.id}`}
                                            className="btn btn-success btn-sm"
                                        >
                                            <i className="fas fa-calendar me-1"></i>
                                            View Job
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Row */}
                    <div className="row mt-2 pt-2 border-top">
                        <div className="col-md-6">
                            <div className="small text-muted">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                {quote.location_type === "client_address"
                                    ? "At client location"
                                    : quote.location_type ===
                                      "provider_location"
                                    ? "At your location"
                                    : "Custom location"}
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            {quote.client_phone && (
                                <a
                                    href={`tel:${quote.client_phone}`}
                                    className="text-decoration-none me-3"
                                >
                                    <i className="fas fa-phone text-success me-1"></i>
                                    <span className="small">Call Client</span>
                                </a>
                            )}
                            <small className="text-muted">
                                ID: {quote.quote_request_id}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Withdraw Quote
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() =>
                                            setShowWithdrawModal(false)
                                        }
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">
                                        Are you sure you want to withdraw this
                                        quote? This action cannot be undone.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Reason for withdrawal *
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={withdrawReason}
                                            onChange={(e) =>
                                                setWithdrawReason(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Please provide a reason for withdrawing this quote..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setShowWithdrawModal(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={handleWithdraw}
                                        disabled={
                                            actionLoading ||
                                            !withdrawReason.trim()
                                        }
                                    >
                                        {actionLoading
                                            ? "Withdrawing..."
                                            : "Withdraw Quote"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default QuoteCard;
