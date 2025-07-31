import BaseService from '../core/BaseService';

/**
 * Provider Availability Service
 * Handles provider availability management and scheduling
 */
class ProviderAvailabilityService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 5 * 60 * 1000 // 5 minutes cache for availability data
        });
        this.baseURL = "/provider";
    }

    /**
     * Get weekly availability schedule
     */
    async getWeeklyAvailability() {
        return this.apiCall("GET", `${this.baseURL}/availability/weekly`);
    }

    /**
     * Update weekly availability schedule
     */
    async updateWeeklyAvailability(availabilityData) {
        this.clearCache(); // Clear cache when updating availability
        return this.apiCall("POST", `${this.baseURL}/availability/weekly`, {
            availability: availabilityData
        });
    }

    /**
     * Get availability summary
     */
    async getAvailabilitySummary() {
        return this.apiCall("GET", `${this.baseURL}/availability/summary`);
    }

    /**
     * Create blocked time period
     */
    async createBlockedTime(blockedTimeData) {
        const payload = {
            start_date: this.formatDate(blockedTimeData.start_date),
            end_date: this.formatDate(blockedTimeData.end_date),
            start_time: blockedTimeData.all_day ? null : this.formatTime(blockedTimeData.start_time),
            end_time: blockedTimeData.all_day ? null : this.formatTime(blockedTimeData.end_time),
            reason: blockedTimeData.reason,
            all_day: blockedTimeData.all_day || false
        };

        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/availability/blocked-times`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Get blocked times
     */
    async getBlockedTimes(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.start_date = this.formatDate(startDate);
        if (endDate) params.end_date = this.formatDate(endDate);

        return this.apiCall("GET", `${this.baseURL}/availability/blocked-times`, params);
    }

    /**
     * Delete blocked time
     */
    async deleteBlockedTime(blockedTimeId) {
        this.clearCache();
        return this.apiCall("DELETE", `${this.baseURL}/availability/blocked-times/${blockedTimeId}`);
    }

    /**
     * Get available time slots for a specific date
     */
    async getAvailableSlots(date, duration = 1) {
        return this.apiCall("GET", `${this.baseURL}/availability/slots`, {
            date: this.formatDate(date),
            duration
        });
    }

    /**
     * Toggle availability status (online/offline)
     */
    async toggleAvailability() {
        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/availability/toggle`);
    }

    /**
     * Set temporary unavailability
     */
    async setTemporaryUnavailability(duration, reason = null) {
        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/availability/temporary-unavailable`, {
            duration_minutes: duration,
            reason
        });
    }

    /**
     * Clear temporary unavailability
     */
    async clearTemporaryUnavailability() {
        this.clearCache();
        return this.apiCall("DELETE", `${this.baseURL}/availability/temporary-unavailable`);
    }

    // Utility methods

    /**
     * Validate availability data
     */
    validateAvailabilityData(availabilityData) {
        const errors = {};

        availabilityData.forEach((day, index) => {
            if (day.is_available) {
                if (!day.start_time) {
                    errors[`day_${index}_start_time`] = "Start time is required";
                }
                if (!day.end_time) {
                    errors[`day_${index}_end_time`] = "End time is required";
                }
                if (day.start_time && day.end_time && day.start_time >= day.end_time) {
                    errors[`day_${index}_time_range`] = "End time must be after start time";
                }
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Generate time slots for availability setting
     */
    generateTimeSlots(startHour = 6, endHour = 22, interval = 30) {
        const slots = [];
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const display = new Date(`2000-01-01 ${time}`).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                slots.push({
                    value: time,
                    label: display
                });
            }
        }
        
        return slots;
    }

    /**
     * Calculate total available hours per week
     */
    calculateWeeklyHours(availabilityData) {
        let totalHours = 0;
        
        availabilityData.forEach(day => {
            if (day.is_available && day.start_time && day.end_time) {
                const start = new Date(`2000-01-01 ${day.start_time}`);
                const end = new Date(`2000-01-01 ${day.end_time}`);
                const hours = (end - start) / (1000 * 60 * 60);
                totalHours += hours;
            }
        });
        
        return totalHours;
    }
}

export default ProviderAvailabilityService;