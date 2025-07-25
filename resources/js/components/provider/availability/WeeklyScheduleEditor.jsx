import React, { useState, useEffect } from "react";
import TimeSlotInput from "./TimeSlotInput";
import availabilityService from "../../../services/availabilityService";
import notificationService from "../../../services/notificationService"; // Updated import

const WeeklyScheduleEditor = ({ onSave = null, className = "" }) => {
    const [schedule, setSchedule] = useState(
        availabilityService.getDefaultSchedule()
    );
    const [originalSchedule, setOriginalSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    // MOVE HELPER FUNCTIONS HERE - BEFORE useEffect and other functions
    const calculateTotalWeeklyHours = () => {
        return schedule
            .reduce((total, day) => {
                if (!day.is_available || !day.start_time || !day.end_time)
                    return total;

                const start = new Date(`2000-01-01 ${day.start_time}`);
                const end = new Date(`2000-01-01 ${day.end_time}`);

                if (end > start) {
                    const hours = (end - start) / (1000 * 60 * 60);
                    return total + hours;
                }

                return total;
            }, 0)
            .toFixed(1);
    };

    const calculateAverageDailyHours = () => {
        const workingDays = schedule.filter((day) => day.is_available).length;
        if (workingDays === 0) return "0";

        const totalHours = parseFloat(calculateTotalWeeklyHours());
        return (totalHours / workingDays).toFixed(1);
    };

    useEffect(() => {
        loadWeeklySchedule();
    }, []);

    useEffect(() => {
        // Check if schedule has changes OR if this is a new schedule
        const scheduleChanged =
            JSON.stringify(schedule) !== JSON.stringify(originalSchedule);
        const isNewSchedule = originalSchedule.length === 0;
        const hasWorkingDays = schedule.some((day) => day.is_available);

        // Enable save if:
        // 1. Schedule changed from original, OR
        // 2. New schedule AND has working days, OR
        // 3. Default schedule with working days (when original is empty)
        const shouldEnableSave =
            scheduleChanged ||
            (isNewSchedule && hasWorkingDays) ||
            (originalSchedule.length === 0 && hasWorkingDays);

        setHasChanges(shouldEnableSave);
    }, [schedule, originalSchedule]);

    const loadWeeklySchedule = async () => {
        setLoading(true);
        try {
            const result = await availabilityService.getWeeklyAvailability();

            if (result.success && result.data && result.data.length > 0) {
                // Convert API response to component format
                const formattedSchedule = formatScheduleFromAPI(result.data);
                setSchedule(formattedSchedule);
                setOriginalSchedule(formattedSchedule);
            } else {
                console.warn(
                    "No existing schedule found, using default:",
                    result.message
                );
                // Set original to empty array to indicate this is a new schedule
                setOriginalSchedule([]);
            }
        } catch (error) {
            console.error("Error loading schedule:", error);
            notificationService.error("Failed to load your current schedule");
            setOriginalSchedule([]);
        } finally {
            setLoading(false);
        }
    };

    const formatScheduleFromAPI = (apiData) => {
        // Convert API response array to indexed schedule
        const formattedSchedule = availabilityService.getDefaultSchedule();

        if (Array.isArray(apiData)) {
            apiData.forEach((dayData) => {
                if (dayData.day_of_week >= 0 && dayData.day_of_week <= 6) {
                    formattedSchedule[dayData.day_of_week] = {
                        day_of_week: dayData.day_of_week,
                        is_available: dayData.is_available,
                        start_time: dayData.start_time,
                        end_time: dayData.end_time,
                    };
                }
            });
        }

        return formattedSchedule;
    };

    const handleDayChange = (dayIndex, dayData) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex] = dayData;
        setSchedule(newSchedule);

        // Clear errors for this day
        const newErrors = { ...errors };
        Object.keys(newErrors).forEach((key) => {
            if (key.includes(`availability.${dayIndex}`)) {
                delete newErrors[key];
            }
        });
        setErrors(newErrors);
    };

    const validateSchedule = () => {
        const validationErrors = {};

        schedule.forEach((dayData, index) => {
            if (dayData.is_available) {
                if (!dayData.start_time) {
                    validationErrors[`availability.${index}.start_time`] =
                        "Start time is required";
                }
                if (!dayData.end_time) {
                    validationErrors[`availability.${index}.end_time`] =
                        "End time is required";
                }
                if (dayData.start_time && dayData.end_time) {
                    if (
                        !availabilityService.validateTimeRange(
                            dayData.start_time,
                            dayData.end_time
                        )
                    ) {
                        validationErrors[`availability.${index}.end_time`] =
                            "End time must be after start time";
                    }
                }
            }
        });

        return validationErrors;
    };

    const handleSave = async () => {
        // console.log("Save button clicked!"); // Debug log

        // Client-side validation
        const validationErrors = validateSchedule();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            notificationService.error("Please fix the errors in your schedule");
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            // console.log("Sending schedule data:", schedule); // Debug log
            const result = await availabilityService.updateWeeklyAvailability(
                schedule
            );

            // console.log("Save result:", result); // Debug log

            if (result.success) {
                notificationService.success(
                    result.message || "Schedule updated successfully!"
                );
                setOriginalSchedule([...schedule]);
                setHasChanges(false);

                // Call parent callback if provided
                if (onSave) {
                    onSave(result.data);
                }
            } else {
                notificationService.error(
                    result.message || "Failed to update schedule"
                );
                if (result.errors) {
                    setErrors(result.errors);
                }
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            notificationService.error(
                "An error occurred while saving your schedule"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        console.log("Cancel button clicked!"); // Debug log
        setSchedule([...originalSchedule]);
        setErrors({});
        setHasChanges(false);
    };

    const handleQuickSetup = (preset) => {
        let newSchedule = [...schedule];

        switch (preset) {
            case "business":
                // Monday to Friday, 9 AM to 5 PM
                newSchedule = newSchedule.map((day, index) => ({
                    ...day,
                    is_available: index >= 1 && index <= 5,
                    start_time: index >= 1 && index <= 5 ? "09:00" : null,
                    end_time: index >= 1 && index <= 5 ? "17:00" : null,
                }));
                break;
            case "extended":
                // Monday to Saturday, 8 AM to 6 PM
                newSchedule = newSchedule.map((day, index) => ({
                    ...day,
                    is_available: index >= 1 && index <= 6,
                    start_time: index >= 1 && index <= 6 ? "08:00" : null,
                    end_time: index >= 1 && index <= 6 ? "18:00" : null,
                }));
                break;
            case "weekend":
                // Saturday and Sunday only
                newSchedule = newSchedule.map((day, index) => ({
                    ...day,
                    is_available: index === 0 || index === 6,
                    start_time: index === 0 || index === 6 ? "10:00" : null,
                    end_time: index === 0 || index === 6 ? "16:00" : null,
                }));
                break;
            case "all_week":
                // Every day, 9 AM to 5 PM
                newSchedule = newSchedule.map((day) => ({
                    ...day,
                    is_available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                }));
                break;
            default:
                return;
        }

        setSchedule(newSchedule);
    };

    if (loading) {
        return (
            <div className={`weekly-schedule-editor ${className}`}>
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-5">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading your schedule...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`weekly-schedule-editor ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="fw-bold mb-0">
                                <i className="fas fa-calendar-week text-primary me-2"></i>
                                Weekly Schedule
                            </h5>
                            <small className="text-muted">
                                Set your availability for each day of the week
                            </small>
                        </div>
                        <div className="col-md-6 text-md-end">
                            {hasChanges && (
                                <span className="badge bg-warning me-2">
                                    <i className="fas fa-exclamation-circle me-1"></i>
                                    Unsaved changes
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {/* Quick Setup Options */}
                    <div className="quick-setup-section mb-4">
                        <h6 className="fw-bold mb-2">
                            <i className="fas fa-magic text-primary me-2"></i>
                            Quick Setup
                        </h6>
                        <div className="row g-2">
                            <div className="col-md-3 col-6">
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => handleQuickSetup("business")}
                                    disabled={saving}
                                    type="button"
                                >
                                    <i className="fas fa-briefcase me-1"></i>
                                    Business Hours
                                    <small className="d-block text-muted">
                                        Mon-Fri, 9-5
                                    </small>
                                </button>
                            </div>
                            <div className="col-md-3 col-6">
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => handleQuickSetup("extended")}
                                    disabled={saving}
                                    type="button"
                                >
                                    <i className="fas fa-clock me-1"></i>
                                    Extended Hours
                                    <small className="d-block text-muted">
                                        Mon-Sat, 8-6
                                    </small>
                                </button>
                            </div>
                            <div className="col-md-3 col-6">
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => handleQuickSetup("weekend")}
                                    disabled={saving}
                                    type="button"
                                >
                                    <i className="fas fa-calendar-weekend me-1"></i>
                                    Weekends Only
                                    <small className="d-block text-muted">
                                        Sat-Sun, 10-4
                                    </small>
                                </button>
                            </div>
                            <div className="col-md-3 col-6">
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => handleQuickSetup("all_week")}
                                    disabled={saving}
                                    type="button"
                                >
                                    <i className="fas fa-calendar me-1"></i>
                                    Every Day
                                    <small className="d-block text-muted">
                                        All week, 9-5
                                    </small>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="schedule-grid">
                        {schedule.map((dayData, index) => (
                            <TimeSlotInput
                                key={index}
                                day={index}
                                dayData={dayData}
                                onChange={handleDayChange}
                                errors={errors}
                                disabled={saving}
                            />
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="schedule-summary mt-4 p-3 bg-light rounded">
                        <div className="row">
                            <div className="col-md-4">
                                <small className="text-muted">
                                    Working Days:
                                </small>
                                <div className="fw-bold">
                                    {
                                        schedule.filter(
                                            (day) => day.is_available
                                        ).length
                                    }{" "}
                                    days
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">
                                    Total Hours/Week:
                                </small>
                                <div className="fw-bold">
                                    {calculateTotalWeeklyHours()} hours
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">
                                    Average/Day:
                                </small>
                                <div className="fw-bold">
                                    {calculateAverageDailyHours()} hours
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer bg-white border-top">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            {hasChanges && (
                                <small className="text-muted">
                                    <i className="fas fa-info-circle me-1"></i>
                                    You have unsaved changes
                                </small>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleCancel}
                                disabled={saving || !hasChanges}
                            >
                                <i className="fas fa-times me-1"></i>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                                // disabled={saving || !hasChanges}
                            >
                                {saving ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        ></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-1"></i>
                                        Save Schedule
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                /* Using design system colors */
                .schedule-card:hover {
                    border-color: var(--current-role-primary);
                }
            `}</style>
        </div>
    );
};

export default WeeklyScheduleEditor;
