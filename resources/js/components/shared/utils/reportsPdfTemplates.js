/**
 * Reports PDF Template Generation Utilities
 * Provides templates for provider analytics reports
 */

export const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount || 0).toLocaleString('en-LK', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`;
};

export const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch (error) {
        return dateString || 'N/A';
    }
};

export const generateReportsPDFHeader = (dateRange, config = {}) => {
    const { companyName = 'HireMe' } = config;
    
    return `
        <div class="header">
            <h1>Provider Analytics Report</h1>
            <div class="date-range">
                ${formatDate(dateRange.start_date)} - ${formatDate(dateRange.end_date)}
            </div>
        </div>
        
        <div class="meta">
            Generated on: ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })} | ${companyName}
        </div>
    `;
};

export const generateSummarySection = (summaryData) => {
    return `
        <div class="section full-width">
            <h3>Performance Summary</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">Total Income</div>
                    <div class="summary-value income">${summaryData.total_income || 'LKR 0.00'}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Appointments</div>
                    <div class="summary-value">${summaryData.total_appointments || 0}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Success Rate</div>
                    <div class="summary-value rate">${summaryData.completed_rate || 0}%</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Active Services</div>
                    <div class="summary-value">${summaryData.active_services || 0}</div>
                </div>
            </div>
        </div>
    `;
};

export const generateIncomeAnalysisSection = (incomeData) => {
    if (!incomeData.labels || incomeData.labels.length === 0) {
        return `
            <div class="section">
                <h3>Income Analysis</h3>
                <div class="no-data">No income data available for the selected period.</div>
            </div>
        `;
    }

    const incomeRows = incomeData.labels.map((label, index) => {
        const amount = incomeData.data[index] || 0;
        return `
            <tr>
                <td>${label}</td>
                <td class="amount">${formatCurrency(amount)}</td>
            </tr>
        `;
    }).join('');

    const totalIncome = incomeData.data.reduce((sum, amount) => sum + (amount || 0), 0);

    return `
        <div class="section">
            <h3>Income Analysis</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Income</th>
                    </tr>
                </thead>
                <tbody>
                    ${incomeRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total</strong></td>
                        <td class="amount"><strong>${formatCurrency(totalIncome)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

export const generateAppointmentAnalysisSection = (appointmentData, successRateData) => {
    if (!appointmentData.labels || appointmentData.labels.length === 0) {
        return `
            <div class="section">
                <h3>Appointment Analysis</h3>
                <div class="no-data">No appointment data available for the selected period.</div>
            </div>
        `;
    }

    const appointmentRows = appointmentData.labels.map((label, index) => {
        const count = appointmentData.data[index] || 0;
        return `
            <tr>
                <td>${label}</td>
                <td class="count">${count}</td>
            </tr>
        `;
    }).join('');

    const totalAppointments = appointmentData.data.reduce((sum, count) => sum + (count || 0), 0);

    // Success rate breakdown
    const [completed, cancelled, inProgress, pending] = successRateData || [0, 0, 0, 0];
    const total = completed + cancelled + inProgress + pending;

    return `
        <div class="section">
            <h3>Appointment Analysis</h3>
            
            <div class="subsection">
                <h4>Appointment Trends</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Appointments</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointmentRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td class="count"><strong>${totalAppointments}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            ${total > 0 ? `
            <div class="subsection">
                <h4>Status Breakdown</h4>
                <table class="data-table">
                    <tbody>
                        <tr>
                            <td>Completed</td>
                            <td class="count success">${completed} (${total > 0 ? Math.round((completed / total) * 100) : 0}%)</td>
                        </tr>
                        <tr>
                            <td>Cancelled</td>
                            <td class="count danger">${cancelled} (${total > 0 ? Math.round((cancelled / total) * 100) : 0}%)</td>
                        </tr>
                        <tr>
                            <td>In Progress</td>
                            <td class="count info">${inProgress} (${total > 0 ? Math.round((inProgress / total) * 100) : 0}%)</td>
                        </tr>
                        <tr>
                            <td>Pending</td>
                            <td class="count warning">${pending} (${total > 0 ? Math.round((pending / total) * 100) : 0}%)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ` : ''}
        </div>
    `;
};

export const generateServicePerformanceSection = (serviceData) => {
    if (!serviceData.labels || serviceData.labels.length === 0) {
        return `
            <div class="section">
                <h3>Service Performance</h3>
                <div class="no-data">No service performance data available for the selected period.</div>
            </div>
        `;
    }

    const serviceRows = serviceData.labels.map((label, index) => {
        const bookings = serviceData.data[index] || 0;
        return `
            <tr>
                <td>${label}</td>
                <td class="count">${bookings}</td>
            </tr>
        `;
    }).join('');

    const totalBookings = serviceData.data.reduce((sum, count) => sum + (count || 0), 0);

    return `
        <div class="section">
            <h3>Service Performance</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Bookings</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total Bookings</strong></td>
                        <td class="count"><strong>${totalBookings}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

export const generateChartsHeader = (dateRange, config = {}) => {
    const { companyName = 'HireMe' } = config;
    
    return `
        <div class="header">
            <h1>Analytics Charts Dashboard</h1>
            <div class="date-range">
                ${formatDate(dateRange.start_date)} - ${formatDate(dateRange.end_date)}
            </div>
        </div>
        
        <div class="meta">
            Generated on: ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })} | ${companyName}
        </div>
    `;
};

export const generateChartsPlaceholderSection = (analyticsData) => {
    const incomeData = analyticsData.income_chart || {};
    const appointmentData = analyticsData.appointment_trend || {};
    const serviceData = analyticsData.service_performance || {};
    const successData = analyticsData.success_rate || [0, 0, 0, 0];

    return `
        <div class="charts-container">
            <div class="charts-grid">
                <div class="chart-section">
                    <h3>📊 Monthly Income Chart</h3>
                    <div class="chart-placeholder income-chart">
                        ${generateIncomeChartPlaceholder(incomeData)}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>🥧 Appointment Status Distribution</h3>
                    <div class="chart-placeholder pie-chart">
                        ${generateSuccessRatePlaceholder(successData)}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>📈 Appointment Trends</h3>
                    <div class="chart-placeholder trend-chart">
                        ${generateTrendChartPlaceholder(appointmentData)}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>🛎️ Service Performance</h3>
                    <div class="chart-placeholder service-chart">
                        ${generateServiceChartPlaceholder(serviceData)}
                    </div>
                </div>
            </div>
        </div>
    `;
};

const generateIncomeChartPlaceholder = (incomeData) => {
    if (!incomeData.labels || incomeData.labels.length === 0) {
        return '<div class="no-data-message">No income data available for the selected period</div>';
    }

    const maxValue = Math.max(...incomeData.data);
    const bars = incomeData.labels.map((label, index) => {
        const value = incomeData.data[index] || 0;
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return `
            <div class="chart-bar">
                <div class="bar" style="height: ${height}%"></div>
                <div class="bar-label">${label}</div>
                <div class="bar-value">${formatCurrency(value)}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="bar-chart">
            <div class="chart-bars">${bars}</div>
        </div>
    `;
};

const generateSuccessRatePlaceholder = (successData) => {
    const [completed, cancelled, inProgress, pending] = successData;
    const total = completed + cancelled + inProgress + pending;

    if (total === 0) {
        return '<div class="no-data-message">No appointment data available</div>';
    }

    const segments = [
        { label: 'Completed', value: completed, color: '#28a745', percentage: Math.round((completed / total) * 100) },
        { label: 'Cancelled', value: cancelled, color: '#dc3545', percentage: Math.round((cancelled / total) * 100) },
        { label: 'In Progress', value: inProgress, color: '#17a2b8', percentage: Math.round((inProgress / total) * 100) },
        { label: 'Pending', value: pending, color: '#ffc107', percentage: Math.round((pending / total) * 100) }
    ].filter(segment => segment.value > 0);

    const legend = segments.map(segment => `
        <div class="pie-legend-item">
            <div class="legend-color" style="background-color: ${segment.color}"></div>
            <span>${segment.label}: ${segment.value} (${segment.percentage}%)</span>
        </div>
    `).join('');

    return `
        <div class="pie-chart-container">
            <div class="pie-visual">
                <div class="pie-circle">
                    <div class="pie-center">${total}<br><small>Total</small></div>
                </div>
            </div>
            <div class="pie-legend">
                ${legend}
            </div>
        </div>
    `;
};

const generateTrendChartPlaceholder = (appointmentData) => {
    if (!appointmentData.labels || appointmentData.labels.length === 0) {
        return '<div class="no-data-message">No appointment trend data available</div>';
    }

    const maxValue = Math.max(...appointmentData.data);
    const points = appointmentData.labels.map((label, index) => {
        const value = appointmentData.data[index] || 0;
        const x = (index / (appointmentData.labels.length - 1)) * 100;
        const y = maxValue > 0 ? 100 - (value / maxValue) * 80 : 90;
        
        return `<circle cx="${x}%" cy="${y}%" r="3" fill="#007bff" />`;
    }).join('');

    const lines = appointmentData.labels.map((label, index) => {
        if (index === 0) return '';
        
        const prevValue = appointmentData.data[index - 1] || 0;
        const currValue = appointmentData.data[index] || 0;
        
        const x1 = ((index - 1) / (appointmentData.labels.length - 1)) * 100;
        const y1 = maxValue > 0 ? 100 - (prevValue / maxValue) * 80 : 90;
        const x2 = (index / (appointmentData.labels.length - 1)) * 100;
        const y2 = maxValue > 0 ? 100 - (currValue / maxValue) * 80 : 90;
        
        return `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" stroke="#007bff" stroke-width="2" />`;
    }).join('');

    const labels = appointmentData.labels.map((label, index) => {
        const x = (index / (appointmentData.labels.length - 1)) * 100;
        return `<text x="${x}%" y="95%" text-anchor="middle" class="chart-label">${label}</text>`;
    }).join('');

    return `
        <div class="line-chart">
            <svg viewBox="0 0 100 100" class="trend-svg">
                ${lines}
                ${points}
                ${labels}
            </svg>
        </div>
    `;
};

const generateServiceChartPlaceholder = (serviceData) => {
    if (!serviceData.labels || serviceData.labels.length === 0) {
        return '<div class="no-data-message">No service performance data available</div>';
    }

    const maxValue = Math.max(...serviceData.data);
    const bars = serviceData.labels.map((label, index) => {
        const value = serviceData.data[index] || 0;
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return `
            <div class="service-bar">
                <div class="bar horizontal" style="width: ${height}%"></div>
                <div class="service-label">${label}</div>
                <div class="service-value">${value}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="horizontal-bar-chart">
            ${bars}
        </div>
    `;
};

export const generateReportsPrintButtons = () => {
    return `
        <div class="no-print" style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #ddd;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">
                📄 Print Report
            </button>
            <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ✖ Close
            </button>
        </div>
    `;
};