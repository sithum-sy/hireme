# HireMe - Service Marketplace Platform

[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-purple.svg)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive service marketplace platform built with Laravel and React, enabling seamless connections between service providers and clients across multiple industries.

## 🌟 Features

### Multi-Role Architecture
- **Clients**: Browse, book, and manage service appointments
- **Service Providers**: Offer services, manage bookings, and handle payments
- **Admin**: Complete platform oversight and user management
- **Staff**: Content moderation and support operations

### Core Functionality
- **Smart Service Discovery**: Geographic-based search with radius filtering
- **Advanced Booking System**: Real-time availability with race condition handling
- **Custom Quote System**: Request and provide custom pricing for services
- **Payment Integration**: Stripe integration for secure transactions
- **Review & Rating System**: Bidirectional feedback between clients and providers
- **Email & In-App Notifications**: Comprehensive notification system
- **Document Management**: Provider verification through document uploads
- **Real-time Dashboard**: Role-specific analytics and insights

### Advanced Features
- **Appointment Expiration**: Automatic 24-hour expiration with reminder system
- **Geographic Search**: Haversine formula for precise location-based results
- **Multi-Channel Notifications**: Email and in-app notification preferences
- **PDF Generation**: Invoices, quotes, and reports with custom templates
- **File Upload System**: Secure image and document handling with UUID naming
- **Queue System**: Background job processing for emails and notifications

## 🛠 Technology Stack

### Backend
- **Framework**: Laravel 10.x
- **Database**: MySQL/MariaDB with geographic functions
- **Authentication**: Laravel Sanctum API tokens
- **Queue System**: Database-driven background jobs
- **File Storage**: Local storage with symbolic links
- **PDF Generation**: DomPDF for reports and invoices
- **Image Processing**: Intervention Image for uploads

### Frontend
- **Framework**: React 19.1 with Vite
- **Routing**: React Router DOM
- **UI Components**: Bootstrap 5 with custom CSS
- **Charts**: Chart.js and Recharts for analytics
- **Maps**: Leaflet for location services
- **Icons**: Bootstrap Icons and Lucide React
- **Payments**: Stripe React components

### Development Tools
- **Code Quality**: Laravel Pint, PHPStan, ESLint, Prettier
- **Testing**: PHPUnit for backend testing
- **API Documentation**: RESTful API design
- **Version Control**: Git with structured branching

## 📋 Requirements

- PHP 8.1 or higher
- Node.js 16+ and npm
- MySQL 5.7+ or MariaDB 10.3+
- Composer 2.0+
- Web server (Apache/Nginx)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hireme.git
cd hireme
```

### 2. Backend Setup
```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file
# Set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Run migrations and seeders
php artisan migrate --seed

# Create storage symlink
php artisan storage:link
```

### 3. Frontend Setup
```bash
# Install Node.js dependencies
npm install

# Build assets for development
npm run dev

# Or build for production
npm run build
```

### 4. Queue Configuration
```bash
# Start the queue worker (required for notifications)
php artisan queue:work

# Or use the provided batch file (Windows)
start-queue.bat
```

## ⚙️ Configuration

### Environment Variables
Configure these essential variables in your `.env` file:

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hireme
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null

# Stripe Payment
STRIPE_KEY=your_stripe_publishable_key
STRIPE_SECRET=your_stripe_secret_key

# Queue Driver
QUEUE_CONNECTION=database
```

## 🏗 Architecture Overview

### Directory Structure
```
app/
├── Http/Controllers/API/     # Role-based API controllers
├── Models/                   # Eloquent models
├── Services/                 # Business logic layer
├── Events/ & Listeners/      # Event-driven notifications
└── Mail/                     # Email templates

resources/js/
├── components/               # Reusable React components
├── pages/                    # Top-level page components
├── context/                  # React Context providers
└── services/                 # API client services
```

### Database Schema
- **Users**: Multi-role authentication hub
- **Appointments**: Complex booking lifecycle (15+ statuses)
- **Services**: Location-aware service offerings
- **Quotes**: Custom pricing system
- **Reviews**: Bidirectional rating system
- **Invoices & Payments**: Financial transaction tracking

## 🧑‍💻 Development

### Common Commands
```bash
# Backend Development
php artisan serve              # Start Laravel server
php artisan migrate:refresh    # Reset database
php artisan queue:work         # Process background jobs

# Frontend Development
npm run dev                    # Start Vite dev server
npm run build                  # Build for production

# Code Quality
vendor/bin/pint                # Format PHP code
vendor/bin/phpstan analyse     # Static analysis
npm run lint                   # Lint JavaScript
npm run format                 # Format with Prettier
```

### Testing
```bash
# Run PHP tests
php artisan test
# or
vendor/bin/phpunit

# Run with coverage
vendor/bin/phpunit --coverage-html coverage
```

## 📊 Key Features in Detail

### Appointment System
- **Race Condition Protection**: Database locking prevents double-booking
- **Automatic Expiration**: 24-hour expiration with email reminders
- **Status Management**: 15+ appointment statuses with transition validation
- **Reschedule Requests**: Structured rescheduling workflow

### Geographic Search
- **Radius-based Discovery**: Haversine formula for accurate distance calculation
- **Location Validation**: Real-time address verification
- **Service Areas**: Flexible coverage zones for providers

### Payment Integration
- **Stripe Integration**: Secure payment processing
- **Invoice Generation**: Automated PDF invoice creation
- **Payment Tracking**: Complete financial transaction history
- **Multi-payment Methods**: Support for various payment types

### Notification System
- **Multi-channel Delivery**: Email and in-app notifications
- **User Preferences**: Granular notification control
- **Event-driven**: Automatic notifications for all major actions
- **Queue Processing**: Background delivery for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow PSR-12 for PHP code
- Use Laravel best practices
- Follow React/JavaScript best practices
- Maintain comprehensive test coverage
- Document new features

## 📝 API Documentation

The platform provides a comprehensive RESTful API with role-based endpoints:

- `/api/client/*` - Client-specific operations
- `/api/provider/*` - Provider management
- `/api/admin/*` - Administrative functions
- `/api/staff/*` - Staff operations

Authentication is handled via Laravel Sanctum tokens.

## 🔒 Security

- **HTTPS Enforcement**: SSL/TLS encryption
- **Token Authentication**: Sanctum-based API security
- **Role-based Access Control**: Middleware-enforced permissions
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: UUID naming and type validation
- **SQL Injection Prevention**: Eloquent ORM protection

## 📈 Performance

- **Database Optimization**: Strategic indexing for complex queries
- **Caching Strategy**: Redis/Memcached support
- **Asset Optimization**: Vite bundling and minification
- **Background Processing**: Queue system for heavy operations
- **Geographic Performance**: Optimized spatial queries

## 🔧 Troubleshooting

### Common Issues
1. **Queue jobs not processing**: Ensure `php artisan queue:work` is running
2. **File uploads failing**: Check storage permissions and symlinks
3. **Email not sending**: Verify MAIL_* configuration in .env
4. **Geographic search issues**: Ensure MySQL has spatial function support

### Logs
- Laravel logs: `storage/logs/laravel.log`
- Queue failures: Check `failed_jobs` database table
- Frontend errors: Browser developer console

## 📧 Support

For support, please create an issue in the GitHub repository or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Laravel community for the excellent framework
- React community for powerful frontend tools
- Stripe for secure payment processing
- Bootstrap team for UI components
- All contributors who helped build this platform

---

**HireMe** - Connecting service providers with clients efficiently and securely.
