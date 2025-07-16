// utils/formatters.js - Sri Lankan localized formatters
export const formatCurrency = (amount, currency = "LKR") => {
    if (amount === null || amount === undefined) return "Rs. 0.00";

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return "Rs. 0.00";

    // For Sri Lankan Rupees, use custom formatting
    if (currency === "LKR") {
        // Format with commas for thousands (Sri Lankan style)
        const formatted = numericAmount.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return `Rs. ${formatted}`;
    }

    // Fallback for other currencies
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericAmount);
};

export const formatCurrencyShort = (amount) => {
    if (amount === null || amount === undefined) return "Rs. 0";

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return "Rs. 0";

    // Format large numbers with K/M/B suffixes
    if (numericAmount >= 1000000000) {
        return `Rs. ${(numericAmount / 1000000000).toFixed(1)}B`;
    } else if (numericAmount >= 1000000) {
        return `Rs. ${(numericAmount / 1000000).toFixed(1)}M`;
    } else if (numericAmount >= 1000) {
        return `Rs. ${(numericAmount / 1000).toFixed(1)}K`;
    } else {
        return `Rs. ${numericAmount.toFixed(0)}`;
    }
};

export const formatDate = (dateString, format = "short") => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";

        // Sri Lankan date formatting preferences
        const options = {
            short: {
                year: "numeric",
                month: "short",
                day: "numeric",
            },
            long: {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            },
            medium: {
                year: "numeric",
                month: "long",
                day: "numeric",
            },
            numeric: {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            },
        };

        return date.toLocaleDateString(
            "en-LK",
            options[format] || options.short
        );
    } catch (error) {
        return "Invalid Date";
    }
};

export const formatDateTime = (dateString, format = "short") => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";

        const options = {
            short: {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            },
            long: {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            },
        };

        return date.toLocaleDateString(
            "en-LK",
            options[format] || options.short
        );
    } catch (error) {
        return "Invalid Date";
    }
};

export const formatTime = (timeString, format12Hour = true) => {
    if (!timeString) return "N/A";

    try {
        // Handle different time formats
        let date;
        if (timeString.includes("T") || timeString.includes(" ")) {
            // Full datetime
            date = new Date(timeString);
        } else if (timeString.includes(":")) {
            // Time only (HH:MM or HH:MM:SS)
            const today = new Date();
            const [hours, minutes, seconds = "00"] = timeString.split(":");
            date = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            );
        } else {
            return timeString; // Return as-is if can't parse
        }

        if (isNaN(date.getTime())) return "Invalid Time";

        return date.toLocaleTimeString("en-LK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: format12Hour,
        });
    } catch (error) {
        return "Invalid Time";
    }
};

export const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined) return "0";

    const numericValue = parseFloat(number);
    if (isNaN(numericValue)) return "0";

    // Use Sri Lankan number formatting (with commas)
    return numericValue.toLocaleString("en-LK", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "N/A";

    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Sri Lankan phone number formats
    if (cleaned.length === 10 && cleaned.startsWith("0")) {
        // Local format: 0771234567 -> 077 123 4567
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
            6
        )}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("94")) {
        // International format: 94771234567 -> +94 77 123 4567
        return `+94 ${cleaned.slice(2, 4)} ${cleaned.slice(
            4,
            7
        )} ${cleaned.slice(7)}`;
    } else if (cleaned.length === 9 && !cleaned.startsWith("0")) {
        // Without leading 0: 771234567 -> 077 123 4567
        return `0${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
            5
        )}`;
    }

    // Return as-is if doesn't match Sri Lankan patterns
    return phoneNumber;
};

export const formatAddress = (address, city = "", province = "") => {
    if (!address) return "N/A";

    const parts = [address, city, province].filter(
        (part) => part && part.trim()
    );
    return parts.join(", ");
};

export const formatDuration = (hours) => {
    if (!hours || hours === 0) return "N/A";

    const numericHours = parseFloat(hours);
    if (isNaN(numericHours)) return "N/A";

    if (numericHours < 1) {
        const minutes = Math.round(numericHours * 60);
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else if (numericHours === 1) {
        return "1 hour";
    } else if (numericHours % 1 === 0) {
        return `${numericHours} hours`;
    } else {
        const wholeHours = Math.floor(numericHours);
        const minutes = Math.round((numericHours - wholeHours) * 60);
        return `${wholeHours}h ${minutes}m`;
    }
};

export const formatDistance = (kilometers) => {
    if (!kilometers || kilometers === 0) return "N/A";

    const numericKm = parseFloat(kilometers);
    if (isNaN(numericKm)) return "N/A";

    if (numericKm < 1) {
        const meters = Math.round(numericKm * 1000);
        return `${meters}m`;
    } else {
        return `${numericKm.toFixed(1)}km`;
    }
};

// Helper function for relative time (e.g., "2 hours ago", "in 3 days")
export const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return diffInSeconds < 0 ? "in a few seconds" : "just now";
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return diffInMinutes < 0
                ? `in ${Math.abs(diffInMinutes)} minute${
                      Math.abs(diffInMinutes) !== 1 ? "s" : ""
                  }`
                : `${diffInMinutes} minute${
                      diffInMinutes !== 1 ? "s" : ""
                  } ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return diffInHours < 0
                ? `in ${Math.abs(diffInHours)} hour${
                      Math.abs(diffInHours) !== 1 ? "s" : ""
                  }`
                : `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return diffInDays < 0
                ? `in ${Math.abs(diffInDays)} day${
                      Math.abs(diffInDays) !== 1 ? "s" : ""
                  }`
                : `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
        }

        // For longer periods, just show the date
        return formatDate(dateString);
    } catch (error) {
        return "Invalid Date";
    }
};

// Sri Lankan specific provinces for validation/formatting
export const SRI_LANKAN_PROVINCES = [
    "Western Province",
    "Central Province",
    "Southern Province",
    "Northern Province",
    "Eastern Province",
    "North Western Province",
    "North Central Province",
    "Uva Province",
    "Sabaragamuwa Province",
];

// Major Sri Lankan cities
export const SRI_LANKAN_CITIES = [
    "Colombo",
    "Kandy",
    "Galle",
    "Jaffna",
    "Negombo",
    "Anuradhapura",
    "Polonnaruwa",
    "Batticaloa",
    "Trincomalee",
    "Kurunegala",
    "Ratnapura",
    "Badulla",
    "Matara",
    "Kalutara",
    "Gampaha",
    "Nuwara Eliya",
    "Ampara",
    "Hambantota",
];

// Format service categories in Sinhala/Tamil if needed
// export const formatServiceCategory = (category, language = "en") => {
//     if (!category) return "N/A";

//     // Add translations if needed
//     const translations = {
//         "home-services": {
//             en: "Home Services",
//             si: "ගෘහ සේවා",
//             ta: "வீட்டு சேவைகள்",
//         },
//         "beauty-wellness": {
//             en: "Beauty & Wellness",
//             si: "සුන්දරත්වය සහ සෞඛ්ය",
//             ta: "அழகு மற்றும் ஆரோக்கியம்",
//         },
//         // Add more as needed
//     };

//     return translations[category]?.[language] || category;
// };

// Utility to format invoice numbers in Sri Lankan style
export const formatInvoiceNumber = (invoiceNumber) => {
    if (!invoiceNumber) return "N/A";

    // If it's already formatted, return as-is
    if (invoiceNumber.includes("-")) return invoiceNumber;

    // If it's just a number, format it
    const padded = invoiceNumber.toString().padStart(6, "0");
    const year = new Date().getFullYear();
    return `INV-${year}-${padded}`;
};
