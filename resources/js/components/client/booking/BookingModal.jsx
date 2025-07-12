import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingWizard from "./BookingWizard";

const BookingModal = ({ show, onHide, service, provider }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const handleBookingComplete = (bookingData) => {
        // Close modal and navigate to booking success
        onHide();
        navigate(`/client/appointments/${bookingData.id}`, {
            state: {
                message: "Booking request sent successfully!",
                booking: bookingData,
            },
        });
    };

    const handleFullBookingFlow = () => {
        // Close modal and navigate to full booking page
        onHide();
        navigate(`/client/booking/new/${service.id}`);
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
                                <p className="text-muted mb-0">
                                    {service.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                            ></button>
                        </div>

                        <div className="modal-body p-0">
                            <BookingWizard
                                service={service}
                                provider={provider}
                                onComplete={handleBookingComplete}
                                onFullFlow={handleFullBookingFlow}
                                currentStep={currentStep}
                                setCurrentStep={setCurrentStep}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingModal;
