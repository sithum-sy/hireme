//  for cases without pre-selected slot
import React, { useState } from "react";
import ProviderAvailabilitySlots from "../../services/ProviderAvailabilitySlots";

const TimeSelectionStep = ({
    service,
    provider,
    bookingData,
    onStepComplete,
    selectedSlot,
}) => {
    const [currentSelectedDate, setCurrentSelectedDate] = useState(
        selectedSlot?.date || bookingData.appointment_date || ""
    );
    const [currentSelectedSlot, setCurrentSelectedSlot] =
        useState(selectedSlot);

    const formatTime = (timeString) => {
        if (!timeString) return "";
        try {
            const [hours, minutes] = timeString.split(":");
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return timeString;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return dateString;
        }
    };

    const handleSlotSelect = (slot) => {
        // Create a properly formatted slot object
        const formattedSlot = {
            ...slot,
            formatted_date: formatDate(slot.date),
            formatted_time: formatTime(slot.time),
        };

        setCurrentSelectedSlot(formattedSlot);

        const stepData = {
            appointment_date: slot.date,
            appointment_time: slot.time,
            //  Include formatted versions for display
            formatted_appointment_date: formatDate(slot.date),
            formatted_appointment_time: formatTime(slot.time),
        };

        console.log("Time selection step data:", stepData); // Debug log

        // Auto-advance when time is selected
        onStepComplete(stepData);
    };

    return (
        <div className="time-selection-step">
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="text-center mb-4">
                            <h4 className="fw-bold text-purple">
                                Select Your Preferred Date & Time
                            </h4>
                            <p className="text-muted">
                                Choose when you'd like {provider?.name} to
                                provide the service
                            </p>
                        </div>

                        <ProviderAvailabilitySlots
                            service={service}
                            provider={provider}
                            selectedDate={currentSelectedDate}
                            onDateChange={setCurrentSelectedDate}
                            onSlotSelect={handleSlotSelect}
                            showDistance={false}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .text-purple { color: #6f42c1 !important; }
            `}</style>
        </div>
    );
};

export default TimeSelectionStep;
