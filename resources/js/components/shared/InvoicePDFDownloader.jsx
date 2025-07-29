/**
 * Shared Invoice PDF Downloader Component
 * Provides consistent invoice PDF download functionality across all roles
 */

import React from 'react';
import { useInvoicePDF } from './hooks/useInvoicePDF';

const InvoicePDFDownloader = ({ 
    role, 
    config = {},
    children,
    className = '',
    style = {}
}) => {
    const { downloadInvoicePDF, downloadInvoicesPDF, openInvoicePDFPreview } = useInvoicePDF(role, config);

    // If children are provided, clone them with PDF functions
    if (children) {
        return React.cloneElement(children, {
            downloadInvoicePDF,
            downloadInvoicesPDF,
            openInvoicePDFPreview,
            ...children.props
        });
    }

    // Default render - basic download buttons
    return (
        <div className={`invoice-pdf-downloader ${className}`} style={style}>
            <div className="pdf-controls">
                <span className="pdf-label">Download Options:</span>
                <div className="pdf-buttons">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {/* This would need an invoice prop */}}
                        title="Download Single Invoice"
                    >
                        <i className="fas fa-download me-1"></i>
                        PDF
                    </button>
                    <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {/* This would need an invoice prop */}}
                        title="Preview Invoice"
                    >
                        <i className="fas fa-eye me-1"></i>
                        Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

// Single Invoice Download Button Component
export const InvoiceDownloadButton = ({ 
    invoice, 
    role, 
    config = {},
    variant = 'primary',
    size = 'sm',
    showIcon = true,
    showText = true,
    className = '',
    title = 'Download Invoice PDF',
    disabled = false,
    onClick = null
}) => {
    const { downloadInvoicePDF } = useInvoicePDF(role, config);

    const handleClick = () => {
        if (onClick) {
            onClick(invoice);
        } else {
            downloadInvoicePDF(invoice);
        }
    };

    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={handleClick}
            title={title}
            disabled={disabled}
        >
            {showIcon && <i className="fas fa-download me-1"></i>}
            {showText && 'Download PDF'}
        </button>
    );
};

// Multiple Invoices Download Button Component
export const InvoicesDownloadButton = ({ 
    invoices, 
    role, 
    config = {},
    variant = 'outline-primary',
    size = 'sm',
    showIcon = true,
    showText = true,
    className = '',
    title = 'Download All Invoices PDF',
    disabled = false,
    onClick = null
}) => {
    const { downloadInvoicesPDF } = useInvoicePDF(role, config);

    const handleClick = () => {
        if (onClick) {
            onClick(invoices);
        } else {
            downloadInvoicesPDF(invoices);
        }
    };

    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={handleClick}
            title={title}
            disabled={disabled || !invoices || invoices.length === 0}
        >
            {showIcon && <i className="fas fa-download me-1"></i>}
            {showText && `Download ${invoices?.length || 0} PDFs`}
        </button>
    );
};

// Preview Button Component
export const InvoicePreviewButton = ({ 
    invoice, 
    role, 
    config = {},
    variant = 'outline-secondary',
    size = 'sm',
    showIcon = true,
    showText = true,
    className = '',
    title = 'Preview Invoice PDF',
    disabled = false,
    onClick = null
}) => {
    const { openInvoicePDFPreview } = useInvoicePDF(role, config);

    const handleClick = () => {
        if (onClick) {
            onClick(invoice);
        } else {
            openInvoicePDFPreview(invoice);
        }
    };

    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            onClick={handleClick}
            title={title}
            disabled={disabled}
        >
            {showIcon && <i className="fas fa-eye me-1"></i>}
            {showText && 'Preview'}
        </button>
    );
};

// Dropdown Menu Component for PDF Actions
export const InvoicePDFDropdown = ({ 
    invoice, 
    invoices = [], 
    role, 
    config = {},
    className = '',
    dropdownId = 'invoicePDFDropdown'
}) => {
    const { downloadInvoicePDF, downloadInvoicesPDF, openInvoicePDFPreview } = useInvoicePDF(role, config);

    return (
        <div className={`dropdown ${className}`}>
            <button
                className="btn btn-outline-primary btn-sm dropdown-toggle"
                type="button"
                id={dropdownId}
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="fas fa-file-pdf me-1"></i>
                PDF Options
            </button>
            <ul className="dropdown-menu" aria-labelledby={dropdownId}>
                {invoice && (
                    <>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => downloadInvoicePDF(invoice)}
                            >
                                <i className="fas fa-download me-2"></i>
                                Download Invoice
                            </button>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => openInvoicePDFPreview(invoice)}
                            >
                                <i className="fas fa-eye me-2"></i>
                                Preview Invoice
                            </button>
                        </li>
                    </>
                )}
                {invoices.length > 1 && (
                    <>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => downloadInvoicesPDF(invoices)}
                            >
                                <i className="fas fa-download me-2"></i>
                                Download All ({invoices.length})
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
};

// Inline PDF Controls Component
export const InlinePDFControls = ({ 
    invoice, 
    invoices = [], 
    role, 
    config = {},
    showDownload = true,
    showPreview = true,
    showDownloadAll = true,
    className = ''
}) => {
    const { downloadInvoicePDF, downloadInvoicesPDF, openInvoicePDFPreview } = useInvoicePDF(role, config);

    return (
        <div className={`d-flex gap-2 align-items-center ${className}`}>
            {invoice && showDownload && (
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => downloadInvoicePDF(invoice)}
                    title="Download Invoice PDF"
                >
                    <i className="fas fa-download"></i>
                </button>
            )}
            {invoice && showPreview && (
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => openInvoicePDFPreview(invoice)}
                    title="Preview Invoice PDF"
                >
                    <i className="fas fa-eye"></i>
                </button>
            )}
            {invoices.length > 1 && showDownloadAll && (
                <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => downloadInvoicesPDF(invoices)}
                    title={`Download All ${invoices.length} Invoices`}
                >
                    <i className="fas fa-download me-1"></i>
                    All ({invoices.length})
                </button>
            )}
        </div>
    );
};

export default InvoicePDFDownloader;