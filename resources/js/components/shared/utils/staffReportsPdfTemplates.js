/**
 * Staff Reports PDF Template Generation Utilities
 * Provides templates for staff management analytics reports
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

export const generateStaffReportsPDFHeader = (dateRange, config = {}) => {
    const { companyName = 'HireMe' } = config;
    
    return `
        <div class="header">
            <h1>Staff Management Analytics Report</h1>
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
            })} | ${companyName} Staff Portal
        </div>
    `;
};

export const generatePlatformSummarySection = (summaryData) => {
    return `
        <div class="section full-width">
            <h3>Platform Overview</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">Total Users</div>
                    <div class="summary-value users">${summaryData.total_users || 0}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Total Services</div>
                    <div class="summary-value services">${summaryData.total_services || 0}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Success Rate</div>
                    <div class="summary-value rate">${summaryData.success_rate || 0}%</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">Platform Revenue</div>
                    <div class="summary-value revenue">${summaryData.total_revenue || 'LKR 0.00'}</div>
                </div>
            </div>
        </div>
    `;
};

export const generateUserGrowthSection = (userGrowthData) => {
    if (!userGrowthData.labels || userGrowthData.labels.length === 0) {
        return `
            <div class="section">
                <h3>User Growth Analysis</h3>
                <div class="no-data">No user growth data available for the selected period.</div>
            </div>
        `;
    }

    const clientRows = userGrowthData.labels.map((label, index) => {
        const clients = userGrowthData.clients[index] || 0;
        const providers = userGrowthData.providers[index] || 0;
        return `
            <tr>
                <td>${label}</td>
                <td class="count">${clients}</td>
                <td class="count">${providers}</td>
                <td class="count">${clients + providers}</td>
            </tr>
        `;
    }).join('');

    const totalClients = userGrowthData.clients.reduce((sum, count) => sum + (count || 0), 0);
    const totalProviders = userGrowthData.providers.reduce((sum, count) => sum + (count || 0), 0);

    return `
        <div class="section">
            <h3>User Growth Analysis</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>New Clients</th>
                        <th>New Providers</th>
                        <th>Total New Users</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total</strong></td>
                        <td class="count"><strong>${totalClients}</strong></td>
                        <td class="count"><strong>${totalProviders}</strong></td>
                        <td class="count"><strong>${totalClients + totalProviders}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

export const generateServiceAnalyticsSection = (serviceData) => {
    if (!serviceData.labels || serviceData.labels.length === 0) {
        return `
            <div class="section">
                <h3>Service Category Analytics</h3>
                <div class="no-data">No service analytics data available for the selected period.</div>
            </div>
        `;
    }

    const serviceRows = serviceData.labels.map((label, index) => {
        const count = serviceData.data[index] || 0;
        return `
            <tr>
                <td>${label}</td>
                <td class="count">${count}</td>
            </tr>
        `;
    }).join('');

    const totalServices = serviceData.data.reduce((sum, count) => sum + (count || 0), 0);

    return `
        <div class="section">
            <h3>Service Category Analytics</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Services Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total Services</strong></td>
                        <td class="count"><strong>${totalServices}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

export const generateAppointmentAnalyticsSection = (appointmentData) => {
    if (!appointmentData.labels || appointmentData.labels.length === 0) {
        return `
            <div class="section">
                <h3>Appointment Status Analysis</h3>
                <div class="no-data">No appointment data available for the selected period.</div>
            </div>
        `;
    }

    const total = appointmentData.data.reduce((sum, count) => sum + (count || 0), 0);

    const appointmentRows = appointmentData.labels.map((label, index) => {
        const count = appointmentData.data[index] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        let statusClass = '';
        switch(label.toLowerCase()) {
            case 'completed':
                statusClass = 'success';
                break;
            case 'cancelled':
                statusClass = 'danger';
                break;
            case 'confirmed':
                statusClass = 'info';
                break;
            case 'pending':
                statusClass = 'warning';
                break;
        }

        return `
            <tr>
                <td>${label}</td>
                <td class="count ${statusClass}">${count} (${percentage}%)</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="section">
            <h3>Appointment Status Analysis</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Count (Percentage)</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointmentRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total Appointments</strong></td>
                        <td class="count"><strong>${total}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

export const generateRevenueAnalyticsSection = (revenueData) => {
    if (!revenueData.labels || revenueData.labels.length === 0) {
        return `
            <div class="section">
                <h3>Platform Revenue Analysis</h3>
                <div class="no-data">No revenue data available for the selected period.</div>
            </div>
        `;
    }

    const revenueRows = revenueData.labels.map((label, index) => {
        const amount = revenueData.data[index] || 0;
        return `
            <tr>
                <td>${label}</td>
                <td class="amount">${formatCurrency(amount)}</td>
            </tr>
        `;
    }).join('');

    const totalRevenue = revenueData.data.reduce((sum, amount) => sum + (amount || 0), 0);

    return `
        <div class="section">
            <h3>Platform Revenue Analysis</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${revenueRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Total Revenue</strong></td>
                        <td class="amount"><strong>${formatCurrency(totalRevenue)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

export const generateStaffChartsHeader = (dateRange, config = {}) => {
    const { companyName = 'HireMe' } = config;
    
    return `
        <div class="header">
            <h1>Staff Analytics Charts Dashboard</h1>
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
            })} | ${companyName} Staff Portal
        </div>
    `;
};

export const generateStaffChartsPlaceholderSection = (analyticsData) => {
    const userGrowthData = analyticsData.user_growth || {};
    const serviceData = analyticsData.service_statistics || {};
    const appointmentData = analyticsData.appointment_analytics || {};
    const revenueData = analyticsData.revenue_analytics || {};

    return `
        <div class="charts-container">
            <div class="charts-grid">
                <div class="chart-section">
                    <h3>📈 User Growth Trends</h3>
                    <div class="chart-placeholder user-growth-chart">
                        ${generateUserGrowthChartPlaceholder(userGrowthData)}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>🛎️ Services by Category</h3>
                    <div class="chart-placeholder service-chart">
                        ${generateServicesPieChartPlaceholder(serviceData)}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>📊 Appointment Status</h3>
                    <div class="chart-placeholder appointment-chart">
                        ${generateAppointmentsPieChartPlaceholder(appointmentData)}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>💰 Platform Revenue</h3>
                    <div class="chart-placeholder revenue-chart">
                        ${generateRevenueLineChartPlaceholder(revenueData)}
                    </div>
                </div>
            </div>
        </div>
    `;
};

const generateUserGrowthChartPlaceholder = (userGrowthData) => {
    if (!userGrowthData.labels || userGrowthData.labels.length === 0) {
        return '<div class="no-data-message">No user growth data available for the selected period</div>';
    }

    const maxClients = Math.max(...userGrowthData.clients);
    const maxProviders = Math.max(...userGrowthData.providers);
    const maxValue = Math.max(maxClients, maxProviders);
    
    const bars = userGrowthData.labels.map((label, index) => {
        const clients = userGrowthData.clients[index] || 0;
        const providers = userGrowthData.providers[index] || 0;
        const clientHeight = maxValue > 0 ? (clients / maxValue) * 100 : 0;
        const providerHeight = maxValue > 0 ? (providers / maxValue) * 100 : 0;
        
        return `
            <div class="chart-bar">
                <div class="bar" style="height: ${clientHeight}%; background: linear-gradient(to top, #75c2c2, #4bc0c0);"></div>
                <div class="bar" style="height: ${providerHeight}%; background: linear-gradient(to top, #9966cc, #8b5cf6); margin-top: 2px;"></div>
                <div class="bar-label">${label}</div>
                <div class="bar-value">C:${clients} P:${providers}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="bar-chart">
            <div class="chart-bars">${bars}</div>
        </div>
    `;
};

const generateServicesPieChartPlaceholder = (serviceData) => {
    if (!serviceData.labels || serviceData.labels.length === 0) {
        return '<div class="no-data-message">No service data available</div>';
    }

    const total = serviceData.data.reduce((sum, count) => sum + (count || 0), 0);
    const colors = ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966cc', '#ff9f40'];
    
    const legend = serviceData.labels.slice(0, 6).map((label, index) => {
        const count = serviceData.data[index] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const color = colors[index % colors.length];
        
        return `
            <div class="pie-legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span>${label}: ${count} (${percentage}%)</span>
            </div>
        `;
    }).join('');

    return `
        <div class="pie-chart-container">
            <div class="pie-visual">
                <div class="pie-circle">
                    <div class="pie-center">${total}<br><small>Services</small></div>
                </div>
            </div>
            <div class="pie-legend">
                ${legend}
            </div>
        </div>
    `;
};

const generateAppointmentsPieChartPlaceholder = (appointmentData) => {
    if (!appointmentData.labels || appointmentData.labels.length === 0) {
        return '<div class="no-data-message">No appointment data available</div>';
    }

    const total = appointmentData.data.reduce((sum, count) => sum + (count || 0), 0);
    const colors = {
        completed: '#28a745',
        confirmed: '#17a2b8', 
        pending: '#ffc107',
        cancelled: '#dc3545'
    };
    
    const legend = appointmentData.labels.map((label, index) => {
        const count = appointmentData.data[index] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const color = colors[label.toLowerCase()] || '#6c757d';
        
        return `
            <div class="pie-legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span>${label}: ${count} (${percentage}%)</span>
            </div>
        `;
    }).join('');

    return `
        <div class="pie-chart-container">
            <div class="pie-visual">
                <div class="pie-circle">
                    <div class="pie-center">${total}<br><small>Appointments</small></div>
                </div>
            </div>
            <div class="pie-legend">
                ${legend}
            </div>
        </div>
    `;
};

const generateRevenueLineChartPlaceholder = (revenueData) => {
    if (!revenueData.labels || revenueData.labels.length === 0) {
        return '<div class="no-data-message">No revenue data available</div>';
    }

    const maxValue = Math.max(...revenueData.data);
    const points = revenueData.labels.map((label, index) => {
        const value = revenueData.data[index] || 0;
        const x = (index / (revenueData.labels.length - 1)) * 100;
        const y = maxValue > 0 ? 100 - (value / maxValue) * 80 : 90;
        
        return `<circle cx="${x}%" cy="${y}%" r="3" fill="#007bff" />`;
    }).join('');

    const lines = revenueData.labels.map((label, index) => {
        if (index === 0) return '';
        
        const prevValue = revenueData.data[index - 1] || 0;
        const currValue = revenueData.data[index] || 0;
        
        const x1 = ((index - 1) / (revenueData.labels.length - 1)) * 100;
        const y1 = maxValue > 0 ? 100 - (prevValue / maxValue) * 80 : 90;
        const x2 = (index / (revenueData.labels.length - 1)) * 100;
        const y2 = maxValue > 0 ? 100 - (currValue / maxValue) * 80 : 90;
        
        return `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" stroke="#007bff" stroke-width="2" />`;
    }).join('');

    const labels = revenueData.labels.map((label, index) => {
        const x = (index / (revenueData.labels.length - 1)) * 100;
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

export const generateStaffReportsPrintButtons = () => {
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