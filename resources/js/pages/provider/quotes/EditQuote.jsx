import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import providerQuoteService from "../../../services/providerQuoteService";

const EditQuote = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [quote, setQuote] = useState(null);
    const [pricingSuggestions, setPricingSuggestions] = useState(null);

    const [quoteData, setQuoteData] = useState({
        quoted_price: "",
        estimated_duration: "",
        quote_description: "",
        validity_days: 7,
        terms_conditions: "",
        includes_materials: false,
        travel_charges: "",
        additional_notes: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadQuoteDetail();
    }, [id]);

    useEffect(() => {
        if (quote && quoteData.estimated_duration) {
            calculatePricingSuggestions();
        }
    }, [quote, quoteData.estimated_duration]);

    const loadQuoteDetail = async () => {
        setLoading(true);
        try {
            const result = await providerQuoteService.getQuoteDetail(id);
            if (result.success) {
                const quoteDetail = result.data;
                setQuote(quoteDetail);

                // Pre-fill form with existing data
                setQuoteData({
                    quoted_price: quoteDetail.quoted_price || "",
                    estimated_duration: quoteDetail.duration_hours || quoteDetail.estimated_duration || "",
                    quote_description: quoteDetail.quote_details || quoteDetail.quote_description || "",
                    validity_days: quoteDetail.validity_days || 7,
                    terms_conditions: quoteDetail.terms_and_conditions || quoteDetail.terms_conditions || "",
                    includes_materials: quoteDetail.pricing_breakdown?.includes_materials || quoteDetail.includes_materials || false,
                    travel_charges: quoteDetail.travel_fee || quoteDetail.travel_charges || "",
                    additional_notes: quoteDetail.pricing_breakdown?.additional_notes || quoteDetail.additional_notes || "",
                });
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

    const calculatePricingSuggestions = () => {
        if (!quote) return;

        const suggestions = providerQuoteService.calculatePricingSuggestions(
            quote,
            parseFloat(quoteData.estimated_duration) || 1
        );
        setPricingSuggestions(suggestions);
    };

    const handleInputChange = (field, value) => {
        setQuoteData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleUpdateQuote = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = providerQuoteService.validateQuoteData({
            ...quoteData,
            quote_request_id: quote.quote_request_id,
        });
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setSubmitLoading(true);
        try {
            const result = await providerQuoteService.updateQuote(
                quote.id,
                quoteData
            );

            if (result.success) {
                navigate(`/provider/quotes/${quote.id}`, {
                    state: {
                        message: "Quote updated successfully!",
                    },
                });
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            console.error("Failed to update quote:", error);
            setErrors({ general: "Failed to update quote. Please try again." });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSendQuote = async () => {
        // First update the quote, then send it
        const validation = providerQuoteService.validateQuoteData({
            ...quoteData,
            quote_request_id: quote.quote_request_id,
        });
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setSubmitLoading(true);
        try {
            // Only update the quote - the updateQuote endpoint already sets status to 'quoted'
            const updateResult = await providerQuoteService.updateQuote(
                quote.id,
                quoteData
            );

            if (updateResult.success) {
                // Don't call sendQuote - just navigate after successful update
                navigate("/provider/quotes", {
                    state: {
                        message:
                            "Quote updated and sent successfully! The client will be notified.",
                    },
                });
            } else {
                setErrors(
                    updateResult.errors || { general: updateResult.message }
                );
            }
        } catch (error) {
            console.error("Failed to send quote:", error);
            setErrors({ general: "Failed to send quote. Please try again." });
        } finally {
            setSubmitLoading(false);
        }
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
                    <Link to="/provider/quotes" className="btn btn-primary">
                        Back to Quotes
                    </Link>
                </div>
            </ProviderLayout>
        );
    }

    // Check if quote can be edited
    if (!["pending", "quoted"].includes(quote.status)) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <h4 className="text-warning">Quote cannot be edited</h4>
                    <p className="text-muted">
                        Only pending and quoted requests can be edited.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Link
                            to={`/provider/quotes/${quote.id}`}
                            className="btn btn-primary"
                        >
                            View Quote
                        </Link>
                        <Link
                            to="/provider/quotes"
                            className="btn btn-outline-secondary"
                        >
                            Back to Quotes
                        </Link>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    const totalAmount =
        (parseInt(quoteData.quoted_price) || 0) +
        (parseInt(quoteData.travel_charges) || 0);

    return (
        <ProviderLayout>
            <div className="edit-quote-page">
                {/* Page Header */}
                <div className="page-header mb-4">
                    <h2 className="fw-bold mb-1">Edit Quote #{quote.id}</h2>
                    <p className="text-muted mb-0">
                        Update your quote details before sending to the client
                    </p>
                </div>

                <form onSubmit={handleUpdateQuote}>
                    <div className="row">
                        {/* Main Form */}
                        <div className="col-lg-8">
                            {/* Service Request Info (Read Only) */}
                            <div className="card-modern mb-4">
                                <div className="card-header">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-info-circle me-2 text-primary"></i>
                                        Service Request Details
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="request-details bg-light rounded p-3">
                                        <h6 className="fw-bold">
                                            {quote.service?.title ||
                                                quote.title}
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-2">
                                                    <i className="fas fa-user text-muted me-2"></i>
                                                    <strong>Client:</strong>{" "}
                                                    {quote.client_name || quote.client?.full_name || "Client"}
                                                </div>
                                                <div className="mb-2">
                                                    <i className="fas fa-map-marker-alt text-muted me-2"></i>
                                                    <strong>Location:</strong>{" "}
                                                    {quote.quote_request_data
                                                        ?.city ||
                                                        "Not specified"}
                                                </div>
                                                <div className="mb-2">
                                                    <i className="fas fa-phone text-muted me-2"></i>
                                                    <strong>Phone:</strong>{" "}
                                                    {quote.quote_request_data
                                                        ?.phone ||
                                                        quote.client
                                                            ?.contact_number}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                {quote.quote_request_data
                                                    ?.requested_date && (
                                                    <div className="mb-2">
                                                        <i className="fas fa-calendar text-muted me-2"></i>
                                                        <strong>
                                                            Preferred Date:
                                                        </strong>{" "}
                                                        {new Date(
                                                            quote.quote_request_data.requested_date
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {quote.quote_request_data
                                                    ?.requested_time && (
                                                    <div className="mb-2">
                                                        <i className="fas fa-clock text-muted me-2"></i>
                                                        <strong>
                                                            Preferred Time:
                                                        </strong>{" "}
                                                        {
                                                            quote
                                                                .quote_request_data
                                                                .requested_time
                                                        }
                                                    </div>
                                                )}
                                                <div className="mb-2">
                                                    <i className="fas fa-exclamation-circle text-muted me-2"></i>
                                                    <strong>Urgency:</strong>{" "}
                                                    <span className="text-capitalize">
                                                        {quote
                                                            .quote_request_data
                                                            ?.urgency ||
                                                            "normal"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <strong>
                                                Client Requirements:
                                            </strong>
                                            <p className="text-muted mb-0 mt-1">
                                                "
                                                {quote.client_requirements ||
                                                    quote.quote_request_data
                                                        ?.message ||
                                                    "No specific requirements"}
                                                "
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Details Form */}
                            <div className="card-modern mb-4">
                                <div className="card-header">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-edit me-2 text-primary"></i>
                                        Quote Details
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {errors.general && (
                                        <div className="alert alert-danger">
                                            {errors.general}
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Quoted Price (Rs.) *
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${
                                                    errors.quoted_price
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={quoteData.quoted_price}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter your quoted price"
                                                min="1"
                                                max="100000"
                                            />
                                            {errors.quoted_price && (
                                                <div className="invalid-feedback">
                                                    {errors.quoted_price}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Estimated Duration (hours) *
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${
                                                    errors.estimated_duration
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={
                                                    quoteData.estimated_duration
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "estimated_duration",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Hours needed"
                                                min="0.5"
                                                max="24"
                                                step="0.5"
                                            />
                                            {errors.estimated_duration && (
                                                <div className="invalid-feedback">
                                                    {errors.estimated_duration}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Quote Description *
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                errors.quote_description
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            rows="4"
                                            value={quoteData.quote_description}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "quote_description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Describe what's included in your service, your approach, experience, etc."
                                            maxLength="1000"
                                        ></textarea>
                                        <div className="d-flex justify-content-between mt-1">
                                            {errors.quote_description ? (
                                                <div className="text-danger small">
                                                    {errors.quote_description}
                                                </div>
                                            ) : (
                                                <small className="text-muted">
                                                    Minimum 20 characters. Be
                                                    specific and professional.
                                                </small>
                                            )}
                                            <small className="text-muted">
                                                {
                                                    quoteData.quote_description
                                                        .length
                                                }
                                                /1000
                                            </small>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Quote Validity (days)
                                            </label>
                                            <select
                                                className="form-select"
                                                value={quoteData.validity_days}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "validity_days",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="3">
                                                    3 days
                                                </option>
                                                <option value="7">
                                                    7 days (recommended)
                                                </option>
                                                <option value="14">
                                                    14 days
                                                </option>
                                                <option value="30">
                                                    30 days
                                                </option>
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Travel Charges (Rs.)
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={quoteData.travel_charges}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "travel_charges",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="0"
                                                min="0"
                                            />
                                            <small className="text-muted">
                                                Leave blank if no travel charges
                                            </small>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="includesMaterials"
                                                checked={
                                                    quoteData.includes_materials
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "includes_materials",
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="includesMaterials"
                                            >
                                                Price includes materials and
                                                supplies
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={quoteData.additional_notes}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "additional_notes",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Any additional information or special conditions..."
                                            maxLength="500"
                                        ></textarea>
                                        <small className="text-muted">
                                            {quoteData.additional_notes.length}
                                            /500
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="card-modern mb-4">
                                <div className="card-header">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-file-contract me-2 text-primary"></i>
                                        Terms & Conditions
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={quoteData.terms_conditions}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "terms_conditions",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter any specific terms, payment conditions, or requirements..."
                                        ></textarea>
                                        <small className="text-muted">
                                            Optional: Add any specific terms or
                                            conditions for this job
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            {/* Pricing Suggestions */}
                            {pricingSuggestions && (
                                <div className="card-modern mb-4">
                                    <div className="card-header">
                                        <h6 className="fw-bold mb-0">
                                            <i className="fas fa-lightbulb me-2 text-warning"></i>
                                            Pricing Suggestions
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="pricing-options">
                                            <div
                                                className="pricing-option mb-2 p-2 rounded border"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        pricingSuggestions.competitive
                                                    )
                                                }
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-semibold text-success">
                                                        Competitive
                                                    </span>
                                                    <span>
                                                        Rs.{" "}
                                                        {pricingSuggestions.competitive.toLocaleString()}
                                                    </span>
                                                </div>
                                                <small className="text-muted">
                                                    Recommended for winning
                                                    quotes
                                                </small>
                                            </div>

                                            <div
                                                className="pricing-option mb-2 p-2 rounded border"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        pricingSuggestions.suggested
                                                    )
                                                }
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-semibold text-primary">
                                                        Market Rate
                                                    </span>
                                                    <span>
                                                        Rs.{" "}
                                                        {pricingSuggestions.suggested.toLocaleString()}
                                                    </span>
                                                </div>
                                                <small className="text-muted">
                                                    Average market pricing
                                                </small>
                                            </div>

                                            <div
                                                className="pricing-option mb-2 p-2 rounded border"
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        pricingSuggestions.premium
                                                    )
                                                }
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-semibold text-warning">
                                                        Premium
                                                    </span>
                                                    <span>
                                                        Rs.{" "}
                                                        {pricingSuggestions.premium.toLocaleString()}
                                                    </span>
                                                </div>
                                                <small className="text-muted">
                                                    For premium service quality
                                                </small>
                                            </div>
                                        </div>
                                        <small className="text-muted">
                                            Click on any option to use that
                                            price
                                        </small>
                                    </div>
                                </div>
                            )}

                            {/* Quote Summary */}
                            <div className="card-modern mb-4">
                                <div className="card-header bg-primary text-white">
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
                                            {(
                                                quoteData.quoted_price || 0
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    {quoteData.travel_charges &&
                                        quoteData.travel_charges > 0 && (
                                            <div className="summary-item d-flex justify-content-between mb-2">
                                                <span>Travel Charges:</span>
                                                <span>
                                                    Rs.{" "}
                                                    {parseInt(
                                                        quoteData.travel_charges
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    <hr />
                                    <div className="summary-total d-flex justify-content-between fw-bold">
                                        <span>Total Quote:</span>
                                        <span className="text-success">
                                            Rs. {totalAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    {quoteData.estimated_duration && (
                                        <div className="mt-2 text-muted small">
                                            <i className="fas fa-clock me-1"></i>
                                            Duration:{" "}
                                            {quoteData.estimated_duration}{" "}
                                            hour(s)
                                        </div>
                                    )}

                                    {quoteData.validity_days && (
                                        <div className="text-muted small">
                                            <i className="fas fa-calendar me-1"></i>
                                            Valid for: {quoteData.validity_days}{" "}
                                            days
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Budget Comparison */}
                            {quote.client_budget_min &&
                                quote.client_budget_max && (
                                    <div className="card-modern mb-4">
                                        <div className="card-header">
                                            <h6 className="fw-bold mb-0">
                                                <i className="fas fa-balance-scale me-2 text-info"></i>
                                                Budget Comparison
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="budget-comparison">
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        Client Budget:
                                                    </small>
                                                    <div className="fw-semibold">
                                                        Rs.{" "}
                                                        {quote.client_budget_min.toLocaleString()}{" "}
                                                        -{" "}
                                                        {quote.client_budget_max.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        Your Quote:
                                                    </small>
                                                    <div className="fw-semibold text-orange">
                                                        Rs.{" "}
                                                        {totalAmount.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="budget-status">
                                                    {totalAmount <=
                                                    quote.client_budget_max ? (
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-check me-1"></i>
                                                            Within Budget
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning text-dark">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                            Above Budget
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Quote Tips */}
                            <div className="card-modern">
                                <div className="card-header">
                                    <h6 className="fw-bold mb-0">
                                        <i className="fas fa-tips me-2 text-info"></i>
                                        Quote Tips
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="tip-item mb-3">
                                        <i className="fas fa-edit text-primary me-2"></i>
                                        <small>
                                            Be detailed about what's included
                                        </small>
                                    </div>
                                    <div className="tip-item mb-3">
                                        <i className="fas fa-dollar-sign text-success me-2"></i>
                                        <small>
                                            Price competitively but fairly
                                        </small>
                                    </div>
                                    <div className="tip-item">
                                        <i className="fas fa-star text-warning me-2"></i>
                                        <small>Highlight your experience</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="submit-actions d-flex gap-3 mt-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                                navigate(`/provider/quotes/${quote.id}`)
                            }
                            disabled={submitLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-outline-primary"
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>
                                    Save Draft
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSendQuote}
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Update & Send Quote
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Custom Styles using app.css design system */}
                <style>{`
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

                    .page-header {
                        margin-bottom: var(--space-6);
                    }

                    .pricing-option {
                        cursor: pointer;
                        transition: var(--transition);
                    }

                    .pricing-option:hover {
                        background-color: var(--bg-light);
                        border-color: var(--primary-color);
                        transform: translateY(-1px);
                    }

                    .summary-item {
                        font-size: var(--text-sm);
                    }

                    .summary-total {
                        font-size: var(--text-lg);
                    }

                    .tip-item {
                        display: flex;
                        align-items: center;
                    }

                    .request-details {
                        background: var(--bg-light);
                        border-left: 4px solid var(--primary-color);
                    }

                    @media (max-width: 768px) {
                        .card-body {
                            padding: var(--space-3);
                        }
                        
                        .submit-actions {
                            flex-direction: column;
                        }
                        
                        .submit-actions .btn {
                            width: 100%;
                        }

                        .row .col-md-6 {
                            margin-bottom: var(--space-3);
                        }
                    }
                `}</style>
            </div>
        </ProviderLayout>
    );
};

export default EditQuote;
