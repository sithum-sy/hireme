import React, { useState, useEffect } from "react";
import availabilityService from "../../../services/availabilityService";

const AvailabilityCalendar = ({ className = "" }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [blockedTimes, setBlockedTimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCalendarData();
    }, [currentDate]);

    const loadCalendarData = async () => {
        setLoading(true);
        try {
            const startOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            );
            const endOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
            );

            const [scheduleResult, blockedResult] = await Promise.all([
                availabilityService.getWeeklyAvailability(),
                availabilityService.getBlockedTimes(
                    startOfMonth.toISOString().split("T")[0],
                    endOfMonth.toISOString().split("T")[0]
                ),
            ]);

            if (scheduleResult.success) {
                setWeeklySchedule(scheduleResult.data);
            }
            if (blockedResult.success) {
                setBlockedTimes(blockedResult.data);
            }
        } catch (error) {
            console.error("Error loading calendar data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Previous month padding
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getDayStatus = (date) => {
        if (!date) return null;

        const dayOfWeek = date.getDay();
        // const dateString = date.toISOString().split("T")[0];
        const dateString =
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0");

        // Check if blocked
        const isBlocked = blockedTimes.some((blocked) => {
            const blockStart = blocked.start_date;
            const blockEnd = blocked.end_date;

            // console.log(
            //     "Comparing",
            //     dateString,
            //     "with blocked period:",
            //     blockStart,
            //     "to",
            //     blockEnd
            // );

            return dateString >= blockStart && dateString <= blockEnd;
        });

        if (isBlocked) {
            return { status: "blocked", color: "danger", text: "Blocked" };
        }

        // Check weekly schedule
        const daySchedule = weeklySchedule.find(
            (s) => s.day_of_week === dayOfWeek
        );

        if (daySchedule && daySchedule.is_available) {
            return {
                status: "available",
                color: "success",
                text: `${daySchedule.start_time} - ${daySchedule.end_time}`,
            };
        }

        return { status: "unavailable", color: "secondary", text: "Closed" };
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (loading) {
        return (
            <div className={`availability-calendar ${className}`}>
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading calendar...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`availability-calendar ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0">
                            <i className="fas fa-calendar text-primary me-2"></i>
                            Availability Calendar
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigateMonth(-1)}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <span className="fw-bold px-3">
                                {monthNames[currentDate.getMonth()]}{" "}
                                {currentDate.getFullYear()}
                            </span>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigateMonth(1)}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {/* Calendar Grid */}
                    <div className="calendar-grid">
                        {/* Day Headers */}
                        <div className="row mb-2">
                            {dayNames.map((day) => (
                                <div key={day} className="col text-center">
                                    <small className="fw-bold text-muted">
                                        {day}
                                    </small>
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        {Array.from(
                            { length: Math.ceil(getDaysInMonth().length / 7) },
                            (_, weekIndex) => (
                                <div key={weekIndex} className="row mb-2">
                                    {getDaysInMonth()
                                        .slice(weekIndex * 7, weekIndex * 7 + 7)
                                        .map((date, dayIndex) => {
                                            const dayStatus =
                                                getDayStatus(date);
                                            const isToday =
                                                date &&
                                                date.toDateString() ===
                                                    new Date().toDateString();

                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className="col p-1"
                                                >
                                                    <div
                                                        className={`calendar-day ${
                                                            date
                                                                ? "has-date"
                                                                : "empty"
                                                        } ${
                                                            isToday
                                                                ? "today"
                                                                : ""
                                                        }`}
                                                        style={{
                                                            minHeight: "80px",
                                                        }}
                                                    >
                                                        {date && (
                                                            <>
                                                                <div className="day-number">
                                                                    {date.getDate()}
                                                                    {isToday && (
                                                                        <i className="fas fa-circle fa-xs text-primary ms-1"></i>
                                                                    )}
                                                                </div>
                                                                {dayStatus && (
                                                                    <div
                                                                        className={`day-status bg-${dayStatus.color} bg-opacity-10 text-${dayStatus.color}`}
                                                                    >
                                                                        <small className="fw-bold">
                                                                            {
                                                                                dayStatus.status
                                                                            }
                                                                        </small>
                                                                        {dayStatus.status ===
                                                                            "available" && (
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "0.7rem",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    dayStatus.text
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )
                        )}
                    </div>

                    {/* Legend */}
                    <div className="calendar-legend mt-4 pt-3 border-top">
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <div className="d-flex align-items-center">
                                    <div className="legend-color bg-success bg-opacity-10 border border-success me-2"></div>
                                    <small>Available</small>
                                </div>
                            </div>
                            <div className="col-md-4 mb-2">
                                <div className="d-flex align-items-center">
                                    <div className="legend-color bg-danger bg-opacity-10 border border-danger me-2"></div>
                                    <small>Blocked</small>
                                </div>
                            </div>
                            <div className="col-md-4 mb-2">
                                <div className="d-flex align-items-center">
                                    <div className="legend-color bg-secondary bg-opacity-10 border border-secondary me-2"></div>
                                    <small>Closed</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .calendar-day {
                    border: 1px solid #e9ecef;
                    border-radius: 0.375rem;
                    padding: 0.5rem;
                    background: white;
                    transition: all 0.2s ease;
                }

                .calendar-day.has-date:hover {
                    border-color: var(--current-role-primary);
                    box-shadow: 0 2px 4px var(--current-role-shadow);
                }

                .calendar-day.today {
                    border-color: var(--current-role-primary);
                    box-shadow: 0 0 0 2px var(--current-role-shadow);
                }

                .calendar-day.empty {
                    border: none;
                    background: transparent;
                }

                .day-number {
                    font-weight: bold;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .day-status {
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    text-align: center;
                }

                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 0.25rem;
                }

                /* Using design system classes instead of custom orange styles */
            `}</style>
        </div>
    );
};

export default AvailabilityCalendar;
