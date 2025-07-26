import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import providerQuoteService from "../../../services/providerQuoteService";
import { useQuotePDF } from "../../../components/shared/hooks/useQuotePDF";

const QuoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Initialize Quote PDF hook
    const { downloadQuotePDF } = useQuotePDF("provider", {
        primaryColor: "#007bff",
        companyName: "HireMe",
    });

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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (price) => {
        if (!price) return "Rs. 0";
        return `Rs. ${parseInt(price).toLocaleString()}`;
    };

    const getDaysUntilExpiry = () => {
        if (!quote?.expires_at) return null;
        const expiryDate = new Date(quote.expires_at);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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
        return statusTexts[status] || status;
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
        if (!category) return <span className="text-muted">No category</span>;

        const iconClass = category.icon || "fas fa-cog";
        const colorClass = category.color
            ? `text-${category.color}`
            : "text-primary";

        return (
            <span className="d-flex align-items-center">
                <i className={`${iconClass} ${colorClass} me-2`}></i>
                <span>{category.name}</span>
            </span>
        );
    };

    if (loading) {
        return (
            <ProviderLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "400px" }}
                >
                    <LoadingSpinner message="Loading quote details..." />
                </div>
            </ProviderLayout>
        );
    }

    if (!quote) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <i className="fas fa-quote-left fa-3x text-muted mb-4"></i>
                    <h4 className="text-muted mb-3">Quote not found</h4>
                    <Link to="/provider/quotes" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Quotes
                    </Link>
                </div>
            </ProviderLayout>
        );
    }

    const daysUntilExpiry = getDaysUntilExpiry();
    const totalAmount =
        (parseFloat(quote.quoted_price) || 0) +
        (parseFloat(quote.travel_fee) || 0);

    return (
        <ProviderLayout>
            <div className="quote-detail-page">
                {/* Page Header */}
                <div className="page-header mb-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start">
                        <div className="header-info mb-3 mb-lg-0">
                            <h1 className="page-title mb-2">
                                Quote {quote.quote_number || `#${quote.id}`}
                            </h1>
                            <div className="d-flex flex-wrap align-items-center gap-3">
                                <span
                                    className={`badge ${getStatusBadge(
                                        quote.status
                                    )} px-3 py-2`}
                                >
                                    {getStatusText(quote.status)}
                                </span>
                                {getUrgencyBadge(quote.urgency)}
                                <span className="text-muted">
                                    <i className="fas fa-calendar me-1"></i>
                                    Created: {formatDateTime(quote.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex flex-wrap gap-2">
                            {quote.status === "pending" && (
                                <>
                                    <Link
                                        to={`/provider/quotes/create?quote_id=${quote.id}`}
                                        className="btn btn-success"
                                    >
                                        <i className="fas fa-reply me-2"></i>
                                        Send Quote
                                    </Link>
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={() =>
                                            setShowWithdrawModal(true)
                                        }
                                    >
                                        <i className="fas fa-trash me-2"></i>
                                        Delete
                                    </button>
                                </>
                            )}

                            {quote.status === "quoted" &&
                                daysUntilExpiry > 0 && (
                                    <>
                                        <Link
                                            to={`/provider/quotes/${quote.id}/edit`}
                                            className="btn btn-outline-warning"
                                        >
                                            <i className="fas fa-edit me-2"></i>
                                            Edit
                                        </Link>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                                setShowWithdrawModal(true)
                                            }
                                            disabled={actionLoading}
                                        >
                                            <i className="fas fa-undo me-2"></i>
                                            Withdraw
                                        </button>
                                    </>
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
                                onClick={() => downloadQuotePDF(quote)}
                            >
                                <i className="fas fa-print me-2"></i>
                                Print PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Alerts */}
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
                        {/* Service Information */}
                        <div className="card-modern mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-cog me-2 text-primary"></i>
                                    Service Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h6 className="fw-bold mb-3">
                                            {quote.service_title ||
                                                quote.service?.title}
                                        </h6>
                                        {quote.service_category && (
                                            <div className="mb-3">
                                                <label className="small text-muted">
                                                    Category
                                                </label>
                                                <div>
                                                    {renderServiceCategory(
                                                        quote
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <label className="small text-muted">
                                                Client Requirements
                                            </label>
                                            <div className="bg-light rounded p-3">
                                                {quote.message && (
                                                    <div className="mb-2">
                                                        <strong>Description:</strong>
                                                        <div className="mt-1">{quote.message}</div>
                                                    </div>
                                                )}
                                                {quote.client_requirements && (
                                                    <div className={quote.message ? "mt-3" : ""}>
                                                        <strong>Special Requirements:</strong>
                                                        <div className="mt-1">{quote.client_requirements}</div>
                                                    </div>
                                                )}
                                                {!quote.message && !quote.client_requirements && (
                                                    <em className="text-muted">No specific requirements provided</em>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="service-details">
                                            {quote.requested_date && (
                                                <div className="mb-3">
                                                    <label className="small text-muted">
                                                        Requested Date
                                                    </label>
                                                    <div className="fw-medium">
                                                        {formatDate(
                                                            quote.requested_date
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {quote.requested_time && (
                                                <div className="mb-3">
                                                    <label className="small text-muted">
                                                        Requested Time
                                                    </label>
                                                    <div className="fw-medium">
                                                        {quote.requested_time}
                                                    </div>
                                                </div>
                                            )}
                                            {quote.location_summary && (
                                                <div className="mb-3">
                                                    <label className="small text-muted">
                                                        Location
                                                    </label>
                                                    <div className="fw-medium">
                                                        <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                                                        {quote.location_summary}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Client Information */}
                        <div className="card-modern mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-user me-2 text-primary"></i>
                                    Client Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="d-flex align-items-center mb-3">
                                            <h6 className="fw-bold mb-0 me-2">
                                                {quote.client_name}
                                            </h6>
                                            {quote.client_verified && (
                                                <span className="badge bg-success bg-opacity-10 text-success">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    Verified
                                                </span>
                                            )}
                                        </div>

                                        <div className="client-contact">
                                            {quote.client?.email && (
                                                <div className="mb-2">
                                                    <i className="fas fa-envelope text-muted me-2"></i>
                                                    <a
                                                        href={`mailto:${quote.client.email}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {quote.client.email}
                                                    </a>
                                                </div>
                                            )}
                                            {quote.client?.contact_number && (
                                                <div className="mb-2">
                                                    <i className="fas fa-phone text-muted me-2"></i>
                                                    <a
                                                        href={`tel:${quote.client.contact_number}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {
                                                            quote.client
                                                                .contact_number
                                                        }
                                                    </a>
                                                </div>
                                            )}
                                            <div className="small text-muted">
                                                <i className="fas fa-calendar me-1"></i>
                                                Member since{" "}
                                                {new Date(
                                                    quote.client?.created_at
                                                ).getFullYear()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="d-grid gap-2">
                                            {quote.client?.contact_number && (
                                                <a
                                                    href={`tel:${quote.client.contact_number}`}
                                                    className="btn btn-success btn-sm"
                                                >
                                                    <i className="fas fa-phone me-2"></i>
                                                    Call Client
                                                </a>
                                            )}
                                            {quote.client?.email && (
                                                <a
                                                    href={`mailto:${quote.client.email}`}
                                                    className="btn btn-outline-primary btn-sm"
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
                        {quote.status !== "pending" && (
                            <div className="card-modern mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="fas fa-quote-left me-2 text-primary"></i>
                                        Your Quote Response
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="small text-muted">
                                                Quoted Price
                                            </label>
                                            <div className="fw-bold text-success h5 mb-0">
                                                {formatPrice(
                                                    quote.quoted_price
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="small text-muted">
                                                Estimated Duration
                                            </label>
                                            <div className="fw-medium">
                                                {quote.duration_hours ||
                                                    quote.estimated_duration}{" "}
                                                hour(s)
                                            </div>
                                        </div>
                                    </div>

                                    {quote.travel_fee &&
                                        quote.travel_fee > 0 && (
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="small text-muted">
                                                        Travel Fee
                                                    </label>
                                                    <div className="fw-medium">
                                                        {formatPrice(
                                                            quote.travel_fee
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    {(quote.quote_details ||
                                        quote.provider_response) && (
                                        <div className="mb-3">
                                            <label className="small text-muted">
                                                Quote Description
                                            </label>
                                            <div className="bg-light rounded p-3">
                                                {quote.quote_details ||
                                                    quote.provider_response}
                                            </div>
                                        </div>
                                    )}

                                    {quote.terms_and_conditions && (
                                        <div className="mb-3">
                                            <label className="small text-muted">
                                                Terms & Conditions
                                            </label>
                                            <div className="bg-light rounded p-3">
                                                {quote.terms_and_conditions}
                                            </div>
                                        </div>
                                    )}

                                    {quote.expires_at && (
                                        <div className="small text-muted">
                                            <i className="fas fa-clock me-1"></i>
                                            Valid until:{" "}
                                            {formatDateTime(quote.expires_at)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quote Timeline */}
                        <div className="card-modern">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-history me-2 text-primary"></i>
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
                                                Quote Request Received
                                            </h6>
                                            <p className="text-muted mb-0">
                                                {formatDateTime(
                                                    quote.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {quote.status !== "pending" &&
                                        quote.responded_at && (
                                            <div className="timeline-item">
                                                <div className="timeline-marker bg-info">
                                                    <i className="fas fa-paper-plane text-white"></i>
                                                </div>
                                                <div className="timeline-content">
                                                    <h6 className="fw-bold">
                                                        Quote Sent
                                                    </h6>
                                                    <p className="text-muted mb-0">
                                                        {formatDateTime(
                                                            quote.responded_at
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {quote.status === "accepted" &&
                                        quote.client_responded_at && (
                                            <div className="timeline-item">
                                                <div className="timeline-marker bg-success">
                                                    <i className="fas fa-check text-white"></i>
                                                </div>
                                                <div className="timeline-content">
                                                    <h6 className="fw-bold">
                                                        Quote Accepted
                                                    </h6>
                                                    <p className="text-muted mb-0">
                                                        {formatDateTime(
                                                            quote.client_responded_at
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {quote.status === "rejected" &&
                                        quote.client_responded_at && (
                                            <div className="timeline-item">
                                                <div className="timeline-marker bg-danger">
                                                    <i className="fas fa-times text-white"></i>
                                                </div>
                                                <div className="timeline-content">
                                                    <h6 className="fw-bold">
                                                        Quote Declined
                                                    </h6>
                                                    <p className="text-muted mb-0">
                                                        {formatDateTime(
                                                            quote.client_responded_at
                                                        )}
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
                        <div className="card-modern mb-4">
                            <div className="card-header bg-primary text-white">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-calculator me-2"></i>
                                    Quote Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                {quote.status === "pending" ? (
                                    <div className="text-center py-4">
                                        <i className="fas fa-clock fa-2x text-muted mb-3"></i>
                                        <h6 className="text-muted">
                                            Quote Not Sent Yet
                                        </h6>
                                        <p className="small text-muted mb-3">
                                            Send your quote response to the
                                            client
                                        </p>
                                        <Link
                                            to={`/provider/quotes/create?quote_id=${quote.id}`}
                                            className="btn btn-success"
                                        >
                                            <i className="fas fa-reply me-2"></i>
                                            Send Quote
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="summary-item d-flex justify-content-between mb-2">
                                            <span>Service Price:</span>
                                            <span className="fw-medium">
                                                {formatPrice(
                                                    quote.quoted_price
                                                )}
                                            </span>
                                        </div>

                                        {quote.travel_fee &&
                                            quote.travel_fee > 0 && (
                                                <div className="summary-item d-flex justify-content-between mb-2">
                                                    <span>Travel Fee:</span>
                                                    <span className="fw-medium">
                                                        {formatPrice(
                                                            quote.travel_fee
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                        <hr />

                                        <div className="summary-total d-flex justify-content-between fw-bold mb-3">
                                            <span>Total Quote:</span>
                                            <span className="text-success h5 mb-0">
                                                {formatPrice(totalAmount)}
                                            </span>
                                        </div>

                                        <div className="summary-details">
                                            <div className="small text-muted mb-1">
                                                <i className="fas fa-clock me-1"></i>
                                                Duration:{" "}
                                                {quote.duration_hours ||
                                                    quote.estimated_duration}{" "}
                                                hour(s)
                                            </div>
                                            {quote.expires_at && (
                                                <div className="small text-muted">
                                                    <i className="fas fa-calendar me-1"></i>
                                                    Valid until:{" "}
                                                    {formatDate(
                                                        quote.expires_at
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card-modern">
                            <div className="card-header">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-bolt me-2 text-primary"></i>
                                    Quick Actions
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <Link
                                        to="/provider/quotes"
                                        className="btn btn-outline-secondary"
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Back to All Quotes
                                    </Link>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => downloadQuotePDF(quote)}
                                    >
                                        <i className="fas fa-print me-2"></i>
                                        Print Quote
                                    </button>
                                    {quote.status === "accepted" && (
                                        <Link
                                            to={`/provider/appointments?quote_id=${quote.id}`}
                                            className="btn btn-success"
                                        >
                                            <i className="fas fa-calendar me-2"></i>
                                            View Appointment
                                        </Link>
                                    )}
                                </div>
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
                                            {quote.status === "pending"
                                                ? "Delete Quote"
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
                                                ? "Are you sure you want to delete this quote? This action cannot be undone."
                                                : "Are you sure you want to withdraw this quote? The client will be notified and won't be able to accept it anymore."}
                                        </p>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Reason for{" "}
                                                {quote.status === "pending"
                                                    ? "deletion"
                                                    : "withdrawal"}{" "}
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
                                                        ? "Why are you deleting this quote?"
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
                                            className="btn btn-danger"
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
                                                ? "Delete Quote"
                                                : "Withdraw Quote"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Custom Styles using app.css design system */}
                <style>{`
                    .page-header {
                        margin-bottom: var(--space-6);
                    }
                    
                    .page-title {
                        color: var(--text-primary);
                        font-weight: var(--font-bold);
                        margin-bottom: var(--space-2);
                    }

                    .card-modern {
                        background: var(--bg-white);
                        border-radius: var(--border-radius-lg);
                        box-shadow: var(--shadow-sm);
                        border: 1px solid var(--border-color);
                        transition: var(--transition);
                        overflow: hidden;
                    }

                    .card-modern:hover {
                        transform: translateY(-2px);
                        box-shadow: var(--shadow-md);
                    }

                    .card-header {
                        background: var(--bg-light);
                        border-bottom: 1px solid var(--border-color);
                        padding: var(--space-4);
                        font-weight: var(--font-semibold);
                    }

                    .card-body {
                        padding: var(--space-4);
                    }

                    .timeline {
                        position: relative;
                        padding-left: var(--space-8);
                    }
                    
                    .timeline-item {
                        position: relative;
                        margin-bottom: var(--space-6);
                    }
                    
                    .timeline-item:not(:last-child)::before {
                        content: '';
                        position: absolute;
                        left: -2rem;
                        top: 2.5rem;
                        bottom: -2rem;
                        width: 2px;
                        background: var(--border-color);
                    }
                    
                    .timeline-marker {
                        position: absolute;
                        left: -2.25rem;
                        top: 0;
                        width: 2.5rem;
                        height: 2.5rem;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2;
                        box-shadow: var(--shadow-sm);
                    }
                    
                    .timeline-content {
                        padding-left: var(--space-2);
                    }

                    .summary-item {
                        font-size: var(--text-sm);
                    }

                    .summary-total {
                        font-size: var(--text-lg);
                    }


                    @media (max-width: 768px) {
                        .page-header .d-flex {
                            flex-direction: column;
                        }

                        .timeline {
                            padding-left: var(--space-6);
                        }

                        .timeline-marker {
                            left: -1.75rem;
                            width: 2rem;
                            height: 2rem;
                        }

                        .timeline-item:not(:last-child)::before {
                            left: -1.5rem;
                        }
                    }
                `}</style>
            </div>
        </ProviderLayout>
    );
};

export default QuoteDetail;
