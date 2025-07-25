/**
 * useAppointmentPDF Hook
 * Provides programmatic access to appointment PDF generation
 */

import { getPDFStyles } from '../utils/pdfStyles';
import {
    generatePDFHeader,
    generateAppointmentInfoSection,
    generateServiceDetailsSection,
    generateProviderDetailsSection,
    generateClientDetailsSection,
    generateLocationDetailsSection,
    generatePaymentSection,
    generateNotesSection,
    generateContactSection,
    generatePrintButtons
} from '../utils/pdfTemplates';

export const useAppointmentPDF = (role = 'client', config = {}) => {
    const defaultConfig = {
        primaryColor: '#007bff',
        companyName: 'HireMe',
        compact: true,
        pageSize: 'A4',
        margins: '0.5in',
        sections: {
            header: true,
            appointmentInfo: true,
            serviceDetails: true,
            providerDetails: true,
            clientDetails: role === 'provider' || role === 'admin' || role === 'staff',
            locationDetails: true,
            paymentInfo: true,
            notes: true,
            contact: role === 'client',
            printButtons: true
        },
        ...config
    };

    const downloadAppointmentPDF = (appointment, customConfig = {}) => {
        if (!appointment) {
            console.error('Appointment data is required for PDF generation');
            return;
        }

        const finalConfig = { ...defaultConfig, ...customConfig };
        const { sections } = finalConfig;

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                console.error('Unable to open print window. Please check popup blocker settings.');
                return;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Appointment Details - ${appointment.id}</title>
                    <style>
                        ${getPDFStyles(finalConfig)}
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        ${sections.header ? generatePDFHeader(appointment, role, finalConfig) : ''}
                        
                        <div class="main-content">
                            <div class="content-grid">
                                ${sections.appointmentInfo ? generateAppointmentInfoSection(appointment, role) : ''}
                                ${sections.serviceDetails ? generateServiceDetailsSection(appointment) : ''}
                                ${sections.providerDetails ? generateProviderDetailsSection(appointment, role) : ''}
                                ${sections.clientDetails ? generateClientDetailsSection(appointment, role) : ''}
                                ${sections.locationDetails ? generateLocationDetailsSection(appointment) : ''}
                            </div>

                            ${sections.paymentInfo ? generatePaymentSection(appointment, role) : ''}
                            ${sections.notes ? generateNotesSection(appointment, role) : ''}
                            ${sections.contact ? generateContactSection(appointment, role) : ''}
                        </div>

                        ${sections.printButtons ? generatePrintButtons() : ''}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Optional callback for tracking
            if (finalConfig.onDownload) {
                finalConfig.onDownload(appointment, role);
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    const downloadAppointmentsPDF = (appointments, customConfig = {}) => {
        if (!appointments || appointments.length === 0) {
            console.error('Appointments data is required for PDF generation');
            return;
        }

        const finalConfig = { ...defaultConfig, ...customConfig };

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                console.error('Unable to open print window. Please check popup blocker settings.');
                return;
            }

            const appointmentSections = appointments.map(appointment => `
                <div style="page-break-after: always;">
                    ${generatePDFHeader(appointment, role, finalConfig)}
                    <div class="main-content">
                        <div class="content-grid">
                            ${generateAppointmentInfoSection(appointment, role)}
                            ${generateServiceDetailsSection(appointment)}
                            ${generateProviderDetailsSection(appointment, role)}
                            ${finalConfig.sections.clientDetails ? generateClientDetailsSection(appointment, role) : ''}
                            ${generateLocationDetailsSection(appointment)}
                        </div>
                        ${generatePaymentSection(appointment, role)}
                        ${generateNotesSection(appointment, role)}
                        ${finalConfig.sections.contact ? generateContactSection(appointment, role) : ''}
                    </div>
                </div>
            `).join('');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Appointments List - ${appointments.length} Items</title>
                    <style>
                        ${getPDFStyles(finalConfig)}
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        <div class="header">
                            <h1>Appointments List</h1>
                            <div>${appointments.length} Appointment${appointments.length > 1 ? 's' : ''} | ${role.charAt(0).toUpperCase() + role.slice(1)} View</div>
                        </div>
                        
                        <div class="meta">
                            Generated on: ${new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })} | ${finalConfig.companyName}
                        </div>

                        ${appointmentSections}

                        ${generatePrintButtons()}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            if (finalConfig.onDownload) {
                finalConfig.onDownload(appointments, role);
            }

        } catch (error) {
            console.error('Error generating appointments PDF:', error);
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    return {
        downloadAppointmentPDF,
        downloadAppointmentsPDF,
        role,
        config: defaultConfig
    };
};