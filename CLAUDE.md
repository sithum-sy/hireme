# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel + React service marketplace application called "HireMe" where clients can find and book services from providers. The application has a multi-role system with Admins, Staff, Providers, and Clients.

## Technology Stack

- **Backend**: Laravel 10.x with PHP 8.1+
- **Frontend**: React 19 with Vite build system
- **Database**: MySQL
- **Authentication**: Laravel Sanctum for API tokens
- **UI**: Bootstrap 5 + custom CSS
- **Maps**: Leaflet for location services
- **Payments**: Stripe integration
- **Icons**: Bootstrap Icons + FontAwesome

## Development Commands

### Laravel (Backend)
```bash
# Start development server
php artisan serve

# Run database migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed

# Create new migration
php artisan make:migration <name>

# Create model with migration and factory
php artisan make:model <ModelName> -mf

# Clear application cache
php artisan cache:clear && php artisan config:clear && php artisan route:clear

# Run tests
php artisan test
# Or with PHPUnit directly
vendor/bin/phpunit

# Code formatting (Laravel Pint)
vendor/bin/pint
```

### Frontend (React/Vite)
```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build
```

## Architecture Overview

### Backend Structure
- **Models**: Core entities (User, Service, Appointment, Quote, Review, etc.)
- **Controllers**: Organized by role in `app/Http/Controllers/API/`
  - `Admin/` - Administrative functions
  - `Client/` - Client-specific endpoints
  - `Provider/` - Provider-specific endpoints  
  - `Staff/` - Staff management functions
- **Services**: Business logic in `app/Services/`
- **Middleware**: Role-based access control and validation

### Frontend Structure
- **Pages**: Organized by user role in `resources/js/pages/`
- **Components**: Reusable UI components in `resources/js/components/`
  - Role-specific components (admin/, client/, provider/, staff/)
  - Shared components (ui/, forms/, navigation/)
- **Context**: React Context providers for state management
- **Services**: API communication layer in `resources/js/services/`

### User Roles & Permissions
1. **Admin**: Full system access, user management, platform oversight
2. **Staff**: Content management, service categories, moderation
3. **Provider**: Service creation, appointment management, quotes
4. **Client**: Service browsing, booking, appointment management

### Key Models & Relationships
- **User**: Base user model with role-based permissions
- **ProviderProfile**: Extended profile for service providers
- **Service**: Services offered by providers
- **Appointment**: Bookings between clients and providers
- **Quote**: Price estimates for custom services
- **Review**: Client feedback on completed services

### API Structure
- RESTful APIs organized by functionality
- Authentication via Sanctum tokens
- Role-based middleware protection
- Consistent JSON response format

### File Upload Handling
- Profile pictures stored in `public/images/profile_pictures/`
- Service images in `public/images/services/`
- Provider documents in `public/storage/` with subdirectories
- Image processing via Intervention Image package

### Key Features
- **Service Discovery**: Search, filter, and browse services by category/location
- **Booking System**: Real-time availability, appointment scheduling
- **Quote System**: Request custom quotes for services
- **Payment Integration**: Stripe for secure payment processing
- **Review System**: Client feedback and provider ratings
- **Location Services**: Map integration for service area selection
- **File Management**: Document uploads for provider verification

## Development Notes

- Frontend uses React Router for client-side routing
- Bootstrap utilities heavily used for styling
- Error boundaries implemented for robust error handling
- Toast notifications for user feedback
- Responsive design with mobile-first approach
- Laravel's built-in validation and form requests
- Database uses soft deletes for user records
- Activity logging for staff actions