# Production Environment Configuration for HireMe

APP_NAME=HireMe
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://hireme-yourname.me

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Database Configuration (PlanetScale)
DB_CONNECTION=mysql
DB_HOST=YOUR_PLANETSCALE_HOST
DB_PORT=3306
DB_DATABASE=YOUR_DATABASE_NAME
DB_USERNAME=YOUR_USERNAME
DB_PASSWORD=YOUR_PASSWORD

# Redis Configuration (Railway Redis addon)
REDIS_HOST=YOUR_REDIS_HOST
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_PORT=6379

# Email Configuration (Use Railway SMTP or third-party service)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@hireme-yourname.me
MAIL_FROM_NAME="${APP_NAME}"

# File Storage Configuration (Cloudinary)
FILESYSTEM_DISK=cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Session and Cache
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# Security
SANCTUM_STATEFUL_DOMAINS=hireme-yourname.me
SESSION_DOMAIN=.hireme-yourname.me
CORS_ALLOWED_ORIGINS=https://hireme-yourname.me

# Third-party Services
STRIPE_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY
STRIPE_SECRET=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Monitoring (Optional)
SENTRY_LARAVEL_DSN=https://your-dsn@sentry.io/project-id

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX