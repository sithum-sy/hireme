import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import QuoteStatusBadge from "../../../components/client/quotes/QuoteStatusBadge";
import QuoteTimeline from "../../../components/client/quotes/QuoteTimeline";
import clientService from "../../../services/clientService";
import AcceptQuoteModal from "../../../components/client/quotes/AcceptQuoteModal";
import DeclineQuoteModal from "../../../components/client/quotes/DeclineQuoteModal";
import BookingModal from "../../../components/client/booking/BookingModal";
import QuotesPDFDownloader from "../../../components/client/quotes/QuotesPDFDownloader";
import { constructProfileImageUrl } from "../../../hooks/useServiceImages";

const QuoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [clientLocation, setClientLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);

    useEffect(() => {
        loadQuoteDetail();
    }, [id]);

    // Initialize client location similar to ServiceDetail
    useEffect(() => {
        if (navigator.geolocation && !clientLocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Use Laravel backend proxy for geocoding
                        const response = await fetch(
                            `/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
                        );

                        if (response.ok) {
                            const data = await response.json();
                            const address = data.address || {};

                            const city =
                                address.city ||
                                address.town ||
                                address.village ||
                                address.municipality ||
                                address.county ||
                                "Unknown City";
                            const province =
                                address.state ||
                                address.province ||
                                address.state_district ||
                                "Sri Lanka";

                            let readableAddress = "";
                            if (address.house_number && address.road) {
                                readableAddress = `${address.house_number} ${address.road}, ${city}`;
                            } else if (address.road) {
                                readableAddress = `${address.road}, ${city}`;
                            } else {
                                readableAddress = `${city}, ${province}`;
                            }

                            const locationData = {
                                lat: latitude,
                                lng: longitude,
                                address: readableAddress,
                                neighborhood:
                                    address.suburb ||
                                    address.neighbourhood ||
                                    "",
                                city: city,
                                province: province,
                                country: "Sri Lanka",
                                radius: 15,
                                accuracy: "nominatim_geocoded",
                            };

                            setClientLocation(locationData);
                            setLocationLoading(false);
                        } else {
                            throw new Error("Geocoding failed");
                        }
                    } catch (error) {
                        console.error("Geocoding failed:", error);
                        // Fallback to basic location
                        const fallbackLocation = {
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            address: "Your Current Location",
                            province: "Sri Lanka",
                            radius: 15,
                            accuracy: "gps_fallback",
                        };
                        setClientLocation(fallbackLocation);
                        setLocationLoading(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setClientLocation(null);
                    setLocationLoading(false);
                }
            );
        } else {
            // Set location loading to false if geolocation is not available
            setLocationLoading(false);
        }
    }, []);

    const loadQuoteDetail = async () => {
        setLoading(true);
        try {
            const response = await clientService.getQuoteDetail(id);
            if (response.success) {
                console.log("Raw quote data from API:", response.data);
                setQuote(response.data);
            } else {
                setError(response.message || "Quote not found");
            }
        } catch (error) {
            console.error("Failed to load quote:", error);
            setError("Failed to load quote details");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuote = () => {
        // Use BookingModal for better user experience
        setShowBookingModal(true);
    };

    // Create service and provider objects for BookingModal
    const serviceForBooking = quote
        ? {
              id: quote.service_id,
              title: quote.service_title,
              description: quote.service_description || quote.message,
              base_price: quote.quoted_price,
              price: quote.quoted_price,
              duration_hours: quote.estimated_duration || 1,
              category: quote.service_category || {
                  name: "Service",
                  color: "primary",
                  icon: "fas fa-cog",
              },
              first_image_url: quote.service_images,
              pricing_type: "fixed",
          }
        : null;

    const providerForBooking = quote
        ? {
              id: quote.provider_id,
              name: quote.provider_business_name || quote.provider_name,
              profile_image_url: quote.provider_image,
              average_rating: quote.provider_rating || 0,
              reviews_count: quote.provider_reviews || 0,
              is_verified: true,
              business_name: quote.provider_business_name,
          }
        : null;

    // Create pre-selected slot from quote data
    const selectedSlot = quote
        ? {
              date: quote.requested_date,
              time: quote.requested_time,
              formatted_date: quote.requested_date
                  ? new Date(quote.requested_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })
                  : "",
              formatted_time: quote.requested_time
                  ? (() => {
                        const [hours, minutes] =
                            quote.requested_time.split(":");
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes} ${ampm}`;
                    })()
                  : "",
          }
        : null;

    const handleDeclineQuote = () => {
        setShowDeclineModal(true);
    };

    const handleAcceptSuccess = (updatedQuote) => {
        setQuote(updatedQuote);
        setShowAcceptModal(false);
    };

    const handleDeclineSuccess = (updatedQuote) => {
        setQuote(updatedQuote);
        setShowDeclineModal(false);
    };

    if (loading) {
        return (
            <ClientLayout>
                <LoadingSpinner message="Loading quote details..." />
            </ClientLayout>
        );
    }

    if (error) {
        return (
            <ClientLayout>
                <div className="error-state text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h4 className="text-danger">{error}</h4>
                    <Link to="/client/quotes" className="btn btn-primary mt-3">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Quotes
                    </Link>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="page-content">
                {/* Header */}
                <div className="page-header d-flex justify-content-between align-items-start">
                    <div>
                        <h2 className="fw-bold mb-2">{quote.service_title}</h2>
                        <div className="d-flex align-items-center gap-3">
                            <QuoteStatusBadge status={quote.status} />
                            <span className="text-muted">
                                Quote #{quote.quote_number}
                            </span>
                            {quote.expires_at && (
                                <span className="text-warning">
                                    <i className="fas fa-clock me-1"></i>
                                    Expires:{" "}
                                    {new Date(
                                        quote.expires_at
                                    ).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="quote-actions d-flex gap-2">
                        {quote.status === "quoted" && (
                            <>
                                <button
                                    className="btn btn-success"
                                    onClick={handleAcceptQuote}
                                >
                                    <i className="fas fa-check me-2"></i>
                                    Accept Quote
                                </button>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={handleDeclineQuote}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Decline
                                </button>
                            </>
                        )}

                        {/* PDF Download Button - Always available */}
                        <QuotesPDFDownloader
                            quote={quote}
                            role="client"
                            className="btn btn-outline-secondary"
                            buttonText="Download Quote"
                        />
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Quote Details Card */}
                        <div className="dashboard-card mb-4">
                            <div className="card-header">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-quote-left me-2 text-primary"></i>
                                    Quote Details
                                </h5>
                            </div>
                            <div className="card-body">
                                {/* Service Information */}
                                <div className="service-info mb-4">
                                    <h6 className="fw-bold mb-2">
                                        Service Requested
                                    </h6>
                                    <div className="bg-light rounded p-3">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <h6 className="fw-bold">
                                                    {quote.service_title}
                                                </h6>
                                                {quote.service_category && (
                                                    <div className="mb-2">
                                                        <span
                                                            className={`badge bg-${
                                                                quote
                                                                    .service_category
                                                                    .color ||
                                                                "primary"
                                                            } me-2`}
                                                        >
                                                            <i
                                                                className={`${
                                                                    quote
                                                                        .service_category
                                                                        .icon ||
                                                                    "fas fa-cog"
                                                                } me-1`}
                                                            ></i>
                                                            {quote
                                                                .service_category
                                                                .name ||
                                                                quote.service_category}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-muted mb-2">
                                                    {quote.service_description}
                                                </p>
                                                <div className="text-muted small">
                                                    <i className="fas fa-calendar me-2"></i>
                                                    Requested for:{" "}
                                                    {new Date(
                                                        quote.requested_date
                                                    ).toLocaleDateString()}
                                                    {quote.requested_time && (
                                                        <>
                                                            <i className="fas fa-clock ms-3 me-2"></i>
                                                            {
                                                                quote.requested_time
                                                            }
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-4 text-end">
                                                {quote.service_images && (
                                                    <img
                                                        src={
                                                            quote.service_images
                                                        }
                                                        alt={
                                                            quote.service_title
                                                        }
                                                        className="img-fluid rounded"
                                                        style={{
                                                            maxHeight: "80px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Your Requirements */}
                                <div className="client-requirements mb-4">
                                    <h6 className="fw-bold mb-2">
                                        Your Requirements
                                    </h6>
                                    <div className="bg-light rounded p-3">
                                        <p className="mb-2">{quote.message}</p>
                                        {quote.special_requirements && (
                                            <div className="mt-2">
                                                <strong>
                                                    Special Requirements:
                                                </strong>
                                                <p className="mb-0 mt-1">
                                                    {quote.special_requirements}
                                                </p>
                                            </div>
                                        )}
                                        <div className="row mt-2">
                                            <div className="col-6">
                                                <small className="text-muted">
                                                    <strong>Location:</strong>{" "}
                                                    {quote.location_summary}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Response - Only show if quote has been responded to */}
                                {quote.status === "quoted" &&
                                    quote.provider_response && (
                                        <div className="provider-response mb-4">
                                            <h6 className="fw-bold mb-2">
                                                Provider Response
                                            </h6>
                                            <div className="bg-success bg-opacity-10 border border-success rounded p-3">
                                                <p className="mb-2">
                                                    {quote.provider_response}
                                                </p>
                                                {quote.quote_notes && (
                                                    <div className="mt-2">
                                                        <strong>
                                                            Additional Notes:
                                                        </strong>
                                                        <p className="mb-0 mt-1">
                                                            {quote.quote_notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Terms and Conditions - Show if quote has terms */}
                                {(quote.status === "quoted" ||
                                    quote.status === "accepted") &&
                                    quote.terms_conditions && (
                                        <div className="terms-conditions mb-4">
                                            <h6 className="fw-bold mb-2">
                                                <i className="fas fa-file-contract me-2 text-warning"></i>
                                                Terms & Conditions
                                            </h6>
                                            <div className="bg-warning bg-opacity-10 border border-warning rounded p-3">
                                                <p className="mb-0 small">
                                                    {quote.terms_conditions}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h5 className="card-title">
                                    <i className="fas fa-history text-primary"></i>
                                    Quote Timeline
                                </h5>
                            </div>
                            <div className="card-body">
                                <QuoteTimeline quote={quote} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Provider Info */}
                        <div className="dashboard-card mb-4">
                            <div className="card-header">
                                <h5 className="card-title">
                                    <i className="fas fa-user text-primary"></i>
                                    Service Provider
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="provider-info">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="me-3 flex-shrink-0">
                                            {(() => {
                                                const profileImageUrl =
                                                    constructProfileImageUrl(
                                                        quote.provider_image
                                                    );
                                                if (profileImageUrl) {
                                                    return (
                                                        <img
                                                            src={
                                                                profileImageUrl
                                                            }
                                                            alt={
                                                                quote.provider_business_name ||
                                                                quote.provider_name ||
                                                                "Provider"
                                                            }
                                                            className="rounded-circle"
                                                            style={{
                                                                width: "50px",
                                                                height: "50px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                                const fallback =
                                                                    e.target.parentNode.querySelector(
                                                                        ".fallback-avatar"
                                                                    );
                                                                if (fallback) {
                                                                    fallback.style.display =
                                                                        "flex";
                                                                }
                                                            }}
                                                        />
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {/* <div
                                                className="fallback-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    display: constructProfileImageUrl(quote.provider_image) ? "none" : "flex",
                                                }}
                                            >
                                                <i className="fas fa-user"></i>
                                            </div> */}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                {quote.provider_business_name ||
                                                    quote.provider_name ||
                                                    "Provider"}
                                            </h6>
                                            <div className="text-muted small">
                                                <i className="fas fa-star text-warning me-1"></i>
                                                {Number(
                                                    quote.provider_rating
                                                ).toFixed(1) || 0}{" "}
                                                ({quote.provider_reviews || 0}{" "}
                                                reviews)
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="provider-contact">
                                        <Link
                                            to={`/client/providers/${quote.provider_id}`}
                                            className="btn btn-outline-primary btn-sm w-100"
                                        >
                                            <i className="fas fa-eye me-2"></i>
                                            View Provider Profile
                                        </Link>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Summary - Show if quoted or accepted */}
                        {(quote.status === "quoted" ||
                            quote.status === "accepted") &&
                            quote.quoted_price && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div
                                        className={`card-header text-white ${
                                            quote.status === "accepted"
                                                ? "bg-info"
                                                : "bg-success"
                                        }`}
                                    >
                                        <h6 className="fw-bold mb-0">
                                            <i
                                                className={`fas ${
                                                    quote.status === "accepted"
                                                        ? "fa-check-circle"
                                                        : "fa-dollar-sign"
                                                } me-2`}
                                            ></i>
                                            {quote.status === "accepted"
                                                ? "Accepted Quote Summary"
                                                : "Quote Summary"}
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="pricing-breakdown">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Service Fee</span>
                                                <span>
                                                    Rs. {quote.quoted_price}
                                                </span>
                                            </div>

                                            {quote.estimated_duration && (
                                                <div className="d-flex justify-content-between mb-2 text-muted small">
                                                    <span>
                                                        Estimated Duration
                                                    </span>
                                                    <span>
                                                        {
                                                            quote.estimated_duration
                                                        }{" "}
                                                        hours
                                                    </span>
                                                </div>
                                            )}

                                            {quote.travel_fee &&
                                                quote.travel_fee > 0 && (
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="text-warning">
                                                            Travel Fee
                                                        </span>
                                                        <span className="text-warning">
                                                            Rs.{" "}
                                                            {quote.travel_fee}
                                                        </span>
                                                    </div>
                                                )}

                                            <hr />

                                            <div className="d-flex justify-content-between fw-bold">
                                                <span>Total Quoted Price</span>
                                                <span className="text-success h5 mb-0">
                                                    Rs.{" "}
                                                    {parseFloat(
                                                        quote.quoted_price
                                                    ) +
                                                        parseFloat(
                                                            quote.travel_fee ||
                                                                0
                                                        )}
                                                </span>
                                            </div>

                                            {quote.validity_days && (
                                                <div className="text-muted small mt-2 text-center">
                                                    Valid for{" "}
                                                    {quote.validity_days} days
                                                    from quote date
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* Important Info */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-info-circle text-info me-2"></i>
                                    Important Information
                                </h6>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled small text-muted mb-0">
                                    <li className="mb-2">
                                        <i className="fas fa-clock text-warning me-2"></i>
                                        {quote.status === "pending"
                                            ? "Waiting for provider response"
                                            : quote.status === "quoted"
                                            ? "Quote is waiting for your response"
                                            : "Quote has been processed"}
                                    </li>
                                    <li className="mb-2">
                                        <i className="fas fa-shield-alt text-success me-2"></i>
                                        All quotes are backed by our service
                                        guarantee
                                    </li>
                                    <li className="mb-2">
                                        <i className="fas fa-calendar text-info me-2"></i>
                                        Accepting creates an appointment
                                        automatically
                                    </li>
                                    <li>
                                        <i className="fas fa-phone text-primary me-2"></i>
                                        Contact support if you have questions
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-4">
                    <Link
                        to="/client/quotes"
                        className="btn btn-outline-secondary"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to All Quotes
                    </Link>
                </div>
            </div>
            {/* Modals */}
            <AcceptQuoteModal
                show={showAcceptModal}
                onHide={() => setShowAcceptModal(false)}
                quote={quote}
                onAcceptSuccess={handleAcceptSuccess}
            />

            <DeclineQuoteModal
                show={showDeclineModal}
                onHide={() => setShowDeclineModal(false)}
                quote={quote}
                onDeclineSuccess={handleDeclineSuccess}
            />

            {/* Booking Modal for Quote Acceptance */}
            {quote && serviceForBooking && providerForBooking && (
                <BookingModal
                    show={showBookingModal}
                    onHide={() => setShowBookingModal(false)}
                    service={serviceForBooking}
                    provider={providerForBooking}
                    selectedSlot={selectedSlot}
                    clientLocation={clientLocation} // Pass detected client location
                    quoteId={quote.id} // Pass quote ID for acceptance tracking
                    onQuoteAccepted={(updatedQuote) => {
                        // Update the quote state when it's accepted
                        setQuote(updatedQuote);
                    }}
                />
            )}

            <style>{`
                /* Using CSS variables for consistent theming */
            `}</style>
        </ClientLayout>
    );
};

export default QuoteDetail;
