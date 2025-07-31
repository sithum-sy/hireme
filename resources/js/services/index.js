/**
 * HireMe Services - Centralized service management
 * 
 * This file provides a clean API for accessing all services in the application.
 * Services are organized by role and functionality for better maintainability.
 */

// Core infrastructure
export * from './core';

// Role-based services
export * from './admin';
export * from './client';
export * from './provider';
// export * from './staff'; // Staff services not yet implemented

// Shared services
export * from './shared';

// Service Registry Setup
import { serviceRegistry } from './core';

// Admin Services
import {
    AdminDashboardService,
    AdminUserManagementService,
    AdminStaffManagementService,
    AdminReportsService
} from './admin';

// Client Services
import {
    ClientDashboardService,
    ClientAppointmentService,
    ClientBookingService,
    ClientQuoteService,
    ClientPaymentService
} from './client';

// Provider Services
import {
    ProviderAppointmentService,
    ProviderAvailabilityService
} from './provider';

// Shared Services
import {
    NotificationService,
    SearchService
} from './shared';

/**
 * Register all services with the service registry
 */
function registerServices() {
    // Admin Services
    serviceRegistry.registerClass('adminDashboard', AdminDashboardService);
    serviceRegistry.registerClass('adminUserManagement', AdminUserManagementService);
    serviceRegistry.registerClass('adminStaffManagement', AdminStaffManagementService);
    serviceRegistry.registerClass('adminReports', AdminReportsService);

    // Client Services
    serviceRegistry.registerClass('clientDashboard', ClientDashboardService);
    serviceRegistry.registerClass('clientAppointment', ClientAppointmentService);
    serviceRegistry.registerClass('clientBooking', ClientBookingService);
    serviceRegistry.registerClass('clientQuote', ClientQuoteService);
    serviceRegistry.registerClass('clientPayment', ClientPaymentService);

    // Provider Services
    serviceRegistry.registerClass('providerAppointment', ProviderAppointmentService);
    serviceRegistry.registerClass('providerAvailability', ProviderAvailabilityService);

    // Shared Services
    serviceRegistry.registerClass('notification', NotificationService);
    serviceRegistry.registerClass('search', SearchService);
}

// Auto-register services when this module is imported
registerServices();

/**
 * Service accessor functions for convenience
 */
export const getService = (name) => serviceRegistry.get(name);

// Specific service getters for type safety and convenience
export const getAdminDashboard = () => serviceRegistry.get('adminDashboard');
export const getAdminUserManagement = () => serviceRegistry.get('adminUserManagement');
export const getAdminStaffManagement = () => serviceRegistry.get('adminStaffManagement');
export const getAdminReports = () => serviceRegistry.get('adminReports');

export const getClientDashboard = () => serviceRegistry.get('clientDashboard');
export const getClientAppointment = () => serviceRegistry.get('clientAppointment');
export const getClientBooking = () => serviceRegistry.get('clientBooking');
export const getClientQuote = () => serviceRegistry.get('clientQuote');
export const getClientPayment = () => serviceRegistry.get('clientPayment');

export const getProviderAppointment = () => serviceRegistry.get('providerAppointment');
export const getProviderAvailability = () => serviceRegistry.get('providerAvailability');

export const getNotificationService = () => serviceRegistry.get('notification');
export const getSearchService = () => serviceRegistry.get('search');

/**
 * Legacy compatibility - export instances for immediate use
 * This allows existing code to continue working while migration happens
 */
export const adminDashboard = getAdminDashboard();
export const clientAppointment = getClientAppointment();
export const providerAppointment = getProviderAppointment();
export const notificationService = getNotificationService();
export const searchService = getSearchService();

export default serviceRegistry;