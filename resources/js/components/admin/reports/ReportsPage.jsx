import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

const AdminReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const reportTypes = [
        {
            id: 'platform-analytics',
            title: 'Platform Analytics',
            description: 'Comprehensive overview of platform performance, user engagement, and growth metrics',
            icon: 'fas fa-chart-bar',
            color: 'primary',
            endpoint: '/api/admin/reports/platform-analytics',
            priority: 'High'
        },
        {
            id: 'user-management',
            title: 'User Management Report',
            description: 'Detailed analysis of user registrations, roles, and account activity patterns',
            icon: 'fas fa-users',
            color: 'info',
            endpoint: '/api/admin/reports/user-management',
            priority: 'Medium'
        },
        {
            id: 'financial-performance',
            title: 'Financial Performance',
            description: 'Revenue analysis, transaction trends, and financial health indicators',
            icon: 'fas fa-dollar-sign',
            color: 'success',
            endpoint: '/api/admin/reports/financial-performance',
            priority: 'High'
        },
        {
            id: 'service-analytics',
            title: 'Service Category Analytics',
            description: 'Performance metrics for different service categories and booking trends',
            icon: 'fas fa-trending-up',
            color: 'warning',
            endpoint: '/api/admin/reports/service-analytics',
            priority: 'Medium'
        },
        {
            id: 'provider-performance',
            title: 'Provider Performance Overview',
            description: 'Top-performing providers, ratings analysis, and service quality metrics',
            icon: 'fas fa-file-text',
            color: 'secondary',
            endpoint: '/api/admin/reports/provider-performance',
            priority: 'Medium'
        }
    ];

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
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
        <AdminLayout>
            <div className="page-content">
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">Reports & Analytics</h1>
                        <p className="page-subtitle">Generate comprehensive platform reports and analytics</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section mb-6">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Report Period</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
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
                                            <span className={getPriorityBadgeClass(report.priority)}>
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
        </AdminLayout>
    );
};

export default AdminReportsPage;