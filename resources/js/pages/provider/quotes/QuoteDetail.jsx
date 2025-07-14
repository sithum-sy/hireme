import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import providerQuoteService from "../../../services/providerQuoteService";
import { formatDateTime } from "../../../utils/dateUtils";

const QuoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState("");

    useEffect(() => {
        loadQuoteDetail();
    }, [id]);

    const loadQuoteDetail = async () => {
        setLoading(true);
        try {
            const result = await providerQuoteService.getQuoteDetail(id);
            if (result.success) {
                setQuote(result.data);
            } else {
                navigate("/provider/quotes");
            }
        } catch (error) {
            console.error("Failed to load quote:", error);
            navigate("/provider/quotes");
        } finally {
            setLoading(false);
        }
    };

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

            if (result.success) {
                setQuote(result.data);
                setShowWithdrawModal(false);
                setWithdrawReason("");
            }
        } catch (error) {
            console.error("Failed to withdraw quote:", error);
        } finally {
            setActionLoading(false);
        }
    };

    // Get days remaining until expiry
    const getDaysUntilExpiry = () => {
        if (!quote?.expires_at) return null;

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

    if (loading) {
        return (
            <ProviderLayout>
                <LoadingSpinner message="Loading quote details..." />
            </ProviderLayout>
        );
    }

    if (!quote) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <h4 className="text-danger">Quote not found</h4>
                    <Link to="/provider/quotes" className="btn btn-orange">
                        Back to Quotes
                    </Link>
                </div>
            </ProviderLayout>
        );
    }

    const daysUntilExpiry = getDaysUntilExpiry();
    const totalAmount =
        (parseInt(quote.quoted_price) || 0) +
        (parseInt(quote.travel_charges) || 0);

    return (
        <ProviderLayout>
            <div className="quote-detail-page">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link
                                to="/provider/quotes"
                                className="text-orange text-decoration-none"
                            >
                                My Quotes
                            </Link>
                        </li>
                        <li className="breadcrumb-item active">
                            Quote #{quote.id}
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="page-header d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h2 className="fw-bold mb-2">
                            Quote #{quote.id}
                            <span className="badge bg-orange bg-opacity-10 text-orange ms-3">
                                {quote.service_title}
                            </span>
                        </h2>
                        <div className="d-flex align-items-center gap-3">
                            <span
                                className={`badge ${getStatusBadge(
                                    quote.status
                                )} px-3 py-2`}
                            >
                                {getStatusText(quote.status)}
                            </span>
                            <span className="text-muted">
                                Created:{" "}
                                {formatDateTime(quote.created_at, "00:00").date}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        {quote.status === "pending" && (
                            <div className="d-flex gap-2">
                                <Link
                                    to={`/provider/quotes/${quote.id}/edit`}
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-edit me-2"></i>
                                    Edit & Send
                                </Link>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={() => setShowWithdrawModal(true)}
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Delete Draft
                                </button>
                            </div>
                        )}

                        {quote.status === "quoted" && daysUntilExpiry > 0 && (
                            <button
                                className="btn btn-outline-warning"
                                onClick={() => setShowWithdrawModal(true)}
                                disabled={actionLoading}
                            >
                                <i className="fas fa-undo me-2"></i>
                                Withdraw Quote
                            </button>
                        )}

                        {quote.status === "accepted" && (
                            <Link
                                to={`/provider/appointments?quote_id=${quote.id}`}
                                className="btn btn-success"
                            >
                                <i className="fas fa-calendar me-2"></i>
                                View Appointment
                            </Link>
                        )}

                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => window.print()}
                        >
                            <i className="fas fa-print me-2"></i>
                            Print
                        </button>
                    </div>
                </div>

                {/* Status-specific Alerts */}
                {quote.status === "quoted" && daysUntilExpiry !== null && (
                    <div
                        className={`alert ${
                            daysUntilExpiry <= 0
                                ? "alert-danger"
                                : daysUntilExpiry <= 1
                                ? "alert-warning"
                                : "alert-info"
                        } mb-4`}
                    >
                        <div className="d-flex align-items-center">
                            <i
                                className={`fas ${
                                    daysUntilExpiry <= 0
                                        ? "fa-exclamation-triangle"
                                        : "fa-clock"
                                } me-3`}
                            ></i>
                            <div>
                                {daysUntilExpiry <= 0 ? (
                                    <strong>This quote has expired</strong>
                                ) : daysUntilExpiry === 1 ? (
                                    <strong>Quote expires today!</strong>
                                ) : (
                                    <strong>
                                        Quote expires in {daysUntilExpiry} days
                                    </strong>
                                )}
                                <div className="small mt-1">
                                    {daysUntilExpiry <= 0
                                        ? "The client can no longer accept this quote."
                                        : "After expiry, the client won't be able to accept this quote."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {quote.status === "accepted" && (
                    <div className="alert alert-success mb-4">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle me-3"></i>
                            <div>
                                <strong>Congratulations! Quote accepted</strong>
                                <div className="small mt-1">
                                    The client has accepted your quote. An
                                    appointment has been created automatically.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Client Information */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-user me-2 text-orange"></i>
                                    Client Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h6 className="fw-bold mb-2">
                                            {quote.client_name}
                                        </h6>

                                        {/* Contact Info */}
                                        <div className="contact-info mb-3">
                                            {quote.client_phone && (
                                                <div className="mb-2">
                                                    <i className="fas fa-phone text-success me-2"></i>
                                                    <a
                                                        href={`tel:${quote.client_phone}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {quote.client_phone}
                                                    </a>
                                                </div>
                                            )}
                                            {quote.client_email && (
                                                <div className="mb-2">
                                                    <i className="fas fa-envelope text-info me-2"></i>
                                                    <a
                                                        href={`mailto:${quote.client_email}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {quote.client_email}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Service Request Details */}
                                        <div className="service-request">
                                            <h6 className="fw-semibold">
                                                Service Request:
                                            </h6>
                                            <div className="bg-light rounded p-3">
                                                <div className="mb-2">
                                                    <strong>Service:</strong>{" "}
                                                    {quote.service_title}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Location:</strong>{" "}
                                                    {quote.location_area}
                                                </div>
                                                {quote.preferred_date && (
                                                    <div className="mb-2">
                                                        <strong>
                                                            Preferred Date:
                                                        </strong>{" "}
                                                        {quote.preferred_date}
                                                    </div>
                                                )}
                                                {quote.client_budget_min &&
                                                    quote.client_budget_max && (
                                                        <div className="mb-2">
                                                            <strong>
                                                                Client Budget:
                                                            </strong>{" "}
                                                            Rs.{" "}
                                                            {
                                                                quote.client_budget_min
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                quote.client_budget_max
                                                            }
                                                        </div>
                                                    )}
                                                {quote.request_description && (
                                                    <div>
                                                        <strong>
                                                            Description:
                                                        </strong>
                                                        <p className="mb-0 mt-1">
                                                            {
                                                                quote.request_description
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4 text-end">
                                        <div className="client-actions">
                                            {quote.client_phone && (
                                                <a
                                                    href={`tel:${quote.client_phone}`}
                                                    className="btn btn-success btn-sm mb-2 w-100"
                                                >
                                                    <i className="fas fa-phone me-2"></i>
                                                    Call Client
                                                </a>
                                            )}
                                            {quote.client_email && (
                                                <a
                                                    href={`mailto:${quote.client_email}`}
                                                    className="btn btn-outline-primary btn-sm w-100"
                                                >
                                                    <i className="fas fa-envelope me-2"></i>
                                                    Email Client
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quote Details */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-quote-left me-2 text-orange"></i>
                                    Quote Details
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="detail-item mb-3">
                                            <label className="small text-muted">
                                                Quoted Price
                                            </label>
                                            <div className="fw-bold text-orange h5">
                                                Rs.{" "}
                                                {quote.quoted_price?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="detail-item mb-3">
                                            <label className="small text-muted">
                                                Estimated Duration
                                            </label>
                                            <div className="fw-semibold">
                                                {quote.estimated_duration}{" "}
                                                hour(s)
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="quote-description mb-3">
                                    <label className="small text-muted">
                                        Quote Description
                                    </label>
                                    <div className="bg-light rounded p-3 mt-1">
                                        <p className="mb-0">
                                            {quote.quote_description}
                                        </p>
                                    </div>
                                </div>

                                {quote.additional_notes && (
                                    <div className="additional-notes mb-3">
                                        <label className="small text-muted">
                                            Additional Notes
                                        </label>
                                        <div className="bg-light rounded p-3 mt-1">
                                            <p className="mb-0">
                                                {quote.additional_notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {quote.terms_conditions && (
                                    <div className="terms-conditions">
                                        <label className="small text-muted">
                                            Terms & Conditions
                                        </label>
                                        <div className="bg-light rounded p-3 mt-1">
                                            <p className="mb-0">
                                                {quote.terms_conditions}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quote Timeline */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-history me-2 text-orange"></i>
                                    Quote Timeline
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="timeline">
                                    <div className="timeline-item">
                                        <div className="timeline-marker bg-primary">
                                            <i className="fas fa-plus text-white"></i>
                                        </div>
                                        <div className="timeline-content">
                                            <h6 className="fw-bold">
                                                Quote Created
                                            </h6>
                                            <p className="text-muted mb-0">
                                                {
                                                    formatDateTime(
                                                        quote.created_at,
                                                        "00:00"
                                                    ).fullDate
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {quote.status !== "pending" && (
                                        <div className="timeline-item">
                                            <div className="timeline-marker bg-info">
                                                <i className="fas fa-paper-plane text-white"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">
                                                    Quote Sent
                                                </h6>
                                                <p className="text-muted mb-0">
                                                    Quote sent to client for
                                                    review
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {quote.status === "accepted" && (
                                        <div className="timeline-item">
                                            <div className="timeline-marker bg-success">
                                                <i className="fas fa-check text-white"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">
                                                    Quote Accepted
                                                </h6>
                                                <p className="text-muted mb-0">
                                                    Client accepted your quote
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {quote.status === "rejected" && (
                                        <div className="timeline-item">
                                            <div className="timeline-marker bg-danger">
                                                <i className="fas fa-times text-white"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">
                                                    Quote Rejected
                                                </h6>
                                                <p className="text-muted mb-0">
                                                    Client declined your quote
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {quote.status === "withdrawn" && (
                                        <div className="timeline-item">
                                            <div className="timeline-marker bg-warning">
                                                <i className="fas fa-undo text-white"></i>
                                            </div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">
                                                    Quote Withdrawn
                                                </h6>
                                                <p className="text-muted mb-0">
                                                    You withdrew this quote
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Quote Summary */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-orange text-white">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-calculator me-2"></i>
                                    Quote Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="summary-item d-flex justify-content-between mb-2">
                                    <span>Service Price:</span>
                                    <span>
                                        Rs.{" "}
                                        {quote.quoted_price?.toLocaleString()}
                                    </span>
                                </div>

                                {quote.travel_charges > 0 && (
                                    <div className="summary-item d-flex justify-content-between mb-2">
                                        <span>Travel Charges:</span>
                                        <span>
                                            Rs.{" "}
                                            {quote.travel_charges.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <hr />

                                <div className="summary-total d-flex justify-content-between fw-bold">
                                    <span>Total Quote:</span>
                                    <span className="text-orange h5 mb-0">
                                        Rs. {totalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <div className="summary-details mt-3">
                                    <div className="small text-muted mb-1">
                                        <i className="fas fa-clock me-1"></i>
                                        Duration: {
                                            quote.estimated_duration
                                        }{" "}
                                        hour(s)
                                    </div>
                                    <div className="small text-muted mb-1">
                                        <i className="fas fa-calendar me-1"></i>
                                        Valid for: {quote.validity_days} days
                                    </div>
                                    {quote.includes_materials && (
                                        <div className="small text-success">
                                            <i className="fas fa-check me-1"></i>
                                            Includes materials
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quote Statistics */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-chart-bar me-2 text-orange"></i>
                                    Performance
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="stat-item d-flex justify-content-between mb-2">
                                    <span className="small">
                                        Your Quote Win Rate:
                                    </span>
                                    <span className="badge bg-success">
                                        78%
                                    </span>
                                </div>
                                <div className="stat-item d-flex justify-content-between mb-2">
                                    <span className="small">
                                        Average Response Time:
                                    </span>
                                    <span className="badge bg-info">
                                        2.3 hours
                                    </span>
                                </div>
                                <div className="stat-item d-flex justify-content-between">
                                    <span className="small">
                                        Total Quotes Sent:
                                    </span>
                                    <span className="badge bg-primary">45</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-4">
                    <Link
                        to="/provider/quotes"
                        className="btn btn-outline-secondary"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to All Quotes
                    </Link>
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
                                        {quote.status === "pending"
                                            ? "Delete Draft"
                                            : "Withdraw Quote"}
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
                                        {quote.status === "pending"
                                            ? "Are you sure you want to delete this draft quote? This action cannot be undone."
                                            : "Are you sure you want to withdraw this quote? The client will be notified and won't be able to accept it anymore."}
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Reason{" "}
                                            {quote.status === "pending"
                                                ? "for deletion"
                                                : "for withdrawal"}{" "}
                                            *
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
                                            placeholder={
                                                quote.status === "pending"
                                                    ? "Why are you deleting this draft?"
                                                    : "Why are you withdrawing this quote?"
                                            }
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
                                        className={`btn ${
                                            quote.status === "pending"
                                                ? "btn-danger"
                                                : "btn-warning"
                                        }`}
                                        onClick={handleWithdraw}
                                        disabled={
                                            actionLoading ||
                                            !withdrawReason.trim()
                                        }
                                    >
                                        {actionLoading
                                            ? quote.status === "pending"
                                                ? "Deleting..."
                                                : "Withdrawing..."
                                            : quote.status === "pending"
                                            ? "Delete Draft"
                                            : "Withdraw Quote"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .timeline {
                    position: relative;
                    padding-left: 2rem;
                }
                
                .timeline-item {
                    position: relative;
                    margin-bottom: 2rem;
                }
                
                .timeline-item:not(:last-child)::before {
                    content: '';
                    position: absolute;
                    left: -1.75rem;
                    top: 2rem;
                    bottom: -2rem;
                    width: 2px;
                    background: #dee2e6;
                }
                
                .timeline-marker {
                    position: absolute;
                    left: -2rem;
                    top: 0;
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                }
                
                .timeline-content {
                    padding-left: 0.5rem;
                }
            `}</style>
        </ProviderLayout>
    );
};

export default QuoteDetail;
