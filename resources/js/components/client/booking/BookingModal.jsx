import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingWizard from "./BookingWizard";

const BookingModal = ({ show, onHide, service, provider }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // Normalize service data to ensure consistent structure across all components
    const normalizedService = {
        id: service.id,
        title: service.title,
        description: service.description,
        // Fix price field inconsistencies
        price: service.base_price || service.price || 0,
        base_price: service.base_price || service.price || 0,
        formatted_price:
            service.formatted_price ||
            `Rs. ${service.base_price || service.price || 0}`,
        pricing_type: service.pricing_type || "fixed",

        // Fix duration field inconsistencies
        duration_hours: service.duration_hours || 1,
        default_duration:
            service.duration_hours || service.default_duration || 1,

        // Category data
        category: service.category || {
            id: 1,
            name: "General Service",
            color: "primary",
            icon: "fas fa-cog",
        },

        // Media and features
        first_image_url: service.first_image_url,
        service_image_urls: service.service_image_urls || service.images || [],
        average_rating: service.average_rating || 0,
        reviews_count: service.reviews_count || 0,

        // Service details (handle JSON fields safely)
        includes: service.includes || service.features || [],
        requirements: service.requirements || [],
        service_areas: service.service_areas || [],

        // Add-ons (if available)
        add_ons: service.add_ons || [],
    };

    // Normalize provider data to ensure consistent structure
    const normalizedProvider = {
        id: provider.id,
        name: provider.name || provider.business_name || "Service Provider",
        business_name: provider.business_name || provider.name,
        profile_image_url: provider.profile_image_url,
        bio: provider.bio || "Professional service provider",
        is_verified: provider.is_verified || false,

        // Location data
        city: provider.city || "Colombo",
        province: provider.province || "Western Province",
        service_radius: provider.service_radius || 25,
        travel_fee: provider.travel_fee || 0,

        // Stats and ratings
        average_rating: provider.average_rating || 0,
        reviews_count: provider.reviews_count || 0,
        total_services: provider.total_services || 0,
        completed_bookings: provider.completed_bookings || 0,
        years_experience: provider.years_experience || 0,
        response_time: provider.response_time || "2 hours",
    };

    const handleBookingComplete = (bookingData) => {
        console.log("Booking completed:", bookingData);

        // Close modal first
        onHide();

        // Navigate based on booking type
        if (bookingData.type === "quote_request") {
            navigate("/client/quotes", {
                state: {
                    message: "Quote request sent successfully!",
                    quote: bookingData.quote || bookingData.data,
                },
            });
        } else {
            navigate("/client/appointments", {
                state: {
                    message: "Booking request sent successfully!",
                    appointment: bookingData.appointment || bookingData.data,
                },
            });
        }
    };

    const handleFullBookingFlow = () => {
        console.log("Switching to full booking flow");
        onHide();
        navigate(`/client/booking/new/${normalizedService.id}`);
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                onClick={onHide}
                style={{ zIndex: 1040 }}
            ></div>

            {/* Modal */}
            <div
                className="modal fade show d-block"
                style={{ zIndex: 1050 }}
                tabIndex="-1"
            >
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <div className="modal-title-area">
                                <h5 className="modal-title fw-bold">
                                    Book Service
                                </h5>
                                <p className="text-muted mb-0 small">
                                    {normalizedService.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                                aria-label="Close"
                            ></button>
                        </div>

                        <div className="modal-body p-0">
                            <BookingWizard
                                service={normalizedService}
                                provider={normalizedProvider}
                                onComplete={handleBookingComplete}
                                onFullFlow={handleFullBookingFlow}
                                currentStep={currentStep}
                                setCurrentStep={setCurrentStep}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
                }
                .modal-dialog {
                    max-width: 1200px;
                }
                .modal-title-area .text-muted {
                    font-size: 0.875rem;
                }
            `}</style>
        </>
    );
};

export default BookingModal;
