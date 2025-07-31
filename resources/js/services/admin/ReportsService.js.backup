import BaseService from '../core/BaseService';

/**
 * Admin Reports Service
 * Handles report generation and analytics for admin dashboard
 */
class AdminReportsService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 10 * 60 * 1000 // 10 minutes cache for reports
        });
        this.baseURL = "/admin";
    }

    /**
     * Get overview report
     */
    async getOverviewReport(params = {}) {
        const defaultParams = {
            days: 30,
        };

        return this.apiCall("GET", `${this.baseURL}/reports/overview`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get users report
     */
    async getUsersReport(params = {}) {
        const defaultParams = {
            days: 30,
        };

        return this.apiCall("GET", `${this.baseURL}/reports/users`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get services report
     */
    async getServicesReport(params = {}) {
        const defaultParams = {
            days: 30,
            category: null,
            provider_id: null
        };

        return this.apiCall("GET", `${this.baseURL}/reports/services`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get appointments report
     */
    async getAppointmentsReport(params = {}) {
        const defaultParams = {
            days: 30,
            status: null,
            provider_id: null
        };

        return this.apiCall("GET", `${this.baseURL}/reports/appointments`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get financial report
     */
    async getFinancialReport(params = {}) {
        const defaultParams = {
            days: 30,
            breakdown: 'daily' // daily, weekly, monthly
        };

        return this.apiCall("GET", `${this.baseURL}/reports/financial`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get activities report
     */
    async getActivitiesReport(params = {}) {
        const defaultParams = {
            limit: 50,
            type: null,
            user_id: null
        };

        return this.apiCall("GET", `${this.baseURL}/reports/activities`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(params = {}) {
        const defaultParams = {
            period: '30d',
            metrics: ['response_time', 'error_rate', 'throughput']
        };

        return this.apiCall("GET", `${this.baseURL}/reports/performance`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Generate custom report
     */
    async generateCustomReport(reportConfig) {
        return this.apiCall("POST", `${this.baseURL}/reports/custom`, reportConfig);
    }

    /**
     * Export report data
     */
    async exportReport(reportType, params = {}, format = 'csv') {
        const config = {
            responseType: format === 'pdf' ? 'blob' : 'json'
        };

        return this.apiCall("GET", `${this.baseURL}/reports/${reportType}/export`, {
            ...params,
            format
        }, config);
    }

    /**
     * Get scheduled reports
     */
    async getScheduledReports() {
        return this.apiCall("GET", `${this.baseURL}/reports/scheduled`);
    }

    /**
     * Create scheduled report
     */
    async createScheduledReport(reportData) {
        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/reports/scheduled`, reportData);
    }

    /**
     * Update scheduled report
     */
    async updateScheduledReport(reportId, reportData) {
        this.clearCache();
        return this.apiCall("PUT", `${this.baseURL}/reports/scheduled/${reportId}`, reportData);
    }

    /**
     * Delete scheduled report
     */
    async deleteScheduledReport(reportId) {
        this.clearCache();
        return this.apiCall("DELETE", `${this.baseURL}/reports/scheduled/${reportId}`);
    }

    // Utility methods

    /**
     * Format report data for charts
     */
    formatChartData(data, type = 'line') {
        switch (type) {
            case 'line':
                return {
                    labels: data.map(item => item.date || item.label),
                    datasets: [{
                        data: data.map(item => item.value),
                        label: 'Value'
                    }]
                };
            case 'pie':
                return {
                    labels: data.map(item => item.label),
                    datasets: [{
                        data: data.map(item => item.value),
                        backgroundColor: this.generateColors(data.length)
                    }]
                };
            case 'bar':
                return {
                    labels: data.map(item => item.label),
                    datasets: [{
                        data: data.map(item => item.value),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                };
            default:
                return data;
        }
    }

    /**
     * Generate colors for chart data
     */
    generateColors(count) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];
        
        return Array.from({ length: count }, (_, i) => 
            colors[i % colors.length]
        );
    }

    /**
     * Calculate percentage change
     */
    calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    }

    /**
     * Generate CSV from report data
     */
    generateCSV(data, filename = "report.csv") {
        if (!data || data.length === 0) {
            throw new Error("No data to export");
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header];
                        return typeof value === "string" && value.includes(",")
                            ? `"${value}"`
                            : value;
                    })
                    .join(",")
            ),
        ].join("\n");

        // Create and trigger download
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default AdminReportsService;