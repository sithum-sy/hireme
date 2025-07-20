import React, { useState, useEffect } from "react";
import clientAvailabilityService from "../../../services/clientAvailabilityService";
import { createPortal } from "react-dom";

const ProviderAvailabilitySlots = ({
    service,
    provider,
    onSlotSelect,
    selectedDate,
    onDateChange,
}) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            loadAvailableSlots(selectedDate);
        }
    }, [selectedDate, provider.id, service.id]);

    const loadAvailableSlots = async (date) => {
        setLoading(true);
        try {
            const response = await clientAvailabilityService.getAvailableSlots({
                provider_id: provider.id,
                service_id: service.id,
                date: date,
                duration: service.default_duration || 1,
            });

            if (response.success) {
                setAvailableSlots(response.data);
            }
        } catch (error) {
            console.error("Failed to load available slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = (startDate) => {
        const dates = [];
        const start = new Date(startDate);

        // Fix timezone issues by setting to noon
        start.setHours(12, 0, 0, 0);

        // Go to the start of the week (Monday)
        const day = start.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // If Sunday (0), go back 6 days; else, go back to Monday
        start.setDate(start.getDate() + diff);

        // console.log("🔍 Frontend: Generating week starting from:", start);

        for (let i = 0; i < 7; i++) {
            // Create new date for each day, avoiding timezone issues
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

            // console.log(
            //     `Day ${i}: ${
            //         date.toISOString().split("T")[0]
            //     } (${date.toLocaleDateString("en-US", { weekday: "long" })})`
            // );

            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateSelect = (date) => {
        const dateString = formatDate(date);
        onDateChange(dateString);
    };

    // const handleSlotSelect = (slot) => {
    //     onSlotSelect({
    //         date: selectedDate,
    //         time: slot.time,
    //         formatted_time: slot.formatted_time,
    //         slot: slot,
    //     });
    // };

    const handleSlotSelect = (slot) => {
        const selectedSlotData = {
            date: selectedDate,
            time: slot.time,
            formatted_time: slot.formatted_time,
            slot: slot,
            // Additional formatted data for easy use
            formatted_date: new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            formatted_date_short: new Date(selectedDate).toLocaleDateString(
                "en-US",
                {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }
            ),
            // ISO datetime for backend
            datetime_iso: `${selectedDate}T${slot.time}:00`,
        };

        // console.log("Selected slot data:", selectedSlotData);
        onSlotSelect(selectedSlotData);
    };

    // Filter out past time slots for today
    const filterAvailableSlots = (slots) => {
        const today = new Date().toISOString().split("T")[0];

        // If selected date is today, filter out past times
        if (selectedDate === today) {
            const now = new Date();
            return slots.filter((slot) => {
                const slotDateTime = new Date(`${selectedDate}T${slot.time}`);
                return slotDateTime > now;
            });
        }

        // For future dates, return all slots
        return slots;
    };

    // Function to handle contact provider
    const handleContactProvider = () => {
        setShowContactModal(true);
    };

    const weekDates = getWeekDates(currentWeek);
    const today = new Date();

    useEffect(() => {
        if (showContactModal) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
            document.body.classList.add("modal-open");
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = "unset";
            document.body.classList.remove("modal-open");
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
            document.body.classList.remove("modal-open");
        };
    }, [showContactModal]);

    return (
        <div className="provider-availability-slots">
            <div className="availability-header mb-4">
                <h5 className="fw-bold mb-2">Select Date & Time</h5>
                <p className="text-muted mb-0">
                    Choose your preferred date and time for the service
                </p>
            </div>

            {/* Date Selection */}
            <div className="date-selection mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-semibold mb-0">Available Dates</h6>
                    <div className="week-navigation">
                        <button
                            className="btn btn-outline-secondary btn-sm me-2"
                            onClick={() => {
                                const prevWeek = new Date(currentWeek);
                                prevWeek.setDate(prevWeek.getDate() - 7);
                                setCurrentWeek(prevWeek);
                            }}
                            disabled={currentWeek <= today}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        <span className="fw-semibold">
                            {weekDates[0].toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                            })}
                        </span>

                        <button
                            className="btn btn-outline-secondary btn-sm ms-2"
                            onClick={() => {
                                const nextWeek = new Date(currentWeek);
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                setCurrentWeek(nextWeek);
                            }}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div className="row g-2">
                    {weekDates.map((date, index) => {
                        const dateString = formatDate(date);
                        const isDisabled = isDateDisabled(date);
                        const isSelected = selectedDate === dateString;
                        const isToday =
                            date.toDateString() === today.toDateString();

                        return (
                            <div key={index} className="col">
                                <button
                                    className={`date-option w-100 btn ${
                                        isSelected
                                            ? "btn-purple"
                                            : isDisabled
                                            ? "btn-outline-secondary disabled"
                                            : "btn-outline-secondary"
                                    }`}
                                    onClick={() =>
                                        !isDisabled && handleDateSelect(date)
                                    }
                                    disabled={isDisabled}
                                    style={{ minHeight: "60px" }}
                                >
                                    <div className="text-center">
                                        <div className="day-name small">
                                            {date.toLocaleDateString("en-US", {
                                                weekday: "short",
                                            })}
                                        </div>
                                        <div className="day-number fw-bold">
                                            {date.getDate()}
                                        </div>
                                        {isToday && (
                                            <div className="badge bg-primary bg-opacity-10 text-primary small">
                                                Today
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className="time-slots-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-semibold mb-0">
                            Available Time Slots
                        </h6>
                        <small className="text-muted">
                            {new Date(selectedDate).toLocaleDateString(
                                "en-US",
                                {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                }
                            )}
                        </small>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div
                                className="spinner-border text-purple"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                            <div className="mt-2 text-muted">
                                Loading available times...
                            </div>
                        </div>
                    ) : (
                        <div className="time-slots">
                            {(() => {
                                const filteredSlots =
                                    filterAvailableSlots(availableSlots);
                                return filteredSlots.length > 0 ? (
                                    <div className="row g-2">
                                        {filteredSlots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="col-6 col-md-4 col-lg-3"
                                            >
                                                <button
                                                    className="time-slot-btn w-100 btn btn-outline-purple"
                                                    onClick={() =>
                                                        handleSlotSelect(slot)
                                                    }
                                                >
                                                    <div className="slot-time fw-semibold">
                                                        {slot.formatted_time}
                                                    </div>
                                                    {/* {slot.is_popular && (
                                                    <small className="badge bg-warning mt-1">
                                                        Popular
                                                    </small>
                                                )} */}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    (() => {
                                        const today = new Date()
                                            .toISOString()
                                            .split("T")[0];
                                        const isToday = selectedDate === today;
                                        const hasOriginalSlots =
                                            availableSlots.length > 0;

                                        // If we had slots but they were filtered out (past times)
                                        if (isToday && hasOriginalSlots) {
                                            return (
                                                <div className="no-slots text-center py-4">
                                                    <i className="fas fa-clock fa-2x text-muted mb-2"></i>
                                                    <h6 className="text-muted">
                                                        All time slots have
                                                        passed
                                                    </h6>
                                                    <p className="text-muted small mb-3">
                                                        No more slots available
                                                        today. Try selecting
                                                        tomorrow or contact the
                                                        provider for urgent
                                                        bookings.
                                                    </p>
                                                    <button
                                                        className="btn btn-outline-purple btn-sm"
                                                        onClick={
                                                            handleContactProvider
                                                        }
                                                    >
                                                        <i className="fas fa-phone me-2"></i>
                                                        Contact Provider
                                                    </button>
                                                </div>
                                            );
                                        }

                                        // Original no slots message
                                        return (
                                            <div className="no-slots text-center py-4">
                                                <i className="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                                                <h6 className="text-muted">
                                                    No available times
                                                </h6>
                                                <p className="text-muted small mb-3">
                                                    {(() => {
                                                        const today = new Date()
                                                            .toISOString()
                                                            .split("T")[0];
                                                        const isToday =
                                                            selectedDate ===
                                                            today;

                                                        if (isToday) {
                                                            return "No more slots available today. Try selecting tomorrow or contact the provider for urgent bookings.";
                                                        } else {
                                                            return "Please select a different date or contact the provider directly.";
                                                        }
                                                    })()}
                                                </p>
                                                <button
                                                    className="btn btn-outline-purple btn-sm"
                                                    onClick={
                                                        handleContactProvider
                                                    }
                                                >
                                                    <i className="fas fa-phone me-2"></i>
                                                    Contact Provider
                                                </button>
                                            </div>
                                        );
                                    })()
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}

            {showContactModal &&
                createPortal(
                    <div
                        className="contact-modal-overlay"
                        onClick={() => setShowContactModal(false)}
                    >
                        <div
                            className="contact-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="contact-modal-header">
                                <h5>
                                    <i className="fas fa-address-book me-2"></i>
                                    Contact Provider
                                </h5>
                                <button
                                    className="contact-modal-close"
                                    onClick={() => setShowContactModal(false)}
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="contact-modal-body">
                                <div className="text-center mb-3">
                                    <h6 className="fw-bold">
                                        {provider.business_name ||
                                            `${provider.first_name || ""} ${
                                                provider.last_name || ""
                                            }`.trim() ||
                                            provider.name ||
                                            "Service Provider"}
                                    </h6>
                                </div>

                                {/* Email */}
                                {provider.email && (
                                    <div className="mb-3">
                                        <label className="fw-semibold">
                                            Email:
                                        </label>
                                        <div className="d-flex align-items-center mt-1">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={provider.email}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-outline-secondary ms-2"
                                                onClick={() =>
                                                    navigator.clipboard.writeText(
                                                        provider.email
                                                    )
                                                }
                                            >
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Phone */}
                                {provider.contact_number && (
                                    <div className="mb-3">
                                        <label className="fw-semibold">
                                            Phone Number:
                                        </label>
                                        <div className="d-flex align-items-center mt-1">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={provider.contact_number}
                                                readOnly
                                            />
                                            <button
                                                className="btn btn-outline-secondary ms-2"
                                                onClick={() =>
                                                    navigator.clipboard.writeText(
                                                        provider.contact_number
                                                    )
                                                }
                                            >
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="contact-modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowContactModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
                }
                .btn-purple {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .btn-purple:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                    color: white;
                }
                .btn-outline-purple {
                    color: #6f42c1;
                    border-color: #6f42c1;
                }
                .btn-outline-purple:hover {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .date-option,
                .time-slot-btn {
                    transition: all 0.2s ease;
                }
                .time-slot-btn {
                    height: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .modal.show {
                    display: block !important;
                }
                .contact-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                }

                .contact-modal-content {
                    background: white;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .contact-modal-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: between;
                    align-items: center;
                }

                .contact-modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    margin-left: auto;
                }

                .contact-modal-body {
                    padding: 1.5rem;
                }

                .contact-modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #dee2e6;
                    text-align: right;
                }
            `}</style>
        </div>
    );
};

export default ProviderAvailabilitySlots;
