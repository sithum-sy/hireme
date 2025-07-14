import axios from "axios";

const API_BASE = "/api/client";

class ClientAvailabilityService {
    async getAvailableSlots(params) {
        try {
            const response = await axios.get(
                `/api/client/providers/${params.provider_id}/availability/slots`,
                {
                    params: {
                        date: params.date,
                        service_duration: params.duration || 1,
                    },
                }
            );

            return {
                success: true,
                data: this.formatAvailabilitySlots(
                    response.data.data?.available_slots || []
                ),
                working_hours: response.data.data?.working_hours,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Provider availability slots endpoint error:", error);

            // Return empty slots for safety rather than fake data
            return {
                success: false,
                data: [],
                message: "Unable to load available times",
                fallback: true,
            };
        }
    }

    async getProviderWeeklyAvailability(providerId) {
        try {
            const response = await axios.get(
                `${API_BASE}/providers/${providerId}/availability/weekly`
            );

            return {
                success: true,
                data: this.formatWeeklyAvailability(
                    response.data.data || response.data
                ),
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Provider weekly availability endpoint not available, using fallback"
            );

            return {
                success: true,
                data: this.getFallbackProviderAvailability(),
                message: "Weekly availability (fallback mode)",
                fallback: true,
            };
        }
    }

    async checkAvailability(providerId, date, startTime, endTime) {
        try {
            const response = await axios.get(
                `/api/client/providers/${providerId}/availability/check`,
                {
                    params: {
                        date,
                        start_time: startTime,
                        end_time: endTime,
                    },
                }
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Provider availability check endpoint error:", error);

            // Return realistic fallback that assumes unavailable for safety
            return {
                success: false,
                data: {
                    available: false,
                    reason: "Unable to verify availability - please contact provider directly",
                },
                message: "Availability check failed",
                fallback: true,
            };
        }
    }

    // Format availability slots from Laravel backend
    formatAvailabilitySlots(slotsData) {
        if (!Array.isArray(slotsData)) {
            return [];
        }

        return slotsData.map((slot) => ({
            time: slot.start_time || slot.time,
            end_time: slot.end_time,
            formatted_time:
                slot.formatted_time ||
                this.formatTimeForDisplay(slot.start_time || slot.time),
            is_popular: slot.is_popular || false,
            is_available: slot.is_available !== false, // Default to true unless explicitly false
        }));
    }

    // Format weekly availability from Laravel backend
    formatWeeklyAvailability(weeklyData) {
        if (!Array.isArray(weeklyData)) {
            return this.getFallbackProviderAvailability().weekly_schedule;
        }

        return weeklyData.map((day) => ({
            day: day.day_of_week,
            day_name: day.day_name,
            available: day.is_available,
            start_time: day.start_time,
            end_time: day.end_time,
            formatted_time_range:
                day.formatted_time_range ||
                this.formatTimeRange(day.start_time, day.end_time),
        }));
    }

    // Fallback data methods for development
    getFallbackAvailableSlots(date) {
        const slots = [
            { time: "09:00", formatted_time: "9:00 AM", is_popular: false },
            { time: "10:00", formatted_time: "10:00 AM", is_popular: true },
            { time: "11:00", formatted_time: "11:00 AM", is_popular: false },
            { time: "13:00", formatted_time: "1:00 PM", is_popular: false },
            { time: "14:00", formatted_time: "2:00 PM", is_popular: true },
            { time: "15:00", formatted_time: "3:00 PM", is_popular: false },
            { time: "16:00", formatted_time: "4:00 PM", is_popular: false },
        ];

        // Simulate fewer slots on weekends
        const dayOfWeek = new Date(date).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return slots.slice(0, 3); // Only morning slots on weekends
        }

        return slots;
    }

    getFallbackProviderAvailability() {
        return {
            weekly_schedule: [
                {
                    day: 0,
                    day_name: "Sunday",
                    available: false,
                    start_time: null,
                    end_time: null,
                },
                {
                    day: 1,
                    day_name: "Monday",
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 2,
                    day_name: "Tuesday",
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 3,
                    day_name: "Wednesday",
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 4,
                    day_name: "Thursday",
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 5,
                    day_name: "Friday",
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 6,
                    day_name: "Saturday",
                    available: false,
                    start_time: null,
                    end_time: null,
                },
            ],
            blocked_dates: ["2025-07-20", "2025-07-25"],
        };
    }

    // Utility methods
    formatTimeForDisplay(time) {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    formatTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return "Unavailable";
        return `${this.formatTimeForDisplay(
            startTime
        )} - ${this.formatTimeForDisplay(endTime)}`;
    }

    isTimeSlotAvailable(slot, existingBookings = []) {
        // Check if time slot conflicts with existing bookings
        return !existingBookings.some(
            (booking) =>
                booking.time === slot.time && booking.status !== "cancelled"
        );
    }

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const endHours = hours + duration;
        const endMinutes = minutes;

        return `${String(endHours).padStart(2, "0")}:${String(
            endMinutes
        ).padStart(2, "0")}`;
    }
}

export default new ClientAvailabilityService();
