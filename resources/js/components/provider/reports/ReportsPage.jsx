import React, { useState } from 'react';
import ProviderLayout from '../../layouts/ProviderLayout';

const ProviderReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const reportTypes = [
        {
            id: 'business-performance',
            title: 'Business Performance',
            description: 'Comprehensive overview of your business metrics, earnings, and customer satisfaction',
            icon: 'fas fa-trending-up',
            color: 'primary',
            endpoint: '/api/provider/reports/business-performance',
            priority: 'High'
        },
        {
            id: 'financial-earnings',
            title: 'Financial & Earnings Report',
            description: 'Detailed breakdown of your earnings, payments received, and financial analytics',
            icon: 'fas fa-dollar-sign',
            color: 'success',
            endpoint: '/api/provider/reports/financial-earnings',
            priority: 'High'
        },
        {
            id: 'customer-relationship',
            title: 'Customer Relationship Report',
            description: 'Analysis of your client base, repeat customers, and relationship metrics',
            icon: 'fas fa-users',
            color: 'info',
            endpoint: '/api/provider/reports/customer-relationship',
            priority: 'Medium'
        },
        {
            id: 'service-performance',
            title: 'Service Performance Analysis',
            description: 'Performance metrics for your individual services and booking trends',
            icon: 'fas fa-chart-bar',
            color: 'warning',
            endpoint: '/api/provider/reports/service-performance',
            priority: 'Medium'
        },
        {
            id: 'marketing-analytics',
            title: 'Marketing & Visibility Analytics',
            description: 'Track your service visibility, conversion rates, and marketing effectiveness',
            icon: 'fas fa-bullseye',
            color: 'secondary',
            endpoint: '/api/provider/reports/marketing-analytics',
            priority: 'Low'
        }
    ];

    const quickFilters = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 },
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
                throw new Error('Failed to download report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${reportType.id}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report. Please try again.');
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

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'High': return 'badge bg-danger';
            case 'Medium': return 'badge bg-warning';
            case 'Low': return 'badge bg-secondary';
            default: return 'badge bg-secondary';
        }
    };

    return (
        <ProviderLayout>
            <div className="page-content">
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">Business Reports & Analytics</h1>
                        <p className="page-subtitle">Track your business performance and generate professional reports</p>
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
                    </div>
                </div>
            </div>

                {/* Report Cards */}
                <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                    {reportTypes.map((report) => (
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
                                            <span className={`${getPriorityBadgeClass(report.priority)} ms-2`}>
                                                {report.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted small mb-3 flex-grow-1">
                                    {report.description}
                                </p>

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
                    ))}
                </div>
            </div>
        </ProviderLayout>
    );
};

export default ProviderReportsPage;