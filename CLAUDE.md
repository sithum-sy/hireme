# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend Development (React/Vite)
- `npm run dev` - Start the Vite development server for React frontend
- `npm run build` - Build the React application for production

### Backend Development (Laravel)
- `php artisan serve` - Start Laravel development server
- `php artisan migrate` - Run database migrations
- `php artisan migrate:refresh --seed` - Reset database and run seeders
- `php artisan queue:work` - Start the queue worker for background jobs
- `php artisan tinker` - Laravel REPL for database and model testing

### Testing
- `vendor/bin/phpunit` - Run PHP unit and feature tests
- `php artisan test` - Alternative command to run Laravel tests

### Code Quality
- `vendor/bin/pint` - Laravel Pint code formatter (equivalent to PHP CS Fixer)
- `vendor/bin/phpstan analyse` - PHPStan static analysis
- `npm run lint` - ESLint JavaScript/React linting
- `npm run lint:fix` - ESLint with auto-fix
- `npm run format` - Prettier code formatting
- `npm run format:check` - Prettier formatting check

## Architecture Overview

### Multi-Role Service Marketplace
This is a Laravel + React SPA implementing a service marketplace with four distinct user roles:

1. **Client**: Service consumers who book appointments
2. **Service Provider**: Business owners offering services  
3. **Admin**: Full system administrators
4. **Staff**: Content management and moderation team

### Key Architectural Patterns
- **API-First Design**: Laravel backend provides RESTful APIs consumed by React SPA
- **Service Layer Pattern**: Business logic abstracted into dedicated service classes in `app/Services/`
- **Role-Based Access Control**: Controllers organized by role with middleware enforcement
- **Event-Driven Architecture**: Laravel events and listeners for notifications and workflows

## Core Models and Relationships

### Primary Entities
- **User**: Multi-role hub with dynamic relationships based on user type
- **Appointment**: Complex booking lifecycle with 15+ status states and auto-expiration
- **Service**: Location-aware services with geographical search capabilities
- **ProviderProfile**: Extended business information with document verification
- **Quote**: Custom pricing request/response system
- **Review**: Bidirectional rating system between clients and providers

### Key Business Logic
- **Race Condition Handling**: Database locking prevents double-booking during high concurrency
- **Geographic Search**: Haversine formula for radius-based service discovery
- **Appointment Expiration**: Automatic expiration after 24 hours with reminder system
- **Multi-Channel Notifications**: Email and in-app notifications via event system

## File Organization

### Laravel Backend Structure
```
app/
├── Http/Controllers/API/
│   ├── Admin/ - Administrative functions
│   ├── Client/ - Consumer-facing features  
│   ├── Provider/ - Business management
│   └── Staff/ - Content moderation
├── Models/ - Eloquent models with relationships
├── Services/ - Business logic layer
├── Mail/ - Email notification templates
└── Events/ & Listeners/ - Event-driven notifications
```

### React Frontend Structure
```
resources/js/
├── components/
│   ├── admin/ - Admin dashboard components
│   ├── client/ - Client interface components
│   ├── provider/ - Provider management components
│   └── shared/ - Reusable components
├── context/ - React Context providers for state management
├── pages/ - Top-level page components per role
└── services/ - API client services
```

## Database Schema Patterns

### Advanced Features Used
- **Soft Deletes**: User account management
- **JSON Columns**: Flexible data (service areas, document arrays)
- **Geographic Data**: Latitude/longitude with radius calculations
- **Performance Indexes**: Strategic indexing for complex queries
- **Foreign Key Constraints**: Data integrity enforcement

### Migration Naming Convention
Migrations follow descriptive naming like `create_appointments_table` or `add_expiration_fields_to_appointments_table`.

## Development Workflow Considerations

### Authentication System
- **Laravel Sanctum**: API token authentication
- **Email Verification**: Required for all new accounts
- **Role-Based Middleware**: Automatic role enforcement on routes

### File Upload System
- **Profile Images**: Stored in `public/images/profile_pictures/`
- **Service Images**: Stored in `public/images/services/`
- **Provider Documents**: Organized by type in `public/images/provider_documents/`
- **Unique Naming**: UUID-based file naming to prevent conflicts

### Queue System
Background jobs are used for:
- Email notifications
- Appointment expiration processing
- Reminder notifications
- Service statistics updates

Use `php artisan queue:work` during development to process jobs.

### Environment Dependencies
- **Database**: MySQL/MariaDB (uses geographic functions)
- **File Storage**: Local storage in public directory with symbolic links
- **Mail**: Configured for email notifications (check .env for MAIL_* settings)
- **Queue**: Database queue driver (requires running queue worker)

## Common Development Tasks

When working with appointments:
- Always use `AppointmentService` for booking logic to handle race conditions
- Check for time conflicts using `AvailabilityService`
- Appointment status changes trigger automatic notifications

When working with services:
- Geographic search queries use the Haversine formula in the `Service` model
- Service images are handled through dedicated upload services
- Service areas are stored as JSON arrays for flexible location coverage

When working with user profiles:
- Provider profiles require separate document verification workflow
- Profile images use UUID naming and require cleanup on user deletion
- Role changes require careful handling of related data integrity