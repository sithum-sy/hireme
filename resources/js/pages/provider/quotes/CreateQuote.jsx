import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import providerQuoteService from "../../../services/providerQuoteService";

const CreateQuote = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const quoteId = searchParams.get("quote_id");

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [pendingQuotes, setPendingQuotes] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [pricingSuggestions, setPricingSuggestions] = useState(null);

    const [quoteData, setQuoteData] = useState({
        quote_id: quoteId || "",
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
        loadPendingQuotes();
    }, []);

    useEffect(() => {
        // Set quote_id from URL parameter when component loads
        console.log("CreateQuote: URL quoteId =", quoteId);
        if (quoteId && !quoteData.quote_id) {
            console.log("Setting quote_id in form data");
            setQuoteData((prev) => ({ ...prev, quote_id: quoteId }));
        }
    }, [quoteId]);

    useEffect(() => {
        if (quoteData.quote_id) {
            loadQuoteDetails();
        }
    }, [quoteData.quote_id, pendingQuotes]);

    useEffect(() => {
        if (selectedQuote && quoteData.estimated_duration) {
            calculatePricingSuggestions();
        }
    }, [selectedQuote, quoteData.estimated_duration]);

    const loadPendingQuotes = async () => {
        setLoading(true);
        try {
            const result = await providerQuoteService.getAvailableRequests();
            if (result.success) {
                setPendingQuotes(result.data.data || []);
            }
        } catch (error) {
            console.error("Failed to load pending quotes:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadQuoteDetails = async () => {
        if (!quoteData.quote_id) return;

        setQuoteLoading(true);
        try {
            // First try to find quote in pending quotes list
            let quote = pendingQuotes.find((q) => q.id == quoteData.quote_id);

            // If not found in pending quotes, fetch directly from API
            if (!quote) {
                console.log(
                    "Quote not found in pending list, fetching from API..."
                );
                const result = await providerQuoteService.getQuoteDetail(
                    quoteData.quote_id
                );
                if (result.success) {
                    quote = result.data;
                    console.log("Quote loaded from API:", quote);
                }
            } else {
                console.log("Quote found in pending list:", quote);
            }

            if (quote) {
                setSelectedQuote(quote);
                // Clear any previous errors
                setErrors((prev) => ({ ...prev, quote_id: null }));
            } else {
                setErrors({ quote_id: "Quote not found or not accessible" });
            }
        } catch (error) {
            console.error("Failed to load quote details:", error);
            setErrors({ quote_id: "Failed to load quote details" });
        } finally {
            setQuoteLoading(false);
        }
    };

    const calculatePricingSuggestions = () => {
        const suggestions = providerQuoteService.calculatePricingSuggestions(
            selectedQuote,
            parseFloat(quoteData.estimated_duration) || 1
        );
        setPricingSuggestions(suggestions);
    };

    const handleInputChange = (field, value) => {
        setQuoteData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmitQuote = async (e) => {
        e.preventDefault();

        // Check if quote is selected
        if (!quoteData.quote_id) {
            setErrors({ quote_id: "Please select a quote request" });
            return;
        }

        const validation = providerQuoteService.validateQuoteData(quoteData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setSubmitLoading(true);
        try {
            const result = await providerQuoteService.updateQuote(
                quoteData.quote_id,
                quoteData
            );

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
            console.error("Failed to send quote:", error);
            setErrors({ general: "Failed to send quote. Please try again." });
        } finally {
            setSubmitLoading(false);
        }
    };

    // Helper function to display client request data
    const getClientRequestData = (quote) => {
        const requestData = quote.quote_request_data || {};
        return {
            description:
                quote.client_requirements ||
                requestData.message ||
                quote.description,
            requested_date: requestData.requested_date,
            requested_time: requestData.requested_time,
            location_type: requestData.location_type || "client_address",
            address: requestData.address,
            city: requestData.city,
            urgency: requestData.urgency || "normal",
            special_requirements: requestData.special_requirements,
        };
    };

    if (loading) {
        return (
            <ProviderLayout>
                <LoadingSpinner message="Loading pending quotes..." />
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="container-custom">
                <div className="page-header">
                    <h2 className="text-gradient mb-2">
                        Respond to Quote Request
                    </h2>
                    <p className="text-secondary mb-0">
                        Respond to a client's quote request with your pricing
                        and details
                    </p>
                </div>

                <form onSubmit={handleSubmitQuote}>
                    <div className="row g-4">
                        <div className="col-lg-8">
                            {/* Quote Request Selection */}
                            <div className="dashboard-card mb-4">
                                <div className="card-header">
                                    <h5 className="card-title">
                                        <i className="fas fa-search text-primary"></i>
                                        Select Quote Request
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
                                            Pending Quote Requests *
                                        </label>
                                        <select
                                            className={`form-select ${
                                                errors.quote_id
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={quoteData.quote_id}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "quote_id",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Choose a quote request...
                                            </option>
                                            {pendingQuotes.map((quote) => (
                                                <option
                                                    key={quote.id}
                                                    value={quote.id}
                                                >
                                                    {quote.service?.title ||
                                                        quote.title}{" "}
                                                    - {quote.client?.name} (
                                                    {new Date(
                                                        quote.created_at
                                                    ).toLocaleDateString()}
                                                    )
                                                </option>
                                            ))}
                                        </select>
                                        {errors.quote_id && (
                                            <div className="invalid-feedback">
                                                {errors.quote_id}
                                            </div>
                                        )}
                                    </div>

                                    {/* Loading Quote Details */}
                                    {quoteLoading && quoteData.quote_id && (
                                        <div className="text-center py-4">
                                            <div
                                                className="spinner-border text-primary me-2"
                                                role="status"
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>
                                            <span>
                                                Loading quote details...
                                            </span>
                                        </div>
                                    )}

                                    {/* Selected Request Details */}
                                    {selectedQuote && !quoteLoading && (
                                        <div className="info-card">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="fw-bold">
                                                    {selectedQuote.service
                                                        ?.title ||
                                                        selectedQuote.title}
                                                </h6>
                                                <span className="badge bg-warning text-dark">
                                                    Pending Response
                                                </span>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-2">
                                                        <i className="fas fa-user text-muted me-2"></i>
                                                        <strong>Client:</strong>{" "}
                                                        {
                                                            selectedQuote.client
                                                                ?.first_name
                                                        }{" "}
                                                        {
                                                            selectedQuote.client
                                                                ?.last_name
                                                        }
                                                    </div>
                                                    <div className="mb-2">
                                                        <i className="fas fa-phone text-muted me-2"></i>
                                                        <strong>Phone:</strong>{" "}
                                                        {selectedQuote
                                                            .quote_request_data
                                                            ?.phone ||
                                                            selectedQuote.client
                                                                ?.contact_number}
                                                    </div>
                                                    <div className="mb-2">
                                                        <i className="fas fa-envelope text-muted me-2"></i>
                                                        <strong>Email:</strong>{" "}
                                                        {selectedQuote
                                                            .quote_request_data
                                                            ?.email ||
                                                            selectedQuote.client
                                                                ?.email}
                                                    </div>
                                                    <div className="mb-2">
                                                        <i className="fas fa-exclamation-circle text-muted me-2"></i>
                                                        <strong>
                                                            Urgency:
                                                        </strong>{" "}
                                                        <span className="text-capitalize">
                                                            {selectedQuote
                                                                .quote_request_data
                                                                ?.urgency ||
                                                                "normal"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    {selectedQuote
                                                        .quote_request_data
                                                        ?.requested_date && (
                                                        <div className="mb-2">
                                                            <i className="fas fa-calendar text-muted me-2"></i>
                                                            <strong>
                                                                Preferred Date:
                                                            </strong>{" "}
                                                            {new Date(
                                                                selectedQuote.quote_request_data.requested_date
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {selectedQuote
                                                        .quote_request_data
                                                        ?.requested_time && (
                                                        <div className="mb-2">
                                                            <i className="fas fa-clock text-muted me-2"></i>
                                                            <strong>
                                                                Preferred Time:
                                                            </strong>{" "}
                                                            {
                                                                selectedQuote
                                                                    .quote_request_data
                                                                    .requested_time
                                                            }
                                                        </div>
                                                    )}
                                                    <div className="mb-2">
                                                        <i className="fas fa-map-marker-alt text-muted me-2"></i>
                                                        <strong>
                                                            Location:
                                                        </strong>{" "}
                                                        {selectedQuote
                                                            .quote_request_data
                                                            ?.location_type ===
                                                        "client_address"
                                                            ? "At Client Location"
                                                            : "At Provider Location"}
                                                    </div>
                                                    {selectedQuote
                                                        .quote_request_data
                                                        ?.address && (
                                                        <div className="mb-2">
                                                            <i className="fas fa-home text-muted me-2"></i>
                                                            <strong>
                                                                Address:
                                                            </strong>{" "}
                                                            {
                                                                selectedQuote
                                                                    .quote_request_data
                                                                    .address
                                                            }
                                                            {selectedQuote
                                                                .quote_request_data
                                                                ?.city &&
                                                                `, ${selectedQuote.quote_request_data.city}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-2 pt-2 border-top">
                                                <strong>
                                                    What the client needs:
                                                </strong>
                                                <div className="mt-1 p-2 bg-white rounded border-start border-primary border-3">
                                                    <p className="mb-0 text-primary">
                                                        "
                                                        {selectedQuote.client_requirements ||
                                                            selectedQuote
                                                                .quote_request_data
                                                                ?.message ||
                                                            "No specific requirements"}
                                                        "
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedQuote.quote_request_data
                                                ?.special_requirements && (
                                                <div className="mt-2">
                                                    <strong>
                                                        Special Requirements:
                                                    </strong>
                                                    <p className="text-muted mb-0 mt-1">
                                                        {
                                                            selectedQuote
                                                                .quote_request_data
                                                                .special_requirements
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-2 pt-2 border-top">
                                                <small className="text-muted">
                                                    <i className="fas fa-clock me-1"></i>
                                                    Request submitted:{" "}
                                                    {new Date(
                                                        selectedQuote.created_at
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quote Response Form */}
                            {selectedQuote && !quoteLoading && (
                                <>
                                    <div className="dashboard-card mb-4">
                                        <div className="card-header">
                                            <h5 className="card-title">
                                                <i className="fas fa-edit text-primary"></i>
                                                Your Quote Response
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6 mb-2">
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
                                                        value={
                                                            quoteData.quoted_price
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "quoted_price",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter your quoted price"
                                                        min="1"
                                                        max="1000000"
                                                    />
                                                    {errors.quoted_price && (
                                                        <div className="invalid-feedback">
                                                            {
                                                                errors.quoted_price
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6 mb-2">
                                                    <label className="form-label">
                                                        Estimated Duration
                                                        (hours) *
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
                                                            {
                                                                errors.estimated_duration
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2">
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
                                                    value={
                                                        quoteData.quote_description
                                                    }
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
                                                            {
                                                                errors.quote_description
                                                            }
                                                        </div>
                                                    ) : (
                                                        <small className="text-muted">
                                                            Minimum 20
                                                            characters. Be
                                                            specific and
                                                            professional.
                                                        </small>
                                                    )}
                                                    <small className="text-muted">
                                                        {
                                                            quoteData
                                                                .quote_description
                                                                .length
                                                        }
                                                        /1000
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6 mb-2">
                                                    <label className="form-label">
                                                        Quote Validity (days)
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        value={
                                                            quoteData.validity_days
                                                        }
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
                                                {/* <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Travel Charges (Rs.)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={
                                                        quoteData.travel_charges
                                                    }
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
                                                    Leave blank if no travel
                                                    charges
                                                </small>
                                            </div> */}
                                            </div>

                                            <div className="mb-2">
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
                                                        Price includes materials
                                                        and supplies
                                                    </label>
                                                </div>
                                            </div>

                                            {/* <div className="mb-3">
                                            <label className="form-label">Additional Notes</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={quoteData.additional_notes}
                                                onChange={(e) => handleInputChange("additional_notes", e.target.value)}
                                                placeholder="Any additional information or special conditions..."
                                                maxLength="500"
                                            ></textarea>
                                            <small className="text-muted">{quoteData.additional_notes.length}/500</small>
                                        </div> */}
                                        </div>
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div className="dashboard-card mb-4">
                                        <div className="card-header">
                                            <h5 className="card-title">
                                                <i className="fas fa-file-contract text-primary"></i>
                                                Terms & Conditions
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={
                                                        quoteData.terms_conditions
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "terms_conditions",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter any specific terms, payment conditions, or requirements..."
                                                    maxLength="2000"
                                                ></textarea>
                                                <small className="text-muted">
                                                    Optional: Add any specific
                                                    terms or conditions for this
                                                    job
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="col-lg-4">
                            {/* Sidebar */}

                            {/* Pricing Suggestions */}
                            {/* {pricingSuggestions && (
                                <div className="dashboard-card mb-4">
                                    <div className="card-header">
                                        <h5 className="card-title">
                                            <i className="fas fa-lightbulb text-warning"></i>
                                            Pricing Suggestions
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-grid gap-3">
                                            <div
                                                className="action-card cursor-pointer"
                                                onClick={() =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        pricingSuggestions.competitive
                                                    )
                                                }
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="action-title text-success">
                                                            Competitive
                                                        </div>
                                                        <div className="action-description">
                                                            Recommended for winning quotes
                                                        </div>
                                                    </div>
                                                    <div className="stats-value text-success" style={{fontSize: "1.25rem"}}>
                                                        Rs. {pricingSuggestions.competitive.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="action-card cursor-pointer"
                                                onClick={() =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        pricingSuggestions.suggested
                                                    )
                                                }
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="action-title text-primary">
                                                            Market Rate
                                                        </div>
                                                        <div className="action-description">
                                                            Average market pricing
                                                        </div>
                                                    </div>
                                                    <div className="stats-value text-primary" style={{fontSize: "1.25rem"}}>
                                                        Rs. {pricingSuggestions.suggested.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="action-card cursor-pointer"
                                                onClick={() =>
                                                    handleInputChange(
                                                        "quoted_price",
                                                        pricingSuggestions.premium
                                                    )
                                                }
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="action-title text-warning">
                                                            Premium
                                                        </div>
                                                        <div className="action-description">
                                                            For premium service quality
                                                        </div>
                                                    </div>
                                                    <div className="stats-value text-warning" style={{fontSize: "1.25rem"}}>
                                                        Rs. {pricingSuggestions.premium.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <small className="text-muted mt-3 d-block text-center">
                                            Click on any option to use that price
                                        </small>
                                    </div>
                                </div>
                            )} */}

                            {/* Quote Summary */}
                            <div className="stats-card mb-4">
                                <div className="stats-label">
                                    <i className="fas fa-calculator me-2"></i>
                                    Quote Summary
                                </div>
                                <div className="stats-value text-success">
                                    Rs.{" "}
                                    {(
                                        (parseInt(quoteData.quoted_price) ||
                                            0) +
                                        (parseInt(quoteData.travel_charges) ||
                                            0)
                                    ).toLocaleString()}
                                </div>
                                <div className="stats-change neutral">
                                    <div className="d-flex justify-content-between w-100 mb-2">
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
                                            <div className="d-flex justify-content-between w-100 mb-2">
                                                <span>Travel Charges:</span>
                                                <span>
                                                    Rs.{" "}
                                                    {parseInt(
                                                        quoteData.travel_charges
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    {quoteData.estimated_duration && (
                                        <div className="d-flex justify-content-between w-100 mb-1 text-muted small">
                                            <span>
                                                <i className="fas fa-clock me-1"></i>
                                                Duration:
                                            </span>
                                            <span>
                                                {quoteData.estimated_duration}{" "}
                                                hour(s)
                                            </span>
                                        </div>
                                    )}
                                    {quoteData.validity_days && (
                                        <div className="d-flex justify-content-between w-100 text-muted small">
                                            <span>
                                                <i className="fas fa-calendar me-1"></i>
                                                Valid for:
                                            </span>
                                            <span>
                                                {quoteData.validity_days} days
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quote Tips */}
                            <div className="tip-card">
                                <h6>
                                    <i className="fas fa-lightbulb text-info"></i>
                                    Quote Tips
                                </h6>
                                <p>
                                    <i className="fas fa-edit text-primary me-2"></i>
                                    Be detailed about what's included
                                    <br />
                                    <i className="fas fa-dollar-sign text-success me-2"></i>
                                    Price competitively but fairly
                                    <br />
                                    <i className="fas fa-star text-warning me-2"></i>
                                    Highlight your experience
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="d-flex gap-3 justify-content-end mt-6">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate("/provider/quotes")}
                            disabled={submitLoading}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitLoading || !quoteData.quote_id}
                        >
                            {submitLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Sending Quote...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Send Quote Response
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
