/**
 * Example Integration for Admin/Staff PDF Functionality
 * This file shows how to integrate the AppointmentPDFDownloader in admin/staff contexts
 */

import React from 'react';
import { AppointmentPDFButton, AppointmentsPDFButton } from '../AppointmentPDFDownloader';
import { useAppointmentPDF } from '../hooks/useAppointmentPDF';

// Example: Admin Appointment Detail Page Integration
export const AdminAppointmentDetailExample = ({ appointment }) => {
    const { downloadAppointmentPDF } = useAppointmentPDF('admin', {
        sections: {
            header: true,
            appointmentInfo: true,
            serviceDetails: true,
            providerDetails: true,
            clientDetails: true, // Admin sees all details
            locationDetails: true,
            paymentInfo: true,
            notes: true,
            contact: false,
            printButtons: true
        }
    });

    return (
        <div className="admin-appointment-detail">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Appointment Management</h2>
                <div className="action-buttons">
                    <button 
                        className="btn btn-primary me-2"
                        onClick={() => downloadAppointmentPDF(appointment)}
                    >
                        <i className="fas fa-file-export me-2"></i>
                        Export PDF
                    </button>
                    {/* Other admin actions */}
                </div>
            </div>
            
            {/* Rest of admin appointment detail content */}
        </div>
    );
};

// Example: Staff Category Management with Appointment Context
export const StaffAppointmentManagementExample = ({ appointments }) => {
    const { downloadAppointmentsPDF } = useAppointmentPDF('staff', {
        primaryColor: '#6f42c1', // Custom purple for staff
        companyName: 'HireMe Staff Portal',
        sections: {
            clientDetails: true, // Staff sees client details
            notes: true, // Including admin notes
        }
    });

    return (
        <div className="staff-appointment-management">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Appointments Overview</h3>
                <AppointmentsPDFButton
                    appointments={appointments}
                    role="staff"
                    className="btn btn-outline-primary"
                    buttonText="Export All Appointments"
                />
            </div>
            
            {/* Appointments table or list */}
            <div className="appointments-table">
                {appointments.map(appointment => (
                    <div key={appointment.id} className="appointment-row">
                        <div className="appointment-info">
                            {/* Appointment details */}
                        </div>
                        <div className="appointment-actions">
                            <AppointmentPDFButton
                                appointment={appointment}
                                role="staff"
                                className="btn btn-sm btn-outline-secondary"
                                buttonText="PDF"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Example: Admin Dashboard with Bulk Export
export const AdminDashboardPDFExample = ({ recentAppointments }) => {
    return (
        <div className="admin-dashboard-appointments">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5>Recent Appointments</h5>
                    <AppointmentsPDFButton
                        appointments={recentAppointments}
                        role="admin"
                        className="btn btn-sm btn-primary"
                        config={{
                            compact: true,
                            sections: {
                                notes: true, // Include all notes for admin
                                clientDetails: true,
                                contact: false
                            }
                        }}
                    />
                </div>
                <div className="card-body">
                    {/* Dashboard appointment list */}
                </div>
            </div>
        </div>
    );
};

// Example: Custom render prop usage for complex admin interfaces
export const AdminCustomPDFExample = ({ appointment, userRole }) => {
    return (
        <AppointmentPDFDownloader
            appointment={appointment}
            role="admin"
            config={{
                onDownload: (appointment, role) => {
                    // Track admin PDF downloads
                    console.log(`Admin ${userRole} downloaded PDF for appointment ${appointment.id}`);
                },
                onError: (error) => {
                    // Handle errors specific to admin context
                    console.error('Admin PDF generation failed:', error);
                }
            }}
        >
            {({ downloadSingle, disabled }) => (
                <div className="dropdown">
                    <button 
                        className="btn btn-secondary dropdown-toggle" 
                        data-bs-toggle="dropdown"
                    >
                        Export Options
                    </button>
                    <ul className="dropdown-menu">
                        <li>
                            <button 
                                className="dropdown-item"
                                onClick={downloadSingle}
                                disabled={disabled}
                            >
                                <i className="fas fa-file-pdf me-2"></i>
                                Export as PDF
                            </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item">
                                <i className="fas fa-file-excel me-2"></i>
                                Export as Excel
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </AppointmentPDFDownloader>
    );
};

// Example: Integration in existing admin components
export const integrationInstructions = `
// To integrate in existing admin/staff pages:

// 1. Import the hook or component
import { useAppointmentPDF } from '../components/shared/hooks/useAppointmentPDF';
import { AppointmentPDFButton } from '../components/shared/AppointmentPDFDownloader';

// 2. For individual appointments:
const AdminComponent = ({ appointment }) => {
    const { downloadAppointmentPDF } = useAppointmentPDF('admin');
    
    return (
        <button onClick={() => downloadAppointmentPDF(appointment)}>
            Export PDF
        </button>
    );
};

// 3. For multiple appointments:
const StaffComponent = ({ appointments }) => {
    return (
        <AppointmentsPDFButton 
            appointments={appointments}
            role="staff"
            className="btn btn-primary"
        />
    );
};

// 4. Custom configuration:
const customConfig = {
    primaryColor: '#dc3545', // Custom brand color
    sections: {
        clientDetails: true,  // Show client info for admin/staff
        notes: true,         // Show all notes including admin notes
        contact: false       // Don't show contact section
    }
};
`;

export default {
    AdminAppointmentDetailExample,
    StaffAppointmentManagementExample,
    AdminDashboardPDFExample,
    AdminCustomPDFExample,
    integrationInstructions
};