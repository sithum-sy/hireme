import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import providerQuoteService from "../../../services/providerQuoteService";

const CreateQuote = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestId = searchParams.get("request_id");

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [pricingSuggestions, setPricingSuggestions] = useState(null);

    const [quoteData, setQuoteData] = useState({
        quote_request_id: requestId || "",
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
        loadAvailableRequests();
    }, []);

    useEffect(() => {
        if (quoteData.quote_request_id) {
            loadRequestDetails();
        }
    }, [quoteData.quote_request_id]);

    useEffect(() => {
        if (selectedRequest && quoteData.estimated_duration) {
            calculatePricingSuggestions();
        }
    }, [selectedRequest, quoteData.estimated_duration]);

    const loadAvailableRequests = async () => {
        setLoading(true);
        try {
            const result = await providerQuoteService.getAvailableRequests();
            if (result.success) {
                setAvailableRequests(result.data.data || []);
            }
        } catch (error) {
            console.error("Failed to load available requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRequestDetails = async () => {
        if (!quoteData.quote_request_id) return;

        try {
            const request = availableRequests.find(
                (r) => r.id == quoteData.quote_request_id
            );
            setSelectedRequest(request);
        } catch (error) {
            console.error("Failed to load request details:", error);
        }
    };

    const calculatePricingSuggestions = () => {
        const suggestions = providerQuoteService.calculatePricingSuggestions(
            selectedRequest,
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

    const handleSubmitQuote = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = providerQuoteService.validateQuoteData(quoteData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setSubmitLoading(true);
        try {
            const result = await providerQuoteService.createQuote(quoteData);

            if (result.success) {
                navigate("/provider/quotes", {
                    state: {
                        message:
                            "Quote sent successfully! The client will be notified.",
                    },
                });
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            console.error("Failed to create quote:", error);
            setErrors({ general: "Failed to send quote. Please try again." });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <ProviderLayout>
                <LoadingSpinner message="Loading available requests..." />
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="create-quote-page">
                {/* Page Header */}
                <div className="page-header mb-4">
                    <h2 className="fw-bold mb-1">Send Quote</h2>
                    <p className="text-muted mb-0">
                        Create and send a professional quote to a client
                    </p>
                </div>

                <form onSubmit={handleSubmitQuote}>
                    <div className="row">
                        {/* Main Form */}
                        <div className="col-lg-8">
                            {/* Service Request Selection */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-search me-2 text-orange"></i>
                                        Select Service Request
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {errors.general && (
                                        <div className="alert alert-danger">
                                            {errors.general}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Service Request *
                                        </label>
                                        <select
                                            className={`form-select ${
                                                errors.quote_request_id
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={quoteData.quote_request_id}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "quote_request_id",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Choose a service request...
                                            </option>
                                            {availableRequests.map(
                                                (request) => (
                                                    <option
                                                        key={request.id}
                                                        value={request.id}
                                                    >
                                                        {request.service_title}{" "}
                                                        - {request.client_name}(
                                                        {request.location_area})
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        {errors.quote_request_id && (
                                            <div className="invalid-feedback">
                                                {errors.quote_request_id}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Request Details */}
                                    {selectedRequest && (
                                        <div className="selected-request bg-light rounded p-3">
                                            <h6 className="fw-bold">
                                                {selectedRequest.service_title}
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-2">
                                                        <i className="fas fa-user text-muted me-2"></i>
                                                        <strong>Client:</strong>{" "}
                                                        {
                                                            selectedRequest.client_name
                                                        }
                                                    </div>
                                                    <div className="mb-2">
                                                        <i className="fas fa-map-marker-alt text-muted me-2"></i>
                                                        <strong>
                                                            Location:
                                                        </strong>{" "}
                                                        {
                                                            selectedRequest.location_area
                                                        }
                                                    </div>
                                                    <div className="mb-2">
                                                        <i className="fas fa-calendar text-muted me-2"></i>
                                                        <strong>
                                                            Preferred Date:
                                                        </strong>{" "}
                                                        {
                                                            selectedRequest.preferred_date
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-2">
                                                        <i className="fas fa-dollar-sign text-muted me-2"></i>
                                                        <strong>Budget:</strong>{" "}
                                                        Rs.{" "}
                                                        {
                                                            selectedRequest.budget_min
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            selectedRequest.budget_max
                                                        }
                                                    </div>
                                                    <div className="mb-2">
                                                        <i className="fas fa-clock text-muted me-2"></i>
                                                        <strong>Posted:</strong>{" "}
                                                        {
                                                            selectedRequest.posted_time
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedRequest.description && (
                                                <div className="mt-2">
                                                    <strong>
                                                        Description:
                                                    </strong>
                                                    <p className="text-muted mb-0 mt-1">
                                                        {
                                                            selectedRequest.description
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quote Details */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-edit me-2 text-orange"></i>
                                        Quote Details
                                    </h5>
                                </div>
                                <div className="card-body">
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
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-file-contract me-2 text-orange"></i>
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
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white border-bottom">
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
                                        <span className="text-orange">
                                            Rs.{" "}
                                            {(
                                                (parseInt(
                                                    quoteData.quoted_price
                                                ) || 0) +
                                                (parseInt(
                                                    quoteData.travel_charges
                                                ) || 0)
                                            ).toLocaleString()}
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

                            {/* Quote Tips */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="fw-bold mb-0">
                                        <i className="fas fa-tips me-2 text-info"></i>
                                        Quote Success Tips
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="tip-item mb-3">
                                        <i className="fas fa-edit text-primary me-2"></i>
                                        <small>
                                            Be detailed and specific about
                                            what's included
                                        </small>
                                    </div>
                                    <div className="tip-item mb-3">
                                        <i className="fas fa-dollar-sign text-success me-2"></i>
                                        <small>
                                            Price competitively but don't
                                            undervalue yourself
                                        </small>
                                    </div>
                                    <div className="tip-item mb-3">
                                        <i className="fas fa-star text-warning me-2"></i>
                                        <small>
                                            Highlight your experience and
                                            positive reviews
                                        </small>
                                    </div>
                                    <div className="tip-item">
                                        <i className="fas fa-clock text-info me-2"></i>
                                        <small>
                                            Respond quickly - clients prefer
                                            fast responses
                                        </small>
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
                            onClick={() => navigate("/provider/quotes")}
                            disabled={submitLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-orange"
                            disabled={
                                submitLoading || !quoteData.quote_request_id
                            }
                        >
                            {submitLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Sending Quote...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Send Quote
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </ProviderLayout>
    );
};

export default CreateQuote;
