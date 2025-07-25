import React, { useState, useEffect } from "react";
import availabilityService from "../../../services/availabilityService";
import { toast } from "react-toastify";

const BlockTimeModal = ({
    show,
    onHide,
    onSave,
    editingTime = null,
    className = "",
}) => {
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        reason: "",
        all_day: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal opens/closes or editing changes
    useEffect(() => {
        if (show) {
            if (editingTime) {
                // Populate form for editing
                setFormData({
                    start_date: editingTime.start_date || "",
                    end_date: editingTime.end_date || "",
                    start_time: editingTime.start_time || "",
                    end_time: editingTime.end_time || "",
                    reason: editingTime.reason || "",
                    all_day: editingTime.all_day || false,
                });
            } else {
                // Reset for new entry
                const today = new Date().toISOString().split("T")[0];
                setFormData({
                    start_date: today,
                    end_date: today,
                    start_time: "09:00",
                    end_time: "17:00",
                    reason: "",
                    all_day: false,
                });
            }
            setErrors({});
        }
    }, [show, editingTime]);

    const handleInputChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };

        // Auto-adjust end_date when start_date changes
        if (field === "start_date" && !editingTime) {
            newFormData.end_date = value;
        }

        // Clear time fields when all_day is checked
        if (field === "all_day" && value) {
            newFormData.start_time = "";
            newFormData.end_time = "";
        } else if (field === "all_day" && !value) {
            // Set default times when unchecking all_day
            newFormData.start_time = "09:00";
            newFormData.end_time = "17:00";
        }

        setFormData(newFormData);

        // Clear field-specific errors
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        const validationErrors = {};

        if (!formData.start_date) {
            validationErrors.start_date = "Start date is required";
        }

        if (!formData.end_date) {
            validationErrors.end_date = "End date is required";
        }

        if (formData.start_date && formData.end_date) {
            if (new Date(formData.start_date) > new Date(formData.end_date)) {
                validationErrors.end_date =
                    "End date must be after or equal to start date";
            }
        }

        if (!formData.all_day) {
            if (!formData.start_time) {
                validationErrors.start_time =
                    "Start time is required when not blocking all day";
            }
            if (!formData.end_time) {
                validationErrors.end_time =
                    "End time is required when not blocking all day";
            }
            if (formData.start_time && formData.end_time) {
                if (
                    !availabilityService.validateTimeRange(
                        formData.start_time,
                        formData.end_time
                    )
                ) {
                    validationErrors.end_time =
                        "End time must be after start time";
                }
            }
        }

        return validationErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure dates are in YYYY-MM-DD format
        const formattedData = {
            ...formData,
            start_date:
                formData.start_date instanceof Date
                    ? formData.start_date.toISOString().split("T")[0] // Convert Date to YYYY-MM-DD
                    : formData.start_date,
            end_date:
                formData.end_date instanceof Date
                    ? formData.end_date.toISOString().split("T")[0] // Convert Date to YYYY-MM-DD
                    : formData.end_date,
        };

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const result = await availabilityService.createBlockedTime(
                formData
            );

            if (result.success) {
                toast.success(result.message || "Time blocked successfully!");
                onSave(result.data);
                onHide();
            } else {
                toast.error(result.message || "Failed to block time");
                if (result.errors) {
                    setErrors(result.errors);
                }
            }
        } catch (error) {
            console.error("Error blocking time:", error);
            toast.error("An error occurred while blocking time");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setErrors({});
        onHide();
    };

    const getFieldError = (field) => {
        return errors[field];
    };

    const formatDateRange = () => {
        if (!formData.start_date) return "";

        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date || formData.start_date);

        if (startDate.toDateString() === endDate.toDateString()) {
            return startDate.toLocaleDateString();
        }

        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    };

    const formatTimeRange = () => {
        if (formData.all_day) return "All day";
        if (!formData.start_time || !formData.end_time) return "";

        return `${availabilityService.formatTimeForDisplay(
            formData.start_time
        )} - ${availabilityService.formatTimeForDisplay(formData.end_time)}`;
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                onClick={handleCancel}
                style={{ zIndex: 1040 }}
            ></div>

            {/* Modal */}
            <div
                className={`modal fade show d-block ${className}`}
                tabIndex="-1"
                style={{ zIndex: 1050 }}
                aria-labelledby="blockTimeModalLabel"
                aria-hidden="false"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                        <form onSubmit={handleSubmit}>
                            {/* Modal Header */}
                            <div className="modal-header bg-primary text-white">
                                <h5
                                    className="modal-title fw-bold"
                                    id="blockTimeModalLabel"
                                >
                                    <i className="fas fa-ban me-2"></i>
                                    {editingTime
                                        ? "Edit Blocked Time"
                                        : "Block Time Period"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={handleCancel}
                                    disabled={loading}
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    {/* Date Range */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <i className="fas fa-calendar me-2 text-primary"></i>
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${
                                                getFieldError("start_date")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={formData.start_date}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "start_date",
                                                    e.target.value
                                                )
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            disabled={loading}
                                            required
                                        />
                                        {getFieldError("start_date") && (
                                            <div className="invalid-feedback">
                                                {getFieldError("start_date")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <i className="fas fa-calendar me-2 text-primary"></i>
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${
                                                getFieldError("end_date")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={formData.end_date}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "end_date",
                                                    e.target.value
                                                )
                                            }
                                            min={
                                                formData.start_date ||
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            disabled={loading}
                                            required
                                        />
                                        {getFieldError("end_date") && (
                                            <div className="invalid-feedback">
                                                {getFieldError("end_date")}
                                            </div>
                                        )}
                                    </div>

                                    {/* All Day Toggle */}
                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="allDayToggle"
                                                checked={formData.all_day}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "all_day",
                                                        e.target.checked
                                                    )
                                                }
                                                disabled={loading}
                                            />
                                            <label
                                                className="form-check-label fw-bold"
                                                htmlFor="allDayToggle"
                                            >
                                                <i className="fas fa-sun me-2 text-warning"></i>
                                                Block entire day(s)
                                            </label>
                                        </div>
                                        <small className="text-muted">
                                            Check this to block the entire day
                                            instead of specific hours
                                        </small>
                                    </div>

                                    {/* Time Range (only if not all day) */}
                                    {!formData.all_day && (
                                        <>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">
                                                    <i className="fas fa-clock me-2 text-primary"></i>
                                                    Start Time
                                                </label>
                                                <input
                                                    type="time"
                                                    className={`form-control ${
                                                        getFieldError(
                                                            "start_time"
                                                        )
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={formData.start_time}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "start_time",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={loading}
                                                    required={!formData.all_day}
                                                />
                                                {getFieldError(
                                                    "start_time"
                                                ) && (
                                                    <div className="invalid-feedback">
                                                        {getFieldError(
                                                            "start_time"
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">
                                                    <i className="fas fa-clock me-2 text-primary"></i>
                                                    End Time
                                                </label>
                                                <input
                                                    type="time"
                                                    className={`form-control ${
                                                        getFieldError(
                                                            "end_time"
                                                        )
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    value={formData.end_time}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "end_time",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={loading}
                                                    required={!formData.all_day}
                                                />
                                                {getFieldError("end_time") && (
                                                    <div className="invalid-feedback">
                                                        {getFieldError(
                                                            "end_time"
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Reason */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold">
                                            <i className="fas fa-comment me-2 text-primary"></i>
                                            Reason (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                getFieldError("reason")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={formData.reason}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "reason",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g., Personal appointment, Holiday, Maintenance"
                                            maxLength="255"
                                            disabled={loading}
                                        />
                                        {getFieldError("reason") && (
                                            <div className="invalid-feedback">
                                                {getFieldError("reason")}
                                            </div>
                                        )}
                                        <small className="text-muted">
                                            Provide a reason to help you
                                            remember why this time was blocked
                                        </small>
                                    </div>

                                    {/* Preview */}
                                    {formData.start_date && (
                                        <div className="col-12">
                                            <div className="alert alert-light border-primary">
                                                <h6 className="fw-bold text-primary mb-2">
                                                    <i className="fas fa-eye me-2"></i>
                                                    Preview
                                                </h6>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <strong>Date:</strong>{" "}
                                                        {formatDateRange()}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <strong>Time:</strong>{" "}
                                                        {formatTimeRange()}
                                                    </div>
                                                    {formData.reason && (
                                                        <div className="col-12 mt-2">
                                                            <strong>
                                                                Reason:
                                                            </strong>{" "}
                                                            {formData.reason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer bg-light">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            {editingTime
                                                ? "Updating..."
                                                : "Blocking..."}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-ban me-2"></i>
                                            {editingTime
                                                ? "Update Block"
                                                : "Block Time"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlockTimeModal;
