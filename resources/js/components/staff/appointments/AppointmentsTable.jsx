import React, { useState } from "react";
import { useStableImageUrl } from "../../../hooks/useStableImageUrl";

const AppointmentsTable = ({
    appointments = [],
    onStatusUpdate,
    onDeleteAppointment,
    isProcessing = false,
    loading = false,
}) => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedCancelAppointment, setSelectedCancelAppointment] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [cancellationReason, setCancellationReason] = useState("");

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "Not set";
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "LKR",
        }).format(price);
    };

    const getStatusBadge = (status) => {
        // Debug: log the actual status value
        console.log('Status received:', status, 'Type:', typeof status);
        
        const statusConfig = {
            'pending': { class: "bg-warning text-dark", icon: "fas fa-clock" },
            'confirmed': { class: "bg-info", icon: "fas fa-check-circle" },
            'in_progress': { class: "bg-primary", icon: "fas fa-spinner" },
            'completed': { class: "bg-success", icon: "fas fa-flag-checkered" },
            'cancelled_by_client': { class: "bg-secondary", icon: "fas fa-times-circle" },
            'cancelled_by_provider': { class: "bg-secondary", icon: "fas fa-times-circle" },
            'cancelled_by_staff': { class: "bg-danger", icon: "fas fa-user-times" },
            'no_show': { class: "bg-dark", icon: "fas fa-ban" },
            'disputed': { class: "bg-danger", icon: "fas fa-exclamation-triangle" },
            // Additional possible status variations
            'invoice_sent': { class: "bg-info", icon: "fas fa-file-invoice" },
            'payment_pending': { class: "bg-warning text-dark", icon: "fas fa-credit-card" },
            'paid': { class: "bg-success", icon: "fas fa-dollar-sign" },
            'reviewed': { class: "bg-success", icon: "fas fa-star" },
            'closed': { class: "bg-secondary", icon: "fas fa-lock" },
            'expired': { class: "bg-dark", icon: "fas fa-hourglass-end" },
        };

        // Normalize status (trim whitespace and convert to lowercase)
        const normalizedStatus = status ? status.toString().trim().toLowerCase() : '';
        const config = statusConfig[normalizedStatus] || { class: "bg-secondary", icon: "fas fa-question" };
        
        // Debug: log config selection
        console.log('Normalized status:', normalizedStatus, 'Config found:', !!statusConfig[normalizedStatus]);
        
        const displayText = status ? status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';

        return (
            <span className={`badge ${config.class}`}>
                <i className={`${config.icon} me-1`}></i>
                {displayText}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const methods = {
            cash: { class: "bg-success", icon: "fas fa-money-bill" },
            card: { class: "bg-info", icon: "fas fa-credit-card" },
            online: { class: "bg-warning", icon: "fas fa-globe" },
        };

        const config = methods[method] || { class: "bg-secondary", icon: "fas fa-question" };
        const displayText = method ? method.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not Set";

        return (
            <span className={`badge ${config.class}`}>
                <i className={`${config.icon} me-1`}></i>
                {displayText}
            </span>
        );
    };

    const UserAvatar = ({ user, role }) => {
        const stableImageUrl = useStableImageUrl(
            user.profile_picture,
            "/images/default-avatar.png"
        );

        const bgColor = role === "provider" ? "bg-warning" : "bg-primary";
        const icon = role === "provider" ? "fas fa-briefcase" : "fas fa-user";

        if (!user.profile_picture) {
            return (
                <div className="d-flex align-items-center">
                    <div
                        className={`rounded-circle ${bgColor} d-flex align-items-center justify-content-center me-2`}
                        style={{
                            width: "32px",
                            height: "32px",
                            fontSize: "12px",
                        }}
                    >
                        <i className={`${icon} text-white`}></i>
                    </div>
                    <div>
                        <div className="fw-semibold">{user.full_name}</div>
                        <small className="text-muted">{user.email}</small>
                    </div>
                </div>
            );
        }

        return (
            <div className="d-flex align-items-center">
                <img
                    src={stableImageUrl}
                    alt={user.full_name}
                    className="rounded-circle me-2"
                    style={{
                        width: "32px",
                        height: "32px",
                        objectFit: "cover",
                    }}
                    onError={(e) => {
                        // Replace with fallback avatar on error
                        const fallback = document.createElement("div");
                        fallback.className = `rounded-circle ${bgColor} d-flex align-items-center justify-content-center me-2`;
                        fallback.style.width = "32px";
                        fallback.style.height = "32px";
                        fallback.style.fontSize = "12px";
                        fallback.innerHTML = `<i class="${icon} text-white"></i>`;
                        e.target.parentNode.replaceChild(fallback, e.target);
                    }}
                />
                <div>
                    <div className="fw-semibold">{user.full_name}</div>
                    <small className="text-muted">{user.email}</small>
                </div>
            </div>
        );
    };

    const handleStatusUpdate = (appointment, status) => {
        setSelectedAppointment(appointment);
        setNewStatus(status);
        setNotes("");
        setCancellationReason("");
        setShowStatusModal(true);
    };

    const confirmStatusUpdate = () => {
        if (selectedAppointment && newStatus) {
            onStatusUpdate(selectedAppointment, newStatus, notes, cancellationReason);
            setShowStatusModal(false);
            setSelectedAppointment(null);
            setNewStatus("");
            setNotes("");
            setCancellationReason("");
        }
    };

    const handleCancelAppointment = (appointment) => {
        setSelectedCancelAppointment(appointment);
        setCancellationReason("");
        setShowCancelModal(true);
    };

    const confirmCancelAppointment = () => {
        if (selectedCancelAppointment) {
            onStatusUpdate(selectedCancelAppointment, "cancelled_by_staff", "", cancellationReason);
            setShowCancelModal(false);
            setSelectedCancelAppointment(null);
            setCancellationReason("");
        }
    };

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled_by_client", label: "Cancelled by Client" },
        { value: "cancelled_by_provider", label: "Cancelled by Provider" },
        { value: "cancelled_by_staff", label: "Cancelled by Staff" },
        { value: "no_show", label: "No Show" },
        { value: "disputed", label: "Disputed" },
    ];

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
            >
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Date & Time</th>
                            <th>Client</th>
                            <th>Provider</th>
                            <th>Service</th>
                            <th style={{ width: "100px" }}>Duration</th>
                            <th style={{ width: "100px" }}>Total Price</th>
                            <th style={{ width: "120px" }}>Payment</th>
                            <th style={{ width: "100px" }}>Status</th>
                            <th style={{ width: "150px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>
                                    <div className="fw-semibold">#{appointment.id}</div>
                                    <small className="text-muted">
                                        {formatDate(appointment.created_at)}
                                    </small>
                                </td>
                                <td>
                                    <div className="fw-semibold">
                                        {formatDate(appointment.appointment_date)}
                                    </div>
                                    <small className="text-muted">
                                        {formatTime(appointment.appointment_time)}
                                    </small>
                                </td>
                                <td>
                                    <UserAvatar user={appointment.client} role="client" />
                                </td>
                                <td>
                                    <UserAvatar user={appointment.provider} role="provider" />
                                </td>
                                <td>
                                    <div className="fw-semibold">{appointment.service.title}</div>
                                    <small className="text-muted">
                                        Base: {formatPrice(appointment.service.base_price)}
                                    </small>
                                </td>
                                <td>
                                    <span className="text-nowrap">
                                        {appointment.duration_hours
                                            ? `${appointment.duration_hours} hrs`
                                            : "Not set"}
                                    </span>
                                </td>
                                <td>
                                    <div className="fw-semibold">
                                        {formatPrice(appointment.total_price)}
                                    </div>
                                    {appointment.travel_fee > 0 && (
                                        <small className="text-muted">
                                            +{formatPrice(appointment.travel_fee)} travel
                                        </small>
                                    )}
                                </td>
                                <td>
                                    {getPaymentMethodBadge(appointment.payment_method)}
                                </td>
                                <td>{getStatusBadge(appointment.status)}</td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <a
                                            href={`/staff/appointments/${appointment.id}`}
                                            className="btn btn-sm btn-outline-primary"
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </a>
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href={`/staff/appointments/${appointment.id}`}
                                                    >
                                                        <i className="fas fa-eye me-2"></i>
                                                        View Details
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href={`/staff/users/${appointment.client.id}`}
                                                    >
                                                        <i className="fas fa-user me-2"></i>
                                                        View Client
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href={`/staff/users/${appointment.provider.id}`}
                                                    >
                                                        <i className="fas fa-briefcase me-2"></i>
                                                        View Provider
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                <li>
                                                    <h6 className="dropdown-header">Change Status</h6>
                                                </li>
                                                {statusOptions
                                                    .filter(option => option.value !== appointment.status)
                                                    .map((option) => (
                                                        <li key={option.value}>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() =>
                                                                    handleStatusUpdate(appointment, option.value)
                                                                }
                                                                disabled={isProcessing}
                                                            >
                                                                <i className="fas fa-edit me-2"></i>
                                                                {option.label}
                                                            </button>
                                                        </li>
                                                    ))}
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                {!appointment.status.includes('cancelled') && appointment.status !== 'completed' && (
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-warning"
                                                            onClick={() => handleCancelAppointment(appointment)}
                                                            disabled={isProcessing}
                                                        >
                                                            <i className="fas fa-times me-2"></i>
                                                            Cancel Appointment
                                                        </button>
                                                    </li>
                                                )}
                                                <li>
                                                    <button
                                                        className="dropdown-item text-danger"
                                                        onClick={() => onDeleteAppointment(appointment)}
                                                        disabled={isProcessing}
                                                    >
                                                        <i className="fas fa-trash me-2"></i>
                                                        Delete Appointment
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {appointments.length === 0 && (
                    <div className="text-center py-5">
                        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">No Appointments Found</h5>
                        <p className="text-muted mb-0">
                            No appointments match your current filters.
                        </p>
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Appointment Status</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowStatusModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Appointment</label>
                                    <div className="p-2 bg-light rounded">
                                        <strong>#{selectedAppointment?.id}</strong> - {selectedAppointment?.service.title}
                                        <br />
                                        <small className="text-muted">
                                            {selectedAppointment?.client.full_name} with {selectedAppointment?.provider.full_name}
                                        </small>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Current Status</label>
                                    <div>{getStatusBadge(selectedAppointment?.status)}</div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Status</label>
                                    <div>{getStatusBadge(newStatus)}</div>
                                </div>
                                {(newStatus === "cancelled_by_client" || newStatus === "cancelled_by_provider") && (
                                    <div className="mb-3">
                                        <label className="form-label">Cancellation Reason</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={cancellationReason}
                                            onChange={(e) => setCancellationReason(e.target.value)}
                                            placeholder="Please provide a reason for cancellation..."
                                        ></textarea>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Notes (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any additional notes..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={confirmStatusUpdate}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Status"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Appointment Modal */}
            {showCancelModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cancel Appointment</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCancelModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Appointment</label>
                                    <div className="p-2 bg-light rounded">
                                        <strong>#{selectedCancelAppointment?.id}</strong> - {selectedCancelAppointment?.service.title}
                                        <br />
                                        <small className="text-muted">
                                            {selectedCancelAppointment?.client.full_name} with {selectedCancelAppointment?.provider.full_name}
                                        </small>
                                        <br />
                                        <small className="text-muted">
                                            {formatDate(selectedCancelAppointment?.appointment_date)} at {formatTime(selectedCancelAppointment?.appointment_time)}
                                        </small>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Current Status</label>
                                    <div>{getStatusBadge(selectedCancelAppointment?.status)}</div>
                                </div>
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Warning:</strong> This action will cancel the appointment regardless of its current status. Both the client and provider will be notified.
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Cancellation Reason <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        placeholder="Please provide a reason for cancelling this appointment..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCancelModal(false)}
                                >
                                    Keep Appointment
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={confirmCancelAppointment}
                                    disabled={isProcessing || !cancellationReason.trim()}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-times me-2"></i>
                                            Cancel Appointment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AppointmentsTable;