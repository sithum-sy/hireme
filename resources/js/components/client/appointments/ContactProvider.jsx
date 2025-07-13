import React, { useState } from "react";

const ContactProvider = ({ appointment, onClose, onMessageSent }) => {
    const [messageType, setMessageType] = useState("quick");
    const [message, setMessage] = useState("");
    const [quickMessage, setQuickMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Quick message templates
    const quickMessages = [
        {
            value: "running_late",
            label: "Running Late",
            template:
                "Hi, I'm running about 15 minutes late for our appointment. Please let me know if this works for you.",
        },
        {
            value: "location_clarification",
            label: "Location Question",
            template:
                "Hi, I wanted to clarify the service location. Should I be available at the address provided, or do you need any additional directions?",
        },
        {
            value: "preparation_question",
            label: "Preparation Question",
            template:
                "Hi, is there anything specific I should prepare or have ready before you arrive for the service?",
        },
        {
            value: "scheduling_confirmation",
            label: "Confirm Schedule",
            template:
                "Hi, I wanted to confirm our appointment scheduled for today. Please let me know if you're still available.",
        },
        {
            value: "special_request",
            label: "Special Request",
            template:
                "Hi, I have a special request regarding our upcoming service. Could we discuss this briefly?",
        },
    ];

    const handleQuickMessageSelect = (templateValue) => {
        const template = quickMessages.find((m) => m.value === templateValue);
        if (template) {
            setMessage(template.template);
            setQuickMessage(templateValue);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            alert("Please enter a message");
            return;
        }

        setLoading(true);
        try {
            // This would integrate with your messaging system
            // For now, we'll simulate the API call
            console.log("Sending message to provider:", {
                appointmentId: appointment.id,
                providerId: appointment.provider_id,
                message: message.trim(),
                messageType: quickMessage || "custom",
            });

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (onMessageSent) {
                onMessageSent({
                    message: message.trim(),
                    timestamp: new Date().toISOString(),
                    type: quickMessage || "custom",
                });
            }

            alert("Message sent successfully!");
            onClose();
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneCall = () => {
        if (appointment.provider?.contact_number) {
            window.open(`tel:${appointment.provider.contact_number}`, "_self");
        } else {
            alert("Provider phone number not available");
        }
    };

    const handleWhatsApp = () => {
        if (appointment.provider?.contact_number) {
            const phoneNumber = appointment.provider.contact_number.replace(
                /[^\d]/g,
                ""
            );
            const defaultMessage = `Hi, this is regarding our appointment for ${appointment.service?.title} on ${appointment.formatted_date_time}`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                defaultMessage
            )}`;
            window.open(whatsappUrl, "_blank");
        } else {
            alert("Provider WhatsApp not available");
        }
    };

    return (
        <div className="contact-provider-panel">
            <div className="contact-header bg-light rounded p-3 mb-4">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h6 className="fw-bold mb-1">
                            Contact {appointment.provider?.first_name}{" "}
                            {appointment.provider?.last_name}
                        </h6>
                        <div className="text-muted small">
                            {appointment.provider?.provider_profile
                                ?.business_name && (
                                <div>
                                    {
                                        appointment.provider.provider_profile
                                            .business_name
                                    }
                                </div>
                            )}
                            <div>
                                Appointment: {appointment.service?.title} -{" "}
                                {appointment.formatted_date_time}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 text-end">
                        <span
                            className={`badge ${
                                appointment.status === "confirmed"
                                    ? "bg-success"
                                    : "bg-warning"
                            }`}
                        >
                            {appointment.status_text || appointment.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Contact Options */}
            <div className="quick-contact-options mb-4">
                <h6 className="fw-bold mb-3">Quick Contact</h6>
                <div className="row g-2">
                    <div className="col-4">
                        <button
                            className="btn btn-outline-success w-100"
                            onClick={handlePhoneCall}
                            disabled={!appointment.provider?.contact_number}
                        >
                            <i className="fas fa-phone mb-1 d-block"></i>
                            <small>Call</small>
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            className="btn btn-outline-success w-100"
                            onClick={handleWhatsApp}
                            disabled={!appointment.provider?.contact_number}
                        >
                            <i className="fab fa-whatsapp mb-1 d-block"></i>
                            <small>WhatsApp</small>
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            className="btn btn-outline-primary w-100"
                            onClick={() => setMessageType("in_app")}
                        >
                            <i className="fas fa-comments mb-1 d-block"></i>
                            <small>Message</small>
                        </button>
                    </div>
                </div>
            </div>

            {/* Messaging Section */}
            <div className="messaging-section">
                <h6 className="fw-bold mb-3">Send Message</h6>

                {/* Message Type Toggle */}
                <div className="message-type-toggle mb-3">
                    <div className="btn-group w-100" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="messageType"
                            id="quick"
                            checked={messageType === "quick"}
                            onChange={() => setMessageType("quick")}
                        />
                        <label
                            className="btn btn-outline-primary"
                            htmlFor="quick"
                        >
                            Quick Messages
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="messageType"
                            id="custom"
                            checked={messageType === "custom"}
                            onChange={() => setMessageType("custom")}
                        />
                        <label
                            className="btn btn-outline-primary"
                            htmlFor="custom"
                        >
                            Custom Message
                        </label>
                    </div>
                </div>

                {/* Quick Messages */}
                {messageType === "quick" && (
                    <div className="quick-messages mb-3">
                        <label className="form-label">
                            Select a quick message:
                        </label>
                        <select
                            className="form-select mb-2"
                            value={quickMessage}
                            onChange={(e) =>
                                handleQuickMessageSelect(e.target.value)
                            }
                        >
                            <option value="">
                                Choose a message template...
                            </option>
                            {quickMessages.map((msg) => (
                                <option key={msg.value} value={msg.value}>
                                    {msg.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Message Text Area */}
                <div className="message-input mb-3">
                    <label className="form-label">Message:</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder={
                            messageType === "quick"
                                ? "Select a quick message template above or write your own..."
                                : "Type your message here..."
                        }
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength="500"
                        disabled={loading}
                    ></textarea>
                    <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">
                            {messageType === "quick"
                                ? "You can edit the template message"
                                : "Be clear and polite"}
                        </small>
                        <small className="text-muted">
                            {message.length}/500
                        </small>
                    </div>
                </div>

                {/* Send Button */}
                <div className="send-message">
                    <button
                        className="btn btn-primary w-100"
                        onClick={handleSendMessage}
                        disabled={loading || !message.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane me-2"></i>
                                Send Message
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Contact Guidelines */}
            <div className="contact-guidelines bg-info bg-opacity-10 rounded p-3 mt-4">
                <h6 className="fw-bold text-info mb-2">
                    <i className="fas fa-info-circle me-2"></i>
                    Contact Guidelines
                </h6>
                <ul className="mb-0 small text-info">
                    <li>
                        Be respectful and professional in all communications
                    </li>
                    <li>Contact during reasonable hours (8 AM - 8 PM)</li>
                    <li>For emergencies, call directly instead of messaging</li>
                    <li>Allow up to 2 hours for message responses</li>
                    <li>Keep messages appointment-related</li>
                </ul>
            </div>

            {/* Provider Response Time */}
            {appointment.provider?.provider_profile?.response_time && (
                <div className="response-time-info mt-3 p-2 bg-light rounded">
                    <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        This provider typically responds within{" "}
                        {appointment.provider.provider_profile.response_time}
                    </small>
                </div>
            )}
        </div>
    );
};

export default ContactProvider;
