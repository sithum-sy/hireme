/**
 * Date and time formatting utilities
 */

/**
 * Format date string from Laravel (YYYY-MM-DD) to display format
 * @param {string|Date} date - Date in YYYY-MM-DD format or Date object
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return "Date not available";

    try {
        let dateObj;

        if (typeof date === "string") {
            // Handle Laravel date format (YYYY-MM-DD)
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                const day = parseInt(dateParts[2]);
                dateObj = new Date(year, month, day);
            } else {
                dateObj = new Date(date);
            }
        } else {
            dateObj = new Date(date);
        }

        if (isNaN(dateObj.getTime())) {
            throw new Error("Invalid date");
        }

        const defaultOptions = {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        };

        return dateObj.toLocaleDateString("en-US", {
            ...defaultOptions,
            ...options,
        });
    } catch (error) {
        console.warn("Date formatting error:", error, { date });
        return date.toString();
    }
};

/**
 * Format time string from Laravel (HH:MM:SS or HH:MM) to 12-hour format
 * @param {string} time - Time in HH:MM or HH:MM:SS format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
    if (!time) return "Time not available";

    try {
        const timeParts = time.toString().split(":");
        if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHour = hours % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }
        return time.toString();
    } catch (error) {
        console.warn("Time formatting error:", error, { time });
        return time.toString();
    }
};

/**
 * Format full date and time for appointments
 * @param {string|Date} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {object} Object with formatted date and time
 */
export const formatDateTime = (date, time) => {
    return {
        date: formatDate(date),
        time: formatTime(time),
        fullDate: formatDate(date, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        shortDate: formatDate(date, {
            month: "short",
            day: "numeric",
        }),
        isToday: isToday(date),
        isPast: isPast(date, time),
        isUpcoming: !isPast(date, time),
    };
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    if (!date) return false;

    try {
        let dateObj;
        if (typeof date === "string") {
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1;
                const day = parseInt(dateParts[2]);
                dateObj = new Date(year, month, day);
            } else {
                dateObj = new Date(date);
            }
        } else {
            dateObj = new Date(date);
        }

        const today = new Date();
        return dateObj.toDateString() === today.toDateString();
    } catch (error) {
        return false;
    }
};

/**
 * Check if appointment is in the past
 * @param {string|Date} date - Appointment date
 * @param {string} time - Appointment time
 * @returns {boolean} True if appointment is in the past
 */
export const isPast = (date, time) => {
    if (!date || !time) return false;

    try {
        let dateObj;
        if (typeof date === "string") {
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1;
                const day = parseInt(dateParts[2]);
                dateObj = new Date(year, month, day);
            } else {
                dateObj = new Date(date);
            }
        } else {
            dateObj = new Date(date);
        }

        const timeParts = time.toString().split(":");
        if (timeParts.length >= 2) {
            dateObj.setHours(
                parseInt(timeParts[0]),
                parseInt(timeParts[1]),
                0,
                0
            );
        }

        return dateObj < new Date();
    } catch (error) {
        return false;
    }
};
