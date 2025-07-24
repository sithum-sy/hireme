import React, { useState } from 'react';
import ClientLayout from '../../layouts/ClientLayout';

const ClientReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const reportTypes = [
        {
            id: 'personal-activity',
            title: 'Personal Activity Report',
            description: 'Comprehensive overview of your service bookings, spending, and platform activity',
            icon: 'fas fa-chart-line',
            color: 'primary',
            endpoint: '/api/client/reports/personal-activity',
            priority: 'High',
            features: ['Booking History', 'Spending Summary', 'Service Preferences', 'Activity Insights']
        },
        {
            id: 'spending-analysis',
            title: 'Spending Analysis',
            description: 'Detailed breakdown of your service expenses with category analysis and trends',
            icon: 'fas fa-dollar-sign',
            color: 'success',
            endpoint: '/api/client/reports/spending-analysis',
            priority: 'High',
            features: ['Expense Categories', 'Monthly Trends', 'Budget Analysis', 'Savings Opportunities']
        },
        {
            id: 'service-history',
            title: 'Service History Report',
            description: 'Complete record of all your service bookings with providers and outcomes',
            icon: 'fas fa-history',
            color: 'info',
            endpoint: '/api/client/reports/service-history',
            priority: 'Medium',
            features: ['Booking Timeline', 'Provider Relationships', 'Service Outcomes', 'Completion Rates']
        },
        {
            id: 'preferences',
            title: 'Preferences & Favorites',
            description: 'Analysis of your service preferences, favorite providers, and booking patterns',
            icon: 'fas fa-heart',
            color: 'warning',
            endpoint: '/api/client/reports/preferences',
            priority: 'Low',
            features: ['Favorite Categories', 'Preferred Providers', 'Booking Patterns', 'Recommendations']
        },
        {
            id: 'transaction-history',
            title: 'Transaction History',
            description: 'Complete financial transaction record with payment methods and receipts',
            icon: 'fas fa-credit-card',
            color: 'secondary',
            endpoint: '/api/client/reports/transaction-history',
            priority: 'Medium',
            features: ['Payment Records', 'Transaction Details', 'Refund History', 'Receipt Archive']
        }
    ];

    const quickFilters = [
        { label: 'Last Month', days: 30 },
        { label: 'Last 3 Months', days: 90 },
        { label: 'Last 6 Months', days: 180 },
        { label: 'This Year', days: 365 }
    ];

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const setQuickFilter = (days) => {
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        setFilters({
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
        });
    };

    const downloadReport = async (reportType) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                format: 'pdf'
            });

            const response = await fetch(`${reportType.endpoint}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/pdf'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to generate report';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // If response is not JSON, use the text
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType.id}-${filters.start_date}-to-${filters.end_date}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert(`Failed to download report: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const viewReportData = async (reportType) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                format: 'json'
            });

            const response = await fetch(`${reportType.endpoint}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch report data');
            }

            const data = await response.json();
            console.log('Report data:', data);
            alert('Report data loaded successfully. Check console for details.');
        } catch (error) {
            console.error('Error fetching report data:', error);
            alert('Failed to fetch report data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <ClientLayout>
            <div className="page-content">
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="h2 mb-2 text-primary">My Activity Reports</h1>
                        <p className="text-muted mb-0">Track your service bookings, spending, and platform activity</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section mb-6">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Report Period</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                        <div className="col">
                            <div className="btn-group">
                                {quickFilters.map((filter, index) => (
                                    <button
                                        key={index}
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => setQuickFilter(filter.days)}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="start_date"
                                    value={filters.start_date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="end_date"
                                    value={filters.end_date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mt-4 pt-2">
                                <div className="alert alert-primary mb-0 py-2">
                                    <small>
                                        Activity period: {filters.start_date} to {filters.end_date}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                {/* Report Cards */}
                <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                    {reportTypes.map((report) => {
                        return (
                            <div key={report.id}>
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex align-items-start mb-3">
                                        <div className={`p-3 rounded-circle bg-${report.color} bg-opacity-10 me-3`}>
                                            <i className={report.icon} style={{color: `var(--bs-${report.color})`}}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="mb-1 fw-bold">{report.title}</h6>
                                                <span className={`badge bg-${getPriorityBadgeVariant(report.priority)} ms-2`}>
                                                    {report.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-muted small mb-3 flex-grow-1">
                                        {report.description}
                                    </p>

                                    <div className="mb-3">
                                        <h6 className="small fw-bold text-uppercase text-muted mb-2">Includes:</h6>
                                        <div className="d-flex flex-wrap gap-1">
                                            {report.features.map((feature, index) => (
                                                <span 
                                                    key={index} 
                                                    className="badge bg-light text-dark small fw-normal"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 mt-auto">
                                        <button
                                            className={`btn btn-${report.color} btn-sm d-flex align-items-center gap-1 flex-grow-1`}
                                            onClick={() => downloadReport(report)}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-download"></i>
                                            Download PDF
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => viewReportData(report)}
                                            disabled={loading}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                            </div>
                        );
                    })}
                </div>

                {/* Insights and Benefits */}
                <div className="row mt-4">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">How Reports Help You</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-primary">Financial Awareness</h6>
                                    <ul className="small text-muted">
                                        <li>Track your service spending patterns</li>
                                        <li>Identify areas for budget optimization</li>
                                        <li>Monitor transaction history for accuracy</li>
                                        <li>Plan future service investments</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-success">Service Optimization</h6>
                                    <ul className="small text-muted">
                                        <li>Discover your preferred service categories</li>
                                        <li>Find your most trusted providers</li>
                                        <li>Analyze booking success rates</li>
                                        <li>Get personalized recommendations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Privacy & Security</h5>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-success small mb-3">
                                <strong>Secure Data:</strong> All reports contain only your personal data and are securely generated.
                            </div>
                            <div className="alert alert-info small mb-0">
                                <strong>Export Control:</strong> Reports are generated on-demand and not stored on our servers.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Tips */}
            <div className="card mt-4">
                <div className="card-header">
                    <h5 className="mb-0">Tips for Using Your Reports</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="text-center p-3">
                                <i className="fas fa-chart-line text-primary mb-2" style={{fontSize: '2rem'}}></i>
                                <h6>Regular Reviews</h6>
                                <p className="small text-muted mb-0">Generate monthly reports to track your service usage patterns and spending habits.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center p-3">
                                <i className="fas fa-dollar-sign text-success mb-2" style={{fontSize: '2rem'}}></i>
                                <h6>Budget Planning</h6>
                                <p className="small text-muted mb-0">Use spending analysis to set realistic budgets for different service categories.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center p-3">
                                <i className="fas fa-heart text-warning mb-2" style={{fontSize: '2rem'}}></i>
                                <h6>Better Choices</h6>
                                <p className="small text-muted mb-0">Review your preferences to make more informed decisions about future bookings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </ClientLayout>
    );
};

export default ClientReportsPage;