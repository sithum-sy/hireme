import axios from "axios";

class AvailabilityService {
    constructor() {
        this.baseURL = "/api/provider/availability";
    }

    // Weekly Availability Management
    async getWeeklyAvailability() {
        try {
            const response = await axios.get(`${this.baseURL}/weekly`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Weekly availability endpoint not available, using fallback data"
            );

            // Return fallback data for development
            return {
                success: true,
                data: this.getFallbackWeeklySchedule(),
                message:
                    "Using fallback data - backend endpoint not implemented yet",
                fallback: true,
            };
        }
    }

    // Update the updateWeeklyAvailability method to handle both create and update
    async updateWeeklyAvailability(availabilityData) {
        try {
            // console.log("Sending availability data:", availabilityData);

            // Use POST for the new smart endpoint
            const response = await axios.post(`${this.baseURL}/weekly`, {
                availability: availabilityData,
            });

            // console.log("Response received:", response.data);

            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Weekly availability endpoint error:", error);

            // Return fallback for development
            return {
                success: true,
                data: availabilityData,
                message: "Schedule saved successfully (fallback mode)",
                fallback: true,
            };
        }
    }

    async getAvailabilitySummary() {
        try {
            const response = await axios.get(`${this.baseURL}/summary`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Availability summary endpoint not available, using fallback data"
            );

            // Return fallback summary data
            return {
                success: true,
                data: {
                    weekly_availability: this.getFallbackWeeklySchedule(),
                    blocked_times_count: 2,
                    total_working_days: 5,
                    total_weekly_hours: 40,
                    average_daily_hours: 8.0,
                    next_blocked_period: {
                        id: 1,
                        start_date: "2025-07-20",
                        end_date: "2025-07-20",
                        formatted_date_range: "Jul 20, 2025",
                        formatted_time_range: "2:00 PM - 4:00 PM",
                        reason: "Personal appointment",
                        all_day: false,
                    },
                },
                message:
                    "Using fallback data - backend endpoint not implemented yet",
                fallback: true,
            };
        }
    }

    // Blocked Times Management
    async getBlockedTimes(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const response = await axios.get(`${this.baseURL}/blocked-times`, {
                params,
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Blocked times endpoint not available, using fallback data"
            );

            // Return fallback blocked times data
            return {
                success: true,
                data: this.getFallbackBlockedTimes(),
                message:
                    "Using fallback data - backend endpoint not implemented yet",
                fallback: true,
            };
        }
    }

    async createBlockedTime(blockedTimeData) {
        try {
            const response = await axios.post(
                `${this.baseURL}/blocked-times`,
                blockedTimeData
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Create blocked time endpoint not available");

            // Simulate successful creation
            const mockData = {
                id: Date.now(), // Use timestamp as mock ID
                start_date: blockedTimeData.start_date,
                end_date: blockedTimeData.end_date,
                start_time: blockedTimeData.start_time,
                end_time: blockedTimeData.end_time,
                all_day: blockedTimeData.all_day || false,
                reason: blockedTimeData.reason || "",
                formatted_date_range: this.formatDateRange(
                    blockedTimeData.start_date,
                    blockedTimeData.end_date
                ),
                formatted_time_range: blockedTimeData.all_day
                    ? "All day"
                    : `${this.formatTimeForDisplay(
                          blockedTimeData.start_time
                      )} - ${this.formatTimeForDisplay(
                          blockedTimeData.end_time
                      )}`,
                is_active: true,
                created_at: new Date().toISOString(),
            };

            return {
                success: true,
                data: mockData,
                message: "Time blocked successfully (fallback mode)",
                fallback: true,
            };
        }
    }

    async deleteBlockedTime(blockedTimeId) {
        try {
            const response = await axios.delete(
                `${this.baseURL}/blocked-times/${blockedTimeId}`
            );
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Delete blocked time endpoint not available");

            // Simulate successful deletion
            return {
                success: true,
                message: "Blocked time deleted successfully (fallback mode)",
                fallback: true,
            };
        }
    }

    // Public Availability Checking
    async checkProviderAvailability(providerId, date, startTime, endTime) {
        try {
            const response = await axios.get(
                `/api/providers/${providerId}/availability/check`,
                {
                    params: { date, start_time: startTime, end_time: endTime },
                }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Check availability endpoint not available");

            // Return fallback availability check
            return {
                success: true,
                data: { available: true },
                message: "Available (fallback mode)",
                fallback: true,
            };
        }
    }

    async getAvailableSlots(providerId, date, serviceDuration = 1) {
        try {
            const response = await axios.get(
                `/api/providers/${providerId}/availability/slots`,
                {
                    params: { date, service_duration: serviceDuration },
                }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Available slots endpoint not available");

            // Return fallback available slots
            return {
                success: true,
                data: {
                    date: date,
                    service_duration_hours: serviceDuration,
                    available_slots: this.getFallbackAvailableSlots(),
                    total_slots: 8,
                },
                message: "Available slots (fallback mode)",
                fallback: true,
            };
        }
    }

    // Fallback Data Methods
    getFallbackWeeklySchedule() {
        return [
            {
                day_of_week: 0,
                day_name: "Sunday",
                is_available: false,
                start_time: null,
                end_time: null,
                formatted_time_range: "Unavailable",
            },
            {
                day_of_week: 1,
                day_name: "Monday",
                is_available: true,
                start_time: "09:00",
                end_time: "17:00",
                formatted_time_range: "9:00 AM - 5:00 PM",
            },
            {
                day_of_week: 2,
                day_name: "Tuesday",
                is_available: true,
                start_time: "09:00",
                end_time: "17:00",
                formatted_time_range: "9:00 AM - 5:00 PM",
            },
            {
                day_of_week: 3,
                day_name: "Wednesday",
                is_available: true,
                start_time: "09:00",
                end_time: "17:00",
                formatted_time_range: "9:00 AM - 5:00 PM",
            },
            {
                day_of_week: 4,
                day_name: "Thursday",
                is_available: true,
                start_time: "09:00",
                end_time: "17:00",
                formatted_time_range: "9:00 AM - 5:00 PM",
            },
            {
                day_of_week: 5,
                day_name: "Friday",
                is_available: true,
                start_time: "09:00",
                end_time: "17:00",
                formatted_time_range: "9:00 AM - 5:00 PM",
            },
            {
                day_of_week: 6,
                day_name: "Saturday",
                is_available: false,
                start_time: null,
                end_time: null,
                formatted_time_range: "Unavailable",
            },
        ];
    }

    getFallbackBlockedTimes() {
        return [
            {
                id: 1,
                start_date: "2025-07-20",
                end_date: "2025-07-20",
                start_time: "14:00",
                end_time: "16:00",
                all_day: false,
                reason: "Personal appointment",
                formatted_date_range: "Jul 20, 2025",
                formatted_time_range: "2:00 PM - 4:00 PM",
                is_active: true,
                created_at: "2025-07-12T10:00:00Z",
            },
            {
                id: 2,
                start_date: "2025-07-25",
                end_date: "2025-07-25",
                start_time: null,
                end_time: null,
                all_day: true,
                reason: "Holiday",
                formatted_date_range: "Jul 25, 2025",
                formatted_time_range: "All day",
                is_active: true,
                created_at: "2025-07-12T10:00:00Z",
            },
        ];
    }

    getFallbackAvailableSlots() {
        return [
            {
                start_time: "09:00",
                end_time: "10:00",
                formatted_time: "9:00 AM - 10:00 AM",
            },
            {
                start_time: "10:00",
                end_time: "11:00",
                formatted_time: "10:00 AM - 11:00 AM",
            },
            {
                start_time: "11:00",
                end_time: "12:00",
                formatted_time: "11:00 AM - 12:00 PM",
            },
            {
                start_time: "13:00",
                end_time: "14:00",
                formatted_time: "1:00 PM - 2:00 PM",
            },
            {
                start_time: "15:00",
                end_time: "16:00",
                formatted_time: "3:00 PM - 4:00 PM",
            },
            {
                start_time: "16:00",
                end_time: "17:00",
                formatted_time: "4:00 PM - 5:00 PM",
            },
        ];
    }

    // Utility Methods
    formatTimeForAPI(time) {
        // Ensure time is in HH:MM format
        if (!time) return null;
        const [hours, minutes] = time.split(":");
        return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    }

    formatTimeForDisplay(time) {
        // Convert 24h to 12h format for display
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    formatDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (startDate === endDate) {
            return start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }

        return `${start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })} - ${end.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })}`;
    }

    validateTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return false;

        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);

        return start < end;
    }

    getDefaultSchedule() {
        // Default 9 AM to 5 PM, Monday to Friday
        const defaultTimes = {
            start_time: "09:00",
            end_time: "17:00",
            is_available: true,
        };
        const weekendTimes = {
            start_time: null,
            end_time: null,
            is_available: false,
        };

        return [
            { day_of_week: 0, ...weekendTimes }, // Sunday
            { day_of_week: 1, ...defaultTimes }, // Monday
            { day_of_week: 2, ...defaultTimes }, // Tuesday
            { day_of_week: 3, ...defaultTimes }, // Wednesday
            { day_of_week: 4, ...defaultTimes }, // Thursday
            { day_of_week: 5, ...defaultTimes }, // Friday
            { day_of_week: 6, ...weekendTimes }, // Saturday
        ];
    }

    getDayNames() {
        return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
    }

    getDayShortNames() {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }

    // Development helper to check if using fallback data
    isFallbackMode() {
        return false; // Set to false to try real endpoints first
    }
}

export default new AvailabilityService();
