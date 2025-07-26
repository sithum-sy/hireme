# Appointment PDF Download System

A reusable, role-based PDF generation system for appointment details across all user roles in the HireMe application.

## Overview

This system provides a unified approach to generating appointment PDFs with role-specific content and styling. It supports all user roles (client, provider, admin, staff) with customizable sections and branding.

## Components

### Core Files

- **`hooks/useAppointmentPDF.js`** - Main hook for programmatic PDF generation
- **`AppointmentPDFDownloader.jsx`** - Reusable React component with multiple render patterns
- **`utils/pdfStyles.js`** - Centralized styling system with role-based theming
- **`utils/pdfTemplates.js`** - HTML template generation utilities

### Example Integrations

- **`examples/AdminStaffPDFIntegration.jsx`** - Integration examples for admin/staff roles

## Quick Start

### Basic Usage (Hook)

```javascript
import { useAppointmentPDF } from './hooks/useAppointmentPDF';

const MyComponent = ({ appointment }) => {
    const { downloadAppointmentPDF } = useAppointmentPDF('client');
    
    return (
        <button onClick={() => downloadAppointmentPDF(appointment)}>
            Download PDF
        </button>
    );
};
```

### Component Usage

```javascript
import { AppointmentPDFButton } from './AppointmentPDFDownloader';

const MyComponent = ({ appointment }) => {
    return (
        <AppointmentPDFButton 
            appointment={appointment}
            role="provider"
            className="btn btn-primary"
        />
    );
};
```

### Bulk Download

```javascript
import { AppointmentsPDFButton } from './AppointmentPDFDownloader';

const AppointmentsList = ({ appointments }) => {
    return (
        <AppointmentsPDFButton
            appointments={appointments}
            role="admin"
            className="btn btn-secondary"
            buttonText="Export All"
        />
    );
};
```

## Role-Based Features

### Client Role
- **Sections**: Appointment info, service details, provider details, location, payment info, contact info
- **Focus**: Client-centric view with payment details and provider contact information
- **Color**: Blue (#007bff)

### Provider Role  
- **Sections**: Appointment info, service details, client details, location, payment summary
- **Focus**: Service delivery view with client information and service details
- **Color**: Orange (inherited from provider theme)

### Admin Role
- **Sections**: All sections including system metadata and admin notes
- **Focus**: Comprehensive oversight view with full appointment lifecycle
- **Color**: Customizable (default blue)

### Staff Role
- **Sections**: All sections except sensitive client contact details
- **Focus**: Management and support view with administrative context
- **Color**: Purple (#6f42c1)

## Configuration Options

### Basic Configuration

```javascript
const config = {
    primaryColor: '#007bff',
    companyName: 'HireMe',
    compact: true,
    pageSize: 'A4',
    margins: '0.5in'
};
```

### Section Configuration

```javascript
const sectionConfig = {
    sections: {
        header: true,
        appointmentInfo: true,
        serviceDetails: true,
        providerDetails: true,
        clientDetails: false,  // Hide for certain roles
        locationDetails: true,
        paymentInfo: true,
        notes: true,
        contact: false,
        printButtons: true
    }
};
```

### Advanced Configuration

```javascript
const advancedConfig = {
    primaryColor: '#dc3545',
    companyName: 'Custom Company',
    compact: false,
    sections: { /* custom sections */ },
    onDownload: (appointment, role) => {
        // Track downloads
        analytics.track('pdf_download', { appointmentId: appointment.id, role });
    },
    onError: (error) => {
        // Handle errors
        console.error('PDF generation failed:', error);
    }
};
```

## Integration Examples

### In Appointment Detail Pages

```javascript
// Client AppointmentDetail.jsx
import { useAppointmentPDF } from '../../../components/shared/hooks/useAppointmentPDF';

const AppointmentDetail = () => {
    const { downloadAppointmentPDF } = useAppointmentPDF('client');
    
    return (
        <AppointmentHeader
            // ... other props
            onPrintClick={() => downloadAppointmentPDF(appointment)}
        />
    );
};
```

### In Appointment Lists

```javascript
// Provider AppointmentsList.jsx
import { AppointmentsPDFButton } from '../../../components/shared/AppointmentPDFDownloader';

const AppointmentsList = ({ appointments }) => {
    return (
        <div className="appointments-header">
            <h2>My Appointments</h2>
            <AppointmentsPDFButton
                appointments={appointments}
                role="provider"
                className="btn btn-outline-primary"
            />
        </div>
    );
};
```

### Custom Render Props

```javascript
import AppointmentPDFDownloader from '../../../components/shared/AppointmentPDFDownloader';

const CustomExportMenu = ({ appointment }) => {
    return (
        <AppointmentPDFDownloader appointment={appointment} role="admin">
            {({ downloadSingle, disabled }) => (
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle">
                        Export Options
                    </button>
                    <ul className="dropdown-menu">
                        <li>
                            <button 
                                className="dropdown-item"
                                onClick={downloadSingle}
                                disabled={disabled}
                            >
                                Export as PDF
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </AppointmentPDFDownloader>
    );
};
```

## API Reference

### useAppointmentPDF(role, config)

Returns an object with PDF generation functions.

**Parameters:**
- `role` (string): User role ('client', 'provider', 'admin', 'staff')
- `config` (object): Configuration options

**Returns:**
- `downloadAppointmentPDF(appointment, customConfig)`: Generate PDF for single appointment
- `downloadAppointmentsPDF(appointments, customConfig)`: Generate PDF for multiple appointments
- `role`: Current role
- `config`: Current configuration

### AppointmentPDFDownloader Component

**Props:**
- `appointment` (object): Single appointment data
- `appointments` (array): Multiple appointments for bulk download
- `role` (string): User role
- `config` (object): Configuration options
- `onDownload` (function): Download callback
- `onError` (function): Error callback
- `children` (function|element): Custom render content
- `className` (string): CSS classes
- `disabled` (boolean): Disable button
- `buttonText` (string): Custom button text
- `variant` ('button'|'link'|'custom'): Render variant

## Styling Customization

### CSS Variables

The PDF styles support CSS custom properties for easy theming:

```css
:root {
    --pdf-primary-color: #007bff;
    --pdf-secondary-color: #6c757d;
    --pdf-text-color: #333;
    --pdf-border-color: #ddd;
}
```

### Custom Themes

```javascript
const customTheme = {
    primaryColor: '#e74c3c',
    compact: false,
    pageSize: 'Letter',
    margins: '1in'
};

const { downloadAppointmentPDF } = useAppointmentPDF('admin', customTheme);
```

## Error Handling

The system includes comprehensive error handling:

```javascript
const config = {
    onError: (error) => {
        if (error.message.includes('popup blocker')) {
            alert('Please allow popups to download PDF');
        } else {
            console.error('PDF generation failed:', error);
        }
    }
};
```

## Performance Considerations

- PDF generation is client-side using DOM manipulation
- Large appointment lists may take time to process
- Consider implementing pagination for bulk exports
- The system includes automatic garbage collection for DOM elements

## Browser Compatibility

- Modern browsers with ES6+ support
- Popup blocker must be disabled for PDF generation
- Print functionality requires browser print support

## Migration Guide

### From Client-Specific Implementation

Replace existing PDF logic:

```javascript
// Before
const downloadPDF = () => {
    // Custom PDF logic
};

// After  
const { downloadAppointmentPDF } = useAppointmentPDF('client');
```

### Integration Checklist

1. ✅ Import shared components/hooks
2. ✅ Replace existing PDF logic
3. ✅ Update button handlers
4. ✅ Test role-specific content
5. ✅ Verify styling matches design
6. ✅ Test error scenarios

## Contributing

When adding new features:

1. Update template utilities in `utils/pdfTemplates.js`
2. Add new styles in `utils/pdfStyles.js`  
3. Update hook configuration options
4. Add integration examples
5. Update this documentation

## Troubleshooting

### Common Issues

**PDF not generating:**
- Check if popup blockers are enabled
- Verify appointment data structure
- Check browser console for errors

**Missing content:**
- Review section configuration
- Check role-specific permissions
- Verify data availability

**Styling issues:**
- Check CSS custom properties
- Verify print media queries  
- Review PDF page size settings

**Performance issues:**
- Reduce number of appointments in bulk export
- Enable compact mode
- Optimize appointment data structure