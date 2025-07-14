// This component will now show pending quotes instead of quote requests
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
        if (quoteData.quote_id) {
            loadQuoteDetails();
        }
    }, [quoteData.quote_id]);

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

        try {
            const quote = pendingQuotes.find((q) => q.id == quoteData.quote_id);
            setSelectedQuote(quote);
        } catch (error) {
            console.error("Failed to load quote details:", error);
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
            <div className="create-quote-page">
                <div className="page-header mb-4">
                    <h2 className="fw-bold mb-1">Respond to Quote Request</h2>
                    <p className="text-muted mb-0">
                        Respond to a client's quote request with your pricing
                        and details
                    </p>
                </div>

                <form onSubmit={handleSubmitQuote}>
                    <div className="row">
                        <div className="col-lg-8">
                            {/* Quote Request Selection */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-search me-2 text-orange"></i>
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

                                    {/* Selected Request Details */}
                                    {selectedQuote && (
                                        <div className="selected-request bg-light rounded p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
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

                                            <div className="mt-3 pt-3 border-top">
                                                <strong>
                                                    What the client needs:
                                                </strong>
                                                <div className="mt-2 p-2 bg-white rounded border-start border-primary border-3">
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

                                            <div className="mt-3 pt-2 border-top">
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

                            {/* Quote Response Form - Same as before */}
                            {/* ... rest of your form code ... */}
                        </div>
                        {/* ... sidebar code ... */}
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
