import React, { useState } from "react";
import availabilityService from "../../../services/availabilityService";
import { toast } from "react-toastify";

const QuickAvailabilityActions = ({ onUpdate = null, className = "" }) => {
    const [loading, setLoading] = useState(false);

    const quickBlockToday = async () => {
        const today = new Date().toISOString().split("T")[0];
        await quickBlock(today, today, "Quick block - today");
    };

    const quickBlockTomorrow = async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        await quickBlock(tomorrowStr, tomorrowStr, "Quick block - tomorrow");
    };

    const quickBlockWeekend = async () => {
        const today = new Date();
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + (6 - today.getDay()));
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        await quickBlock(
            saturday.toISOString().split("T")[0],
            sunday.toISOString().split("T")[0],
            "Quick block - weekend"
        );
    };

    const quickBlockNextWeek = async () => {
        const today = new Date();
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (8 - today.getDay()));
        const nextFriday = new Date(nextMonday);
        nextFriday.setDate(nextMonday.getDate() + 4);

        await quickBlock(
            nextMonday.toISOString().split("T")[0],
            nextFriday.toISOString().split("T")[0],
            "Quick block - next week"
        );
    };

    const quickBlock = async (startDate, endDate, reason) => {
        setLoading(true);
        try {
            const result = await availabilityService.createBlockedTime({
                start_date: startDate,
                end_date: endDate,
                start_time: "",
                end_time: "",
                all_day: true,
                reason: reason,
            });

            if (result.success) {
                toast.success(`Time blocked successfully!`);
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error(result.message || "Failed to block time");
            }
        } catch (error) {
            console.error("Error blocking time:", error);
            toast.error("Failed to block time");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`quick-availability-actions ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <h6 className="fw-bold mb-0">
                        <i className="fas fa-zap text-orange me-2"></i>
                        Quick Actions
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-6">
                            <button
                                className="btn btn-outline-danger btn-sm w-100"
                                onClick={quickBlockToday}
                                disabled={loading}
                            >
                                <i className="fas fa-ban me-1"></i>
                                Block Today
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-warning btn-sm w-100"
                                onClick={quickBlockTomorrow}
                                disabled={loading}
                            >
                                <i className="fas fa-calendar-day me-1"></i>
                                Block Tomorrow
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-info btn-sm w-100"
                                onClick={quickBlockWeekend}
                                disabled={loading}
                            >
                                <i className="fas fa-calendar-weekend me-1"></i>
                                Block Weekend
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-outline-secondary btn-sm w-100"
                                onClick={quickBlockNextWeek}
                                disabled={loading}
                            >
                                <i className="fas fa-calendar-week me-1"></i>
                                Block Next Week
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center mt-3">
                            <div
                                className="spinner-border spinner-border-sm text-orange"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Processing...
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickAvailabilityActions;
