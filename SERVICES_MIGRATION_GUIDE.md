# Services Migration Guide

This guide helps migrate from the old monolithic service structure to the new role-based service architecture.

## Migration Overview

The JavaScript services have been reorganized into a cleaner, more maintainable structure:

### Old Structure (to be removed)
```
resources/js/services/
├── adminService.js (509 lines)
├── clientService.js (1,529 lines)
├── appointmentService.js (800 lines)
├── providerAppointmentService.js (424 lines)
├── availabilityService.js (483 lines)
└── ... (16 total files)
```

### New Structure
```
resources/js/services/
├── core/                    # Base infrastructure
│   ├── BaseService.js
│   ├── ApiClient.js
│   └── ServiceRegistry.js
├── admin/                   # Admin services
├── client/                  # Client services
├── provider/                # Provider services
├── staff/                   # Staff services
└── shared/                  # Cross-role services
```

## Import Migration Map

### Core Services
```javascript
// OLD
import axios from "axios";
import { profileAPI, notificationAPI } from "../services/api";

// NEW
import { apiClient, getNotificationService } from "../services";
const notificationService = getNotificationService();
```

### Admin Services
```javascript
// OLD
import adminService from "../../../services/adminService";

// NEW - Multiple focused services
import { 
    getAdminDashboard,
    getAdminUserManagement,
    getAdminStaffManagement,
    getAdminReports 
} from "../../../services";

const adminDashboard = getAdminDashboard();
const userManagement = getAdminUserManagement();
```

### Client Services
```javascript
// OLD
import clientService from "../../../services/clientService";
import appointmentService from "../../../services/appointmentService";
import clientAppointmentService from "../../../services/clientAppointmentService";
import paymentService from "../../../services/paymentService";

// NEW - Clean separation of concerns
import { 
    getClientDashboard,
    getClientAppointment,
    getClientBooking,
    getClientQuote,
    getClientPayment 
} from "../../../services";

const clientDashboard = getClientDashboard();
const appointmentService = getClientAppointment();
const bookingService = getClientBooking();
const quoteService = getClientQuote();
const paymentService = getClientPayment();
```

### Provider Services
```javascript
// OLD
import providerAppointmentService from "../../../services/providerAppointmentService";
import availabilityService from "../../../services/availabilityService";

// NEW
import { 
    getProviderAppointment,
    getProviderAvailability 
} from "../../../services";

const appointmentService = getProviderAppointment();
const availabilityService = getProviderAvailability();
```

### Shared Services
```javascript
// OLD
import notificationService from "../../../services/notificationService";
import searchService from "../../../services/searchService";
import reviewService from "../../../services/reviewService";

// NEW
import { 
    getNotificationService,
    getSearchService 
} from "../../../services";

const notificationService = getNotificationService();
const searchService = getSearchService();
```

## Component Update Examples

### Client Dashboard Component
```javascript
// OLD
import clientService from "../../services/clientService";
import clientAppointmentService from "../../services/clientAppointmentService";

export default function ClientDashboard() {
    useEffect(() => {
        const loadData = async () => {
            const stats = await clientService.getDashboardStats();
            const appointments = await clientAppointmentService.getUpcomingAppointments();
        };
        loadData();
    }, []);
}

// NEW
import { getClientDashboard, getClientAppointment } from "../../services";

export default function ClientDashboard() {
    const dashboardService = getClientDashboard();
    const appointmentService = getClientAppointment();

    useEffect(() => {
        const loadData = async () => {
            const stats = await dashboardService.getStats();
            const appointments = await appointmentService.getUpcomingAppointments();
        };
        loadData();
    }, []);
}
```

### Provider Appointment Management
```javascript
// OLD
import providerAppointmentService from "../../../services/providerAppointmentService";

const handleConfirm = async (appointmentId) => {
    try {
        await providerAppointmentService.confirmAppointment(appointmentId);
    } catch (error) {
        console.error(error);
    }
};

// NEW
import { getProviderAppointment } from "../../../services";

const appointmentService = getProviderAppointment();

const handleConfirm = async (appointmentId) => {
    try {
        await appointmentService.confirmAppointment(appointmentId);
    } catch (error) {
        console.error(error);
    }
};
```

## Method Mapping

### Client Service Methods
```javascript
// OLD clientService methods → NEW service methods
clientService.getDashboardStats() → getClientDashboard().getStats()
clientService.getAppointments() → getClientAppointment().getAppointments()
clientService.createBooking() → getClientBooking().createBooking()
clientService.requestQuote() → getClientQuote().requestQuote()
clientService.processPayment() → getClientPayment().processPayment()
```

### Admin Service Methods
```javascript
// OLD adminService methods → NEW service methods
adminService.getDashboardStats() → getAdminDashboard().getStats()
adminService.getUsers() → getAdminUserManagement().getUsers()
adminService.getStaff() → getAdminStaffManagement().getStaff()
adminService.getOverviewReport() → getAdminReports().getOverviewReport()
```

## Benefits of New Structure

### 1. **Focused Responsibilities**
- Each service handles a specific domain
- Easier to find and maintain code
- Clear separation of concerns

### 2. **Better Performance**
- Smaller bundle sizes per service
- Tree-shaking friendly
- Lazy loading capabilities

### 3. **Improved Developer Experience**
- Predictable import paths
- Better IDE autocomplete
- Easier testing

### 4. **Consistent Error Handling**
- All services extend BaseService
- Standardized error responses
- Built-in retry and caching logic

## Migration Steps

### Phase 1: Update Core Components (HIGH PRIORITY)
1. Update navigation components to use new NotificationService
2. Update dashboard components to use role-specific services
3. Test critical user flows

### Phase 2: Update Feature Components (MEDIUM PRIORITY)
4. Update appointment-related components
5. Update booking and payment flows
6. Update admin management pages

### Phase 3: Cleanup (LOW PRIORITY)
7. Remove old service files
8. Update any remaining imports
9. Run final tests

## Testing During Migration

### Component Testing
```javascript
// Test with new services
import { getClientAppointment } from "../services";

describe('AppointmentDetail', () => {
    const appointmentService = getClientAppointment();
    
    test('should load appointment details', async () => {
        const appointment = await appointmentService.getAppointment(123);
        expect(appointment.success).toBe(true);
    });
});
```

### Service Registry Testing
```javascript
import { serviceRegistry } from "../services/core";

// Test service registration
expect(serviceRegistry.has('clientAppointment')).toBe(true);

// Test service retrieval
const service = serviceRegistry.get('clientAppointment');
expect(service).toBeInstanceOf(ClientAppointmentService);
```

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: Keep old service files until migration is complete
2. **Gradual Migration**: Update one component at a time
3. **Fallback Imports**: Use legacy compatibility exports if needed

```javascript
// Fallback for emergency situations
import { clientAppointment } from "../services"; // Legacy export
```

## File Removal Checklist

After successful migration, remove these old files:
- [ ] `resources/js/services/adminService.js`
- [ ] `resources/js/services/clientService.js`
- [ ] `resources/js/services/appointmentService.js`
- [ ] `resources/js/services/providerAppointmentService.js`
- [ ] `resources/js/services/availabilityService.js`
- [ ] `resources/js/services/clientAppointmentService.js`
- [ ] `resources/js/services/api.js` (functionality moved to ApiClient)

## Support

For questions or issues during migration:
1. Check this guide first
2. Review the new service structure in `resources/js/services/`
3. Test changes in development environment
4. Document any additional patterns discovered

---

**Remember**: The new architecture is designed to be more maintainable and scalable. Take time to understand the new structure before migrating large sections of code.