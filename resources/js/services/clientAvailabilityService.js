import axios from "axios";

const API_BASE = "/api/client";

class ClientAvailabilityService {
    async getAvailableSlots(params) {
        try {
            const response = await axios.get(`${API_BASE}/availability/slots`, {
                params,
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Client availability slots endpoint not available, using fallback"
            );

            // Return fallback available slots for development
            return {
                success: true,
                data: this.getFallbackAvailableSlots(params.date),
                message: "Available slots (fallback mode)",
                fallback: true,
            };
        }
    }

    async checkAvailability(providerId, date, duration) {
        try {
            const response = await axios.get(`${API_BASE}/availability/check`, {
                params: { provider_id: providerId, date, duration },
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Client availability check endpoint not available, using fallback"
            );

            return {
                success: true,
                data: { available: true },
                message: "Available (fallback mode)",
                fallback: true,
            };
        }
    }

    async getProviderAvailability(providerId, startDate, endDate) {
        try {
            const response = await axios.get(
                `${API_BASE}/providers/${providerId}/availability`,
                {
                    params: { start_date: startDate, end_date: endDate },
                }
            );
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Provider availability endpoint not available, using fallback"
            );

            return {
                success: true,
                data: this.getFallbackProviderAvailability(),
                message: "Provider availability (fallback mode)",
                fallback: true,
            };
        }
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
                { day: 0, available: false, start_time: null, end_time: null },
                {
                    day: 1,
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 2,
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 3,
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 4,
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                {
                    day: 5,
                    available: true,
                    start_time: "09:00",
                    end_time: "17:00",
                },
                { day: 6, available: false, start_time: null, end_time: null },
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
