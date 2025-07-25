/**
 * AppointmentPDFDownloader Component
 * Reusable component for downloading appointment details as PDF across all roles
 */

import React from 'react';
import { useAppointmentPDF } from './hooks/useAppointmentPDF';

const AppointmentPDFDownloader = ({
    appointment,
    appointments = null, // For bulk download
    role = 'client',
    config = {},
    onDownload = null,
    onError = null,
    children = null,
    className = '',
    style = {},
    disabled = false,
    buttonText = null,
    iconClass = 'fas fa-download',
    variant = 'button' // 'button' | 'link' | 'custom'
}) => {
    const { downloadAppointmentPDF, downloadAppointmentsPDF } = useAppointmentPDF(role, {
        ...config,
        onDownload,
        onError
    });

    const handleSingleDownload = () => {
        if (disabled || !appointment) return;
        downloadAppointmentPDF(appointment, config);
    };

    const handleBulkDownload = () => {
        if (disabled || !appointments || appointments.length === 0) return;
        downloadAppointmentsPDF(appointments, config);
    };

    const getButtonText = () => {
        if (buttonText) return buttonText;
        
        if (appointments) {
            return `Download ${appointments.length} Appointment${appointments.length > 1 ? 's' : ''} PDF`;
        }
        
        const roleLabels = {
            client: 'Download PDF',
            provider: 'Download PDF',
            admin: 'Export as PDF',
            staff: 'Export as PDF'
        };
        
        return roleLabels[role] || 'Download PDF';
    };

    const getClassName = () => {
        if (className) return className;
        
        const baseClasses = {
            button: 'btn btn-outline-secondary',
            link: 'text-decoration-none'
        };
        
        return baseClasses[variant] || baseClasses.button;
    };

    // Custom render prop pattern
    if (children && typeof children === 'function') {
        return children({
            downloadSingle: handleSingleDownload,
            downloadBulk: handleBulkDownload,
            disabled,
            role,
            appointment,
            appointments
        });
    }

    // Custom children (render as wrapper)
    if (children) {
        return (
            <div 
                onClick={appointments ? handleBulkDownload : handleSingleDownload}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
                className={className}
            >
                {children}
            </div>
        );
    }

    // Default button rendering
    if (variant === 'button') {
        return (
            <button
                className={getClassName()}
                onClick={appointments ? handleBulkDownload : handleSingleDownload}
                disabled={disabled}
                style={style}
                type="button"
            >
                <i className={`${iconClass} me-2`}></i>
                {getButtonText()}
            </button>
        );
    }

    // Link variant
    if (variant === 'link') {
        return (
            <a
                href="#"
                className={getClassName()}
                onClick={(e) => {
                    e.preventDefault();
                    appointments ? handleBulkDownload() : handleSingleDownload();
                }}
                style={{ 
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    ...style 
                }}
            >
                <i className={`${iconClass} me-2`}></i>
                {getButtonText()}
            </a>
        );
    }

    return null;
};

// Higher-order component for easy integration
export const withAppointmentPDF = (WrappedComponent, role = 'client', config = {}) => {
    return (props) => {
        const { downloadAppointmentPDF, downloadAppointmentsPDF } = useAppointmentPDF(role, config);
        
        return (
            <WrappedComponent
                {...props}
                downloadAppointmentPDF={downloadAppointmentPDF}
                downloadAppointmentsPDF={downloadAppointmentsPDF}
                pdfRole={role}
            />
        );
    };
};

// Utility component for header integration (like existing AppointmentHeader)
export const AppointmentPDFButton = ({ 
    appointment, 
    role = 'client', 
    className = 'btn btn-outline-secondary',
    ...otherProps 
}) => {
    return (
        <AppointmentPDFDownloader
            appointment={appointment}
            role={role}
            className={className}
            iconClass="fas fa-download"
            {...otherProps}
        />
    );
};

// Bulk download component for lists
export const AppointmentsPDFButton = ({ 
    appointments, 
    role = 'client', 
    className = 'btn btn-primary',
    ...otherProps 
}) => {
    return (
        <AppointmentPDFDownloader
            appointments={appointments}
            role={role}
            className={className}
            iconClass="fas fa-file-export"
            {...otherProps}
        />
    );
};

export default AppointmentPDFDownloader;