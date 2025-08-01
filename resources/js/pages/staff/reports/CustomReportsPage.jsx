import React, { useState, useEffect } from "react";
import StaffLayout from "../../../components/layouts/StaffLayout";

// Filter Value Input Component
const FilterValueInput = ({ field, fieldConfig, value, dataSource, onChange, fetchFieldOptions }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (fieldConfig?.type === 'enum' && fieldConfig.options) {
            setOptions(fieldConfig.options.map(option => ({
                value: option,
                label: option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')
            })));
        } else if (field && (field.includes('category') || field.includes('_name'))) {
            setLoading(true);
            fetchFieldOptions(dataSource, field).then(opts => {
                setOptions(opts);
                setLoading(false);
            });
        }
    }, [field, fieldConfig, dataSource]);

    if (fieldConfig?.type === 'enum' || field?.includes('category') || field?.includes('_name')) {
        return (
            <select
                className="form-select form-select-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading}
            >
                <option value="">Select Value</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    } else if (fieldConfig?.type === 'boolean') {
        return (
            <select
                className="form-select form-select-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select Value</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
            </select>
        );
    } else {
        return (
            <input
                type={fieldConfig?.type === 'date' ? 'date' : fieldConfig?.type === 'datetime' ? 'datetime-local' : 'text'}
                className="form-control form-control-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter value"
            />
        );
    }
};

const CustomReportsPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dataSources, setDataSources] = useState({});
    const [reportData, setReportData] = useState({
        dataSource: '',
        selectedFields: [],
        filters: [],
        sorting: [{ field: 'created_at', direction: 'desc' }], // Default sorting
        pagination: { page: 1, per_page: 50 }
    });
    const [reportResults, setReportResults] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [fieldOptions, setFieldOptions] = useState({});

    const steps = [
        { number: 1, title: "Data Source", description: "Choose what data to report on" },
        { number: 2, title: "Fields", description: "Select which columns to include" },  
        { number: 3, title: "Filters", description: "Apply filters to narrow results" },
        { number: 4, title: "Sorting", description: "Configure result ordering" },
        { number: 5, title: "Preview", description: "Review and generate report" }
    ];

    useEffect(() => {
        fetchDataSources();
    }, []);

    const fetchDataSources = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/staff/reports/data-sources', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data sources: ${response.status}`);
            }

            const data = await response.json();
            setDataSources(data.data);
        } catch (error) {
            console.error('Error fetching data sources:', error);
            alert(`Failed to load data sources: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDataSourceChange = (sourceKey) => {
        const source = dataSources[sourceKey];
        setReportData({
            ...reportData,
            dataSource: sourceKey,
            selectedFields: source ? source.default_fields : [],
            filters: [],
            sorting: []
        });
    };

    const handleFieldToggle = (fieldKey) => {
        const newSelectedFields = reportData.selectedFields.includes(fieldKey)
            ? reportData.selectedFields.filter(f => f !== fieldKey)
            : [...reportData.selectedFields, fieldKey];
        
        setReportData({
            ...reportData,
            selectedFields: newSelectedFields
        });
    };

    const addFilter = () => {
        setReportData({
            ...reportData,
            filters: [
                ...reportData.filters,
                { field: '', operator: 'equals', value: '' }
            ]
        });
    };

    const updateFilter = (index, field, value) => {
        const newFilters = [...reportData.filters];
        newFilters[index][field] = value;
        setReportData({
            ...reportData,
            filters: newFilters
        });
    };

    const removeFilter = (index) => {
        setReportData({
            ...reportData,
            filters: reportData.filters.filter((_, i) => i !== index)
        });
    };

    const addSortRule = () => {
        setReportData({
            ...reportData,
            sorting: [
                ...reportData.sorting,
                { field: '', direction: 'asc' }
            ]
        });
    };

    const updateSortRule = (index, field, value) => {
        const newSorting = [...reportData.sorting];
        newSorting[index][field] = value;
        setReportData({
            ...reportData,
            sorting: newSorting
        });
    };

    const removeSortRule = (index) => {
        setReportData({
            ...reportData,
            sorting: reportData.sorting.filter((_, i) => i !== index)
        });
    };

    const generatePreview = async () => {
        if (!reportData.dataSource || reportData.selectedFields.length === 0) {
            alert('Please select a data source and at least one field');
            return;
        }

        setPreviewLoading(true);
        try {
            const response = await fetch('/api/staff/reports/custom', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    data_source: reportData.dataSource,
                    fields: reportData.selectedFields,
                    filters: reportData.filters.filter(f => f.field && f.operator),
                    sorting: reportData.sorting,
                    pagination: { page: 1, per_page: 50 }
                })
            });

            if (!response.ok) {
                let errorMessage = `Failed to generate report: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error && typeof errorData.error === 'object') {
                        errorMessage = `${errorData.message}: ${errorData.error.message} (Line: ${errorData.error.line})`;
                    } else {
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch (e) {
                    // If we can't parse the error response, use the status
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setReportResults(data.data);
        } catch (error) {
            console.error('Error generating report:', error);
            alert(`Failed to generate report: ${error.message}`);
        } finally {
            setPreviewLoading(false);
        }
    };

    const exportToPdf = () => {
        if (!reportResults) {
            alert('No report data to export. Please generate a preview first.');
            return;
        }

        const currentSource = dataSources[reportData.dataSource];
        
        // Create a more controlled PDF export experience
        const printContent = `
            <html>
                <head>
                    <title>Custom Report - ${currentSource?.display_name || 'Report'}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.4;
                        }
                        h1 { 
                            color: #333; 
                            border-bottom: 2px solid #007bff; 
                            padding-bottom: 10px; 
                            margin-bottom: 20px;
                        }
                        .meta { 
                            background: #f8f9fa; 
                            padding: 15px; 
                            margin: 20px 0; 
                            border-radius: 5px; 
                            border: 1px solid #dee2e6;
                        }
                        .meta-item { margin-bottom: 8px; }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 20px; 
                            font-size: 12px;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 6px 8px; 
                            text-align: left; 
                            vertical-align: top;
                            word-wrap: break-word;
                        }
                        th { 
                            background-color: #f8f9fa; 
                            font-weight: bold; 
                            font-size: 11px;
                            text-transform: uppercase;
                        }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .pagination { 
                            margin-top: 20px; 
                            font-style: italic; 
                            color: #666;
                            border-top: 1px solid #dee2e6;
                            padding-top: 15px;
                        }
                        .controls {
                            margin: 20px 0;
                            padding: 15px;
                            background: #e3f2fd;
                            border-radius: 5px;
                            text-align: center;
                        }
                        .btn {
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            margin: 0 10px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        .btn:hover { background: #0056b3; }
                        .btn-secondary { background: #6c757d; }
                        .btn-secondary:hover { background: #545b62; }
                    </style>
                </head>
                <body>
                    <div class="controls no-print">
                        <p><strong>Report Preview</strong> - Choose your action:</p>
                        <button class="btn" onclick="window.print();">Print / Save as PDF</button>
                        <button class="btn btn-secondary" onclick="window.close();">Close Preview</button>
                    </div>
                    
                    <h1>Custom Report: ${currentSource?.display_name || 'Report'}</h1>
                    <div class="meta">
                        <div class="meta-item"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                        <div class="meta-item"><strong>Data Source:</strong> ${currentSource?.display_name}</div>
                        <div class="meta-item"><strong>Total Records:</strong> ${reportResults.pagination.total}</div>
                        <div class="meta-item"><strong>Filters Applied:</strong> ${reportResults.meta.filters_applied}</div>
                        <div class="meta-item"><strong>Fields Included:</strong> ${reportData.selectedFields.length}</div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                ${reportData.selectedFields.map(field => {
                                    const fieldConfig = currentSource.fields[field];
                                    return `<th>${fieldConfig?.label || field}<br><small style="font-weight: normal; color: #666;">(${fieldConfig?.type || 'unknown'})</small></th>`;
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${reportResults.results.map(row => `
                                <tr>
                                    ${reportData.selectedFields.map(field => 
                                        `<td>${row[field] !== null && row[field] !== undefined ? row[field] : '-'}</td>`
                                    ).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="pagination">
                        <strong>Report Summary:</strong> Showing ${reportResults.pagination.from} to ${reportResults.pagination.to} of ${reportResults.pagination.total} total records
                        ${reportResults.pagination.total > reportResults.pagination.per_page ? 
                            `<br><em>Note: This report shows the first ${reportResults.pagination.per_page} records. To see all records, adjust pagination settings.</em>` : 
                            ''
                        }
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #dee2e6; padding-top: 15px;">
                        Generated by HireMe Staff Portal - Custom Reports System
                    </div>
                </body>
            </html>
        `;

        // Open in a new window with proper sizing
        const printWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
        
        if (!printWindow) {
            alert('Pop-up blocked. Please allow pop-ups for this site to export reports.');
            return;
        }

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Don't auto-trigger print - let user decide
        console.log('Report preview opened in new window');
    };

    const downloadReportAsCSV = () => {
        if (!reportResults) {
            alert('No report data to export. Please generate a preview first.');
            return;
        }

        const currentSource = dataSources[reportData.dataSource];
        
        // Prepare CSV content
        const headers = reportData.selectedFields.map(field => {
            const fieldConfig = currentSource.fields[field];
            return fieldConfig?.label || field;
        });
        
        const csvContent = [
            // Header row
            headers.join(','),
            // Data rows
            ...reportResults.results.map(row => 
                reportData.selectedFields.map(field => {
                    const value = row[field];
                    // Handle values that might contain commas by wrapping in quotes
                    if (value === null || value === undefined) return '""';
                    
                    let stringValue;
                    if (typeof value === 'object') {
                        stringValue = JSON.stringify(value);
                    } else if (typeof value === 'boolean') {
                        stringValue = value ? 'Yes' : 'No';
                    } else {
                        stringValue = String(value);
                    }
                    
                    return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') 
                        ? `"${stringValue.replace(/"/g, '""')}"` 
                        : stringValue;
                }).join(',')
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `custom-report-${currentSource?.display_name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('CSV report downloaded');
    };

    const testSimpleReport = async () => {
        try {
            const response = await fetch('/api/staff/reports/test', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`Test failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('Test results:', data);
            alert('Test successful! Check console for details.');
        } catch (error) {
            console.error('Test error:', error);
            alert(`Test failed: ${error.message}`);
        }
    };

    const fetchFieldOptions = async (dataSource, field) => {
        const cacheKey = `${dataSource}_${field}`;
        if (fieldOptions[cacheKey]) {
            return fieldOptions[cacheKey];
        }

        try {
            const response = await fetch(`/api/staff/reports/field-options?data_source=${dataSource}&field=${field}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch field options: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the options
            setFieldOptions(prev => ({
                ...prev,
                [cacheKey]: data.data.options
            }));

            return data.data.options;
        } catch (error) {
            console.error('Error fetching field options:', error);
            return [];
        }
    };

    const getOperatorOptions = (fieldType) => {
        const baseOptions = [
            { value: 'equals', label: 'Equals' },
            { value: 'not_equals', label: 'Not Equals' }
        ];

        switch (fieldType) {
            case 'string':
            case 'text':
                return [
                    ...baseOptions,
                    { value: 'contains', label: 'Contains' },
                    { value: 'not_contains', label: 'Does Not Contain' },
                    { value: 'starts_with', label: 'Starts With' },
                    { value: 'ends_with', label: 'Ends With' }
                ];
            case 'integer':
            case 'decimal':
                return [
                    ...baseOptions,
                    { value: 'greater_than', label: 'Greater Than' },
                    { value: 'less_than', label: 'Less Than' },
                    { value: 'between', label: 'Between' }
                ];
            case 'date':
            case 'datetime':
                return [
                    ...baseOptions,
                    { value: 'greater_than', label: 'After' },
                    { value: 'less_than', label: 'Before' },
                    { value: 'between', label: 'Between' }
                ];
            case 'enum':
                return [
                    { value: 'equals', label: 'Equals' },
                    { value: 'not_equals', label: 'Not Equals' },
                    { value: 'in', label: 'In List' },
                    { value: 'not_in', label: 'Not In List' }
                ];
            case 'boolean':
                return [
                    { value: 'equals', label: 'Equals' }
                ];
            default:
                return baseOptions;
        }
    };

    const renderStepContent = () => {
        const currentSource = reportData.dataSource ? dataSources[reportData.dataSource] : null;

        switch (currentStep) {
            case 1:
                return (
                    <div className="step-content">
                        <h4 className="mb-4">Choose Data Source</h4>
                        <p className="text-muted mb-4">Select the type of data you want to create a report for:</p>
                        
                        <div className="row">
                            {Object.entries(dataSources).map(([key, source]) => (
                                <div key={key} className="col-md-6 col-lg-4 mb-3">
                                    <div 
                                        className={`card h-100 cursor-pointer border-2 ${
                                            reportData.dataSource === key ? 'border-primary bg-light' : 'border-light'
                                        }`}
                                        onClick={() => handleDataSourceChange(key)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card-body text-center">
                                            <i className={`${source.icon} fa-2x mb-3 ${
                                                reportData.dataSource === key ? 'text-primary' : 'text-muted'
                                            }`}></i>
                                            <h6 className="card-title">{source.display_name}</h6>
                                            <p className="card-text small text-muted">{source.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                if (!currentSource) return <div>Please select a data source first.</div>;
                
                return (
                    <div className="step-content">
                        <h4 className="mb-4">Select Fields</h4>
                        <p className="text-muted mb-4">Choose which columns to include in your report:</p>
                        
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">Available Fields</h6>
                                    </div>
                                    <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {Object.entries(currentSource.fields).map(([fieldKey, fieldConfig]) => (
                                            <div key={fieldKey} className="form-check mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`field-${fieldKey}`}
                                                    checked={reportData.selectedFields.includes(fieldKey)}
                                                    onChange={() => handleFieldToggle(fieldKey)}
                                                />
                                                <label className="form-check-label d-flex justify-content-between align-items-center w-100" htmlFor={`field-${fieldKey}`}>
                                                    <span>
                                                        <strong>{fieldConfig.label}</strong>
                                                        <small className="text-muted d-block">{fieldKey}</small>
                                                    </span>
                                                    <span className="badge bg-secondary">{fieldConfig.type}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">Selected Fields ({reportData.selectedFields.length})</h6>
                                    </div>
                                    <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {reportData.selectedFields.length === 0 ? (
                                            <p className="text-muted">No fields selected</p>
                                        ) : (
                                            reportData.selectedFields.map((fieldKey, index) => {
                                                const fieldConfig = currentSource.fields[fieldKey];
                                                return (
                                                    <div key={fieldKey} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                                        <span>
                                                            <strong>{fieldConfig?.label || fieldKey}</strong>
                                                            <small className="text-muted d-block">{fieldConfig?.type}</small>
                                                        </span>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleFieldToggle(fieldKey)}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                if (!currentSource) return <div>Please select a data source first.</div>;
                
                return (
                    <div className="step-content">
                        <h4 className="mb-4">Apply Filters</h4>
                        <p className="text-muted mb-4">Add filters to narrow down your report results:</p>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6>Filters ({reportData.filters.length})</h6>
                            <button className="btn btn-outline-primary btn-sm" onClick={addFilter}>
                                <i className="fas fa-plus me-1"></i>Add Filter
                            </button>
                        </div>

                        {reportData.filters.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                No filters applied. Your report will include all records.
                            </div>
                        ) : (
                            <div className="filters-list">
                                {reportData.filters.map((filter, index) => {
                                    const selectedField = currentSource.fields[filter.field];
                                    return (
                                        <div key={index} className="card mb-3">
                                            <div className="card-body">
                                                <div className="row align-items-center">
                                                    <div className="col-md-3">
                                                        <label className="form-label small">Field</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={filter.field}
                                                            onChange={(e) => updateFilter(index, 'field', e.target.value)}
                                                        >
                                                            <option value="">Select Field</option>
                                                            {Object.entries(currentSource.fields).map(([fieldKey, fieldConfig]) => (
                                                                <option key={fieldKey} value={fieldKey}>
                                                                    {fieldConfig.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label small">Operator</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={filter.operator}
                                                            onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                                                            disabled={!filter.field}
                                                        >
                                                            {selectedField && getOperatorOptions(selectedField.type).map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label className="form-label small">Value</label>
                                                        <FilterValueInput
                                                            field={filter.field}
                                                            fieldConfig={selectedField}
                                                            value={filter.value}
                                                            dataSource={reportData.dataSource}
                                                            onChange={(value) => updateFilter(index, 'value', value)}
                                                            fetchFieldOptions={fetchFieldOptions}
                                                        />
                                                    </div>
                                                    <div className="col-md-1">
                                                        <label className="form-label small">&nbsp;</label>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm d-block"
                                                            onClick={() => removeFilter(index)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 4:
                if (!currentSource) return <div>Please select a data source first.</div>;
                
                return (
                    <div className="step-content">
                        <h4 className="mb-4">Configure Sorting</h4>
                        <p className="text-muted mb-4">Set the order for your report results (optional):</p>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6>Sort Rules ({reportData.sorting.length})</h6>
                            <button className="btn btn-outline-primary btn-sm" onClick={addSortRule}>
                                <i className="fas fa-plus me-1"></i>Add Sort Rule
                            </button>
                        </div>

                        {reportData.sorting.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                No sorting applied. Results will use default ordering.
                            </div>
                        ) : (
                            <div className="sort-rules-list">
                                {reportData.sorting.map((sortRule, index) => (
                                    <div key={index} className="card mb-3">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-md-1">
                                                    <label className="form-label small">Order</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm text-center"
                                                        value={index + 1}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="col-md-5">
                                                    <label className="form-label small">Field</label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={sortRule.field}
                                                        onChange={(e) => updateSortRule(index, 'field', e.target.value)}
                                                    >
                                                        <option value="">Select Field</option>
                                                        {reportData.selectedFields.map(fieldKey => {
                                                            const fieldConfig = currentSource.fields[fieldKey];
                                                            return (
                                                                <option key={fieldKey} value={fieldKey}>
                                                                    {fieldConfig?.label || fieldKey}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small">Direction</label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={sortRule.direction}
                                                        onChange={(e) => updateSortRule(index, 'direction', e.target.value)}
                                                    >
                                                        <option value="asc">Ascending (A-Z, 1-9, Oldest First)</option>
                                                        <option value="desc">Descending (Z-A, 9-1, Newest First)</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label small">&nbsp;</label>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm d-block"
                                                        onClick={() => removeSortRule(index)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="alert alert-light mt-4">
                            <h6><i className="fas fa-lightbulb me-2"></i>Sorting Tips:</h6>
                            <ul className="mb-0">
                                <li><strong>Multiple Rules:</strong> Results are sorted by the first rule, then by the second rule for ties, etc.</li>
                                <li><strong>Performance:</strong> Sorting by indexed fields (ID, created_at) is faster</li>
                                <li><strong>Default:</strong> If no sorting is specified, results are ordered by creation date (newest first)</li>
                            </ul>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="step-content">
                        <h4 className="mb-4">Preview & Generate Report</h4>
                        
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">Report Configuration</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <strong>Data Source:</strong> {currentSource?.display_name}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Fields Selected:</strong> {reportData.selectedFields.length}
                                            <div className="small text-muted">
                                                {reportData.selectedFields.map(field => currentSource?.fields[field]?.label).join(', ')}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Filters Applied:</strong> {reportData.filters.filter(f => f.field && f.operator).length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header">
                                        <h6 className="mb-0">Actions</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-primary"
                                                onClick={generatePreview}
                                                disabled={previewLoading || !reportData.dataSource || reportData.selectedFields.length === 0}
                                            >
                                                {previewLoading ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin me-1"></i>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-eye me-1"></i>
                                                        Generate Preview
                                                    </>
                                                )}
                                            </button>
                                            
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={exportToPdf}
                                                    disabled={!reportResults}
                                                >
                                                    <i className="fas fa-file-pdf me-1"></i>
                                                    PDF Preview
                                                </button>
                                                <button
                                                    className="btn btn-outline-success"
                                                    onClick={downloadReportAsCSV}
                                                    disabled={!reportResults}
                                                >
                                                    <i className="fas fa-file-csv me-1"></i>
                                                    Download CSV
                                                </button>
                                            </div>
                                            
                                            {reportResults && (
                                                <small className="text-muted mt-2">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    PDF Preview opens in a new window where you can print or save. 
                                                    CSV Download saves directly to your computer.
                                                </small>
                                            )}

                                            <hr className="my-3" />
                                            
                                            <button
                                                className="btn btn-outline-info btn-sm"
                                                onClick={testSimpleReport}
                                                type="button"
                                            >
                                                <i className="fas fa-bug me-1"></i>
                                                Test Backend Connection
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Results Table */}
                        {reportResults && (
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Report Results</h6>
                                    <small className="text-muted">
                                        Showing {reportResults.pagination.from} to {reportResults.pagination.to} of {reportResults.pagination.total} records
                                    </small>
                                </div>
                                <div className="card-body p-0">
                                    <div 
                                        className="table-responsive" 
                                        style={{ 
                                            maxHeight: '600px', 
                                            overflowY: 'auto',
                                            overflowX: 'auto',
                                            width: '100%'
                                        }}
                                    >
                                        <table className="table table-striped table-hover mb-0" style={{ minWidth: 'max-content' }}>
                                            <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                                <tr>
                                                    {reportData.selectedFields.map(field => {
                                                        const fieldConfig = currentSource?.fields[field];
                                                        return (
                                                            <th key={field} style={{ 
                                                                minWidth: '150px', 
                                                                whiteSpace: 'nowrap',
                                                                padding: '12px 8px'
                                                            }}>
                                                                <div className="d-flex flex-column">
                                                                    <span className="fw-bold text-white">{fieldConfig?.label || field}</span>
                                                                    <small className="text-light opacity-75">
                                                                        {fieldConfig?.type}
                                                                    </small>
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportResults.results.map((row, index) => (
                                                    <tr key={index}>
                                                        {reportData.selectedFields.map(field => {
                                                            const value = row[field];
                                                            let displayValue = '-';
                                                            
                                                            if (value !== null && value !== undefined) {
                                                                if (typeof value === 'object') {
                                                                    // Handle object values (shouldn't happen with proper backend formatting, but just in case)
                                                                    displayValue = JSON.stringify(value);
                                                                } else if (typeof value === 'boolean') {
                                                                    displayValue = value ? 'Yes' : 'No';
                                                                } else {
                                                                    displayValue = String(value);
                                                                }
                                                            }
                                                            
                                                            return (
                                                                <td key={field} style={{ 
                                                                    minWidth: '150px',
                                                                    maxWidth: '250px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    padding: '8px'
                                                                }} title={displayValue}>
                                                                    {displayValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Responsive help text */}
                                    <div className="px-3 py-2 bg-light border-top">
                                        <small className="text-muted d-flex align-items-center justify-content-between flex-wrap">
                                            <span>
                                                <i className="fas fa-arrows-alt me-1"></i>
                                                <strong>Navigation:</strong> Use scrollbars or arrow keys to navigate. Hover over cells to see full content.
                                            </span>
                                            {reportData.selectedFields.length > 8 && (
                                                <span className="badge bg-info">
                                                    <i className="fas fa-expand-arrows-alt me-1"></i>
                                                    Wide table - scroll horizontally
                                                </span>
                                            )}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return <div>Invalid step</div>;
        }
    };

    if (loading) {
        return (
            <StaffLayout>
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                    <div className="text-center">
                        <div className="spinner-border mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Loading custom reports system...</p>
                    </div>
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout>
            <div className="page-content">
                <div className="page-header mb-4">
                    <h1 className="page-title">Custom Reports</h1>
                    <p className="page-subtitle">Create custom reports from any data in the system</p>
                </div>

                {/* Progress Steps */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            {steps.map((step, index) => (
                                <div key={step.number} className="col-md-3">
                                    <div className="d-flex align-items-center">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                            currentStep === step.number ? 'bg-primary text-white' :
                                            currentStep > step.number ? 'bg-success text-white' : 'bg-light text-muted'
                                        }`} style={{width: '40px', height: '40px'}}>
                                            {currentStep > step.number ? (
                                                <i className="fas fa-check"></i>
                                            ) : (
                                                step.number
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className={`mb-0 ${currentStep === step.number ? 'text-primary' : ''}`}>
                                                {step.title}
                                            </h6>
                                            <small className="text-muted">{step.description}</small>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="ms-3">
                                                <i className="fas fa-chevron-right text-muted"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="card">
                    <div className="card-body">
                        {renderStepContent()}
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                        >
                            <i className="fas fa-arrow-left me-1"></i>Previous
                        </button>
                        
                        {currentStep < 5 ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    // Validation for each step
                                    if (currentStep === 1 && !reportData.dataSource) {
                                        alert('Please select a data source');
                                        return;
                                    }
                                    if (currentStep === 2 && reportData.selectedFields.length === 0) {
                                        alert('Please select at least one field');
                                        return;
                                    }
                                    setCurrentStep(Math.min(5, currentStep + 1));
                                }}
                            >
                                Next<i className="fas fa-arrow-right ms-1"></i>
                            </button>
                        ) : (
                            <button className="btn btn-success" disabled>
                                <i className="fas fa-check me-1"></i>Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
};

export default CustomReportsPage;