export const formatCurrency = (amount, currency = "USD") => {
    if (amount === null || amount === undefined) return "$0.00";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (date, options = {}) => {
    if (!date) return "";

    const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        ...options,
    };

    return new Date(date).toLocaleDateString("en-US", defaultOptions);
};

export const formatDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined) return "0";

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(number);
};

export const getStatusBadgeClass = (status) => {
    const statusClasses = {
        pending: "bg-warning text-dark",
        confirmed: "bg-success",
        in_progress: "bg-primary",
        completed: "bg-info",
        cancelled_by_client: "bg-danger",
        cancelled_by_provider: "bg-danger",
        no_show: "bg-dark",
        disputed: "bg-warning text-dark",
        // Invoice statuses
        draft: "bg-secondary",
        sent: "bg-primary",
        paid: "bg-success",
        overdue: "bg-danger",
    };

    return `badge ${statusClasses[status] || "bg-secondary"}`;
};
