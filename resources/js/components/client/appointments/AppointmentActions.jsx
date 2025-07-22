import React, { useState } from "react";

const AppointmentActions = ({
    appointment,
    onCancel,
    onReschedule,
    onReview,
    onContact,
    onAddNotes,
    loading = false,
    showLabels = true,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    // Check if appointment can be cancelled (24 hours rule)
    const canBeCancelled = () => {
        if (!["pending", "confirmed"].includes(appointment.status))
            return false;

        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.appointment_time}`
        );
        const now = new Date();
        const hoursUntilAppointment =
            (appointmentDateTime - now) / (1000 * 60 * 60);

        return hoursUntilAppointment > 24;
    };

    const canCancel = canBeCancelled();

    // Get available actions based on appointment status
    const getAvailableActions = () => {
        const actions = [];

        // View Details - Always available
        actions.push({
            key: "view",
            label: "View Details",
            icon: "fas fa-eye",
            className: "btn-outline-purple",
            action: () =>
                (window.location.href = `/client/appointments/${appointment.id}`),
            primary: true,
        });

        switch (appointment.status) {
            case "pending":
                // Edit button for pending appointments (direct changes)
                if (onReschedule) {
                    actions.push({
                        key: "edit",
                        label: "Edit Appointment",
                        icon: "fas fa-edit",
                        className: "btn-outline-primary",
                        action: () => onReschedule(appointment, "edit"),
                    });
                }
                if (onContact) {
                    actions.push({
                        key: "contact",
                        label: "Contact Provider",
                        icon: "fas fa-phone",
                        className: "btn-outline-info",
                        action: () => onContact(appointment),
                    });
                }
                if (canCancel && onCancel) {
                    actions.push({
                        key: "cancel",
                        label: "Cancel",
                        icon: "fas fa-times",
                        className: "btn-outline-danger",
                        action: () => onCancel(appointment),
                        confirm: true,
                        confirmMessage:
                            "Are you sure you want to cancel this appointment?",
                    });
                }
                break;

            case "confirmed":
                // Smart reschedule/edit button based on status
                if (onReschedule) {
                    actions.push({
                        key: "reschedule",
                        label: "Reschedule",
                        icon: "fas fa-calendar-alt",
                        className: "btn-outline-warning",
                        action: () => onReschedule(appointment),
                    });
                }
                if (onContact) {
                    actions.push({
                        key: "contact",
                        label: "Contact Provider",
                        icon: "fas fa-phone",
                        className: "btn-outline-info",
                        action: () => onContact(appointment),
                    });
                }
                if (canCancel && onCancel) {
                    actions.push({
                        key: "cancel",
                        label: "Cancel",
                        icon: "fas fa-times",
                        className: "btn-outline-danger",
                        action: () => onCancel(appointment),
                        confirm: true,
                        confirmMessage:
                            "Are you sure you want to cancel this appointment?",
                    });
                }
                break;

            case "in_progress":
                if (onContact) {
                    actions.push({
                        key: "contact",
                        label: "Contact Provider",
                        icon: "fas fa-phone",
                        className: "btn-outline-info",
                        action: () => onContact(appointment),
                    });
                }
                break;

            case "completed":
                if (!appointment.provider_rating && onReview) {
                    actions.push({
                        key: "review",
                        label: "Write Review",
                        icon: "fas fa-star",
                        className: "btn-outline-success",
                        action: () => onReview(appointment),
                    });
                }
                // Add option to book again
                actions.push({
                    key: "book_again",
                    label: "Book Again",
                    icon: "fas fa-redo",
                    className: "btn-outline-purple",
                    action: () =>
                        (window.location.href = `/client/services/${appointment.service?.id}`),
                });
                break;
        }

        // Add notes action for all statuses
        if (
            onAddNotes &&
            ["pending", "confirmed", "in_progress"].includes(appointment.status)
        ) {
            actions.push({
                key: "add_notes",
                label: "Add Notes",
                icon: "fas fa-sticky-note",
                className: "btn-outline-secondary",
                action: () => onAddNotes(appointment),
            });
        }

        return actions;
    };

    const handleActionClick = (action) => {
        if (action.confirm) {
            if (window.confirm(action.confirmMessage)) {
                action.action();
            }
        } else {
            action.action();
        }
        setShowDropdown(false);
    };

    const actions = getAvailableActions();
    const primaryActions = actions.filter((a) => a.primary);
    const secondaryActions = actions.filter((a) => !a.primary);

    return (
        <div className="appointment-actions position-relative">
            {/* Primary Actions (always visible) */}
            <div className="d-flex gap-1 flex-wrap justify-content-end">
                {primaryActions.slice(0, 2).map((action) => (
                    <button
                        key={action.key}
                        className={`btn btn-sm ${action.className}`}
                        onClick={() => handleActionClick(action)}
                        disabled={loading}
                        title={action.label}
                    >
                        <i
                            className={`${action.icon} ${
                                showLabels ? "me-1" : ""
                            }`}
                        ></i>
                        {showLabels && (
                            <span className="d-none d-md-inline">
                                {action.label}
                            </span>
                        )}
                    </button>
                ))}

                {/* Secondary Actions (2-3 visible, rest in dropdown) */}
                {secondaryActions.slice(0, 2).map((action) => (
                    <button
                        key={action.key}
                        className={`btn btn-sm ${action.className}`}
                        onClick={() => handleActionClick(action)}
                        disabled={loading}
                        title={action.label}
                    >
                        <i
                            className={`${action.icon} ${
                                showLabels ? "me-1" : ""
                            }`}
                        ></i>
                        {showLabels && (
                            <span className="d-none d-lg-inline">
                                {action.label}
                            </span>
                        )}
                    </button>
                ))}

                {/* More Actions Dropdown */}
                {secondaryActions.length > 2 && (
                    <div className="dropdown">
                        <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            onClick={() => setShowDropdown(!showDropdown)}
                            disabled={loading}
                            title="More actions"
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>

                        {showDropdown && (
                            <div className="dropdown-menu dropdown-menu-end show">
                                {secondaryActions.slice(2).map((action) => (
                                    <button
                                        key={action.key}
                                        className="dropdown-item"
                                        onClick={() =>
                                            handleActionClick(action)
                                        }
                                        disabled={loading}
                                    >
                                        <i
                                            className={`${action.icon} me-2`}
                                        ></i>
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div
                        className="spinner-border spinner-border-sm text-purple ms-2"
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                )}
            </div>

            {/* Cancellation Policy Warning */}
            {["pending", "confirmed"].includes(appointment.status) &&
                !canCancel && (
                    <div className="mt-1">
                        <small className="text-danger">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            Cannot cancel (24h deadline passed)
                        </small>
                    </div>
                )}

            {/* Rating Display for Completed Appointments */}
            {appointment.status === "completed" &&
                appointment.provider_rating && (
                    <div className="mt-1 text-end">
                        <small className="text-muted">Your rating:</small>
                        <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                                <i
                                    key={i}
                                    className={`fas fa-star small ${
                                        i < appointment.provider_rating
                                            ? "text-warning"
                                            : "text-muted"
                                    }`}
                                ></i>
                            ))}
                        </div>
                    </div>
                )}

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowDropdown(false)}
                ></div>
            )}
        </div>
    );
};

export default AppointmentActions;
