# Notification System Migration Guide
## Database Schema and Configuration Setup

**Version:** 1.0  
**Prerequisites:** EMAIL_AND_IN_APP_NOTIFICATIONS_IMPLEMENTATION_PLAN.md  
**Target:** Development Team

---

## Database Migrations

### 1. Create Notifications Table (Laravel Standard)

**File:** `database/migrations/2025_01_26_000001_create_notifications_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};
```

### 2. Create In-App Notifications Table

**File:** `database/migrations/2025_01_26_000002_create_in_app_notifications_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('in_app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'success', 'warning', 'error'])->default('info');
            $table->enum('category', ['appointment', 'payment', 'system', 'general'])->default('general');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('quote_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_read')->default(false);
            $table->string('action_url', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index(['category']);
            $table->index(['created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('in_app_notifications');
    }
};
```

### 3. Create Notification Preferences Table

**File:** `database/migrations/2025_01_26_000003_create_notification_preferences_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('notification_type', 100);
            $table->boolean('email_enabled')->default(true);
            $table->boolean('app_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->timestamps();
            
            $table->unique(['user_id', 'notification_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('notification_preferences');
    }
};
```

### 4. Add Notification Settings to Users Table

**File:** `database/migrations/2025_01_26_000004_add_notification_settings_to_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('email_notifications_enabled')->default(true);
            $table->boolean('app_notifications_enabled')->default(true);
            $table->boolean('sms_notifications_enabled')->default(false);
            $table->string('notification_timezone', 50)->default('Asia/Colombo');
            $table->json('notification_quiet_hours')->nullable(); // {start: "22:00", end: "08:00"}
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_notifications_enabled',
                'app_notifications_enabled', 
                'sms_notifications_enabled',
                'notification_timezone',
                'notification_quiet_hours'
            ]);
        });
    }
};
```

---

## Model Definitions

### 1. InAppNotification Model

**File:** `app/Models/InAppNotification.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class InAppNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message', 
        'type',
        'category',
        'appointment_id',
        'quote_id',
        'is_read',
        'action_url',
        'metadata'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getIconAttribute()
    {
        $icons = [
            'appointment' => 'fa-calendar-alt',
            'payment' => 'fa-credit-card',
            'system' => 'fa-cog',
            'general' => 'fa-info-circle'
        ];

        return $icons[$this->category] ?? 'fa-bell';
    }

    public function getColorClassAttribute()
    {
        $colors = [
            'info' => 'text-info',
            'success' => 'text-success', 
            'warning' => 'text-warning',
            'error' => 'text-danger'
        ];

        return $colors[$this->type] ?? 'text-secondary';
    }

    // Methods
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->update(['is_read' => true]);
        }
    }

    public function getRelatedEntity()
    {
        if ($this->appointment_id) {
            return $this->appointment;
        }
        
        if ($this->quote_id) {
            return $this->quote;
        }
        
        return null;
    }
}
```

### 2. NotificationPreference Model

**File:** `app/Models/NotificationPreference.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_type',
        'email_enabled',
        'app_enabled',
        'sms_enabled'
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'app_enabled' => 'boolean',
        'sms_enabled' => 'boolean'
    ];

    // Notification types
    const TYPE_APPOINTMENT_CREATED = 'appointment_created';
    const TYPE_APPOINTMENT_CONFIRMED = 'appointment_confirmed';
    const TYPE_APPOINTMENT_DECLINED = 'appointment_declined';
    const TYPE_APPOINTMENT_CANCELLED = 'appointment_cancelled';
    const TYPE_APPOINTMENT_STARTED = 'appointment_started';
    const TYPE_APPOINTMENT_COMPLETED = 'appointment_completed';
    const TYPE_INVOICE_GENERATED = 'invoice_generated';
    const TYPE_PAYMENT_RECEIVED = 'payment_received';
    const TYPE_RESCHEDULE_REQUEST = 'reschedule_request';
    const TYPE_RESCHEDULE_APPROVED = 'reschedule_approved';
    const TYPE_RESCHEDULE_DECLINED = 'reschedule_declined';
    const TYPE_REVIEW_SUBMITTED = 'review_submitted';
    const TYPE_QUOTE_RECEIVED = 'quote_received';
    const TYPE_QUOTE_ACCEPTED = 'quote_accepted';
    const TYPE_QUOTE_DECLINED = 'quote_declined';

    public static function getNotificationTypes()
    {
        return [
            self::TYPE_APPOINTMENT_CREATED => 'New appointment bookings',
            self::TYPE_APPOINTMENT_CONFIRMED => 'Appointment confirmations',
            self::TYPE_APPOINTMENT_DECLINED => 'Appointment declined',
            self::TYPE_APPOINTMENT_CANCELLED => 'Appointment cancellations',
            self::TYPE_APPOINTMENT_STARTED => 'Service started',
            self::TYPE_APPOINTMENT_COMPLETED => 'Service completed',
            self::TYPE_INVOICE_GENERATED => 'New invoices',
            self::TYPE_PAYMENT_RECEIVED => 'Payment confirmations',
            self::TYPE_RESCHEDULE_REQUEST => 'Reschedule requests',
            self::TYPE_RESCHEDULE_APPROVED => 'Reschedule approved',
            self::TYPE_RESCHEDULE_DECLINED => 'Reschedule declined',
            self::TYPE_REVIEW_SUBMITTED => 'New reviews',
            self::TYPE_QUOTE_RECEIVED => 'Quote requests',
            self::TYPE_QUOTE_ACCEPTED => 'Quote accepted',
            self::TYPE_QUOTE_DECLINED => 'Quote declined',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Static methods
    public static function getPreference($userId, $notificationType)
    {
        return static::where('user_id', $userId)
            ->where('notification_type', $notificationType)
            ->first();
    }

    public static function isEnabled($userId, $notificationType, $channel = 'email')
    {
        $preference = static::getPreference($userId, $notificationType);
        
        if (!$preference) {
            // Default to enabled if no preference set
            return true;
        }

        $channelField = $channel . '_enabled';
        return $preference->$channelField ?? true;
    }
}
```

---

## Configuration Files

### 1. Queue Configuration

**File:** `config/queue.php` (additions)

```php
// Add to connections array
'notifications' => [
    'driver' => 'database',
    'table' => 'jobs',
    'queue' => 'notifications',
    'retry_after' => 90,
    'after_commit' => false,
],

'high_priority' => [
    'driver' => 'database', 
    'table' => 'jobs',
    'queue' => 'high_priority',
    'retry_after' => 60,
    'after_commit' => false,
],
```

### 2. Mail Configuration

**File:** `config/mail.php` (additions)

```php
// Add to mailers array for notification-specific settings
'notifications' => [
    'transport' => 'smtp',
    'host' => env('NOTIFICATION_MAIL_HOST', env('MAIL_HOST')),
    'port' => env('NOTIFICATION_MAIL_PORT', env('MAIL_PORT')),
    'encryption' => env('NOTIFICATION_MAIL_ENCRYPTION', env('MAIL_ENCRYPTION')),
    'username' => env('NOTIFICATION_MAIL_USERNAME', env('MAIL_USERNAME')),
    'password' => env('NOTIFICATION_MAIL_PASSWORD', env('MAIL_PASSWORD')),
    'timeout' => null,
    'local_domain' => env('MAIL_EHLO_DOMAIN'),
],
```

### 3. Notification Configuration

**File:** `config/notifications.php` (new file)

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Notification Channels
    |--------------------------------------------------------------------------
    */
    'channels' => [
        'email' => [
            'enabled' => env('NOTIFICATIONS_EMAIL_ENABLED', true),
            'queue' => env('NOTIFICATIONS_EMAIL_QUEUE', 'notifications'),
            'from' => [
                'address' => env('NOTIFICATIONS_FROM_EMAIL', env('MAIL_FROM_ADDRESS')),
                'name' => env('NOTIFICATIONS_FROM_NAME', env('MAIL_FROM_NAME')),
            ],
        ],
        
        'app' => [
            'enabled' => env('NOTIFICATIONS_APP_ENABLED', true),
            'queue' => env('NOTIFICATIONS_APP_QUEUE', 'default'),
            'retention_days' => env('NOTIFICATIONS_APP_RETENTION_DAYS', 30),
        ],
        
        'sms' => [
            'enabled' => env('NOTIFICATIONS_SMS_ENABLED', false),
            'queue' => env('NOTIFICATIONS_SMS_QUEUE', 'high_priority'),
            'provider' => env('SMS_PROVIDER', 'twilio'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Templates
    |--------------------------------------------------------------------------
    */
    'templates' => [
        'appointment_created' => [
            'email' => [
                'client' => \App\Mail\AppointmentBookingConfirmation::class,
                'provider' => \App\Mail\AppointmentProviderNotification::class,
            ],
            'app' => [
                'client' => [
                    'title' => 'Booking Request Submitted',
                    'message' => 'Your booking request for {service_name} has been submitted. The provider will respond within 24 hours.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
                'provider' => [
                    'title' => 'New Booking Request',
                    'message' => 'You have a new booking request for {service_name} from {client_name}.',
                    'type' => 'info', 
                    'category' => 'appointment',
                ],
            ],
        ],
        
        'appointment_confirmed' => [
            'email' => [
                'client' => \App\Mail\AppointmentConfirmedMail::class,
            ],
            'app' => [
                'client' => [
                    'title' => 'Appointment Confirmed',
                    'message' => 'Your appointment for {service_name} on {appointment_date} has been confirmed.',
                    'type' => 'success',
                    'category' => 'appointment',
                ],
            ],
        ],
        
        'appointment_declined' => [
            'email' => [
                'client' => \App\Mail\AppointmentDeclinedMail::class,
            ],
            'app' => [
                'client' => [
                    'title' => 'Appointment Declined',
                    'message' => 'Unfortunately, your appointment request for {service_name} has been declined.',
                    'type' => 'warning',
                    'category' => 'appointment',
                ],
            ],
        ],
        
        // Add more templates as needed...
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    */
    'settings' => [
        'batch_size' => env('NOTIFICATIONS_BATCH_SIZE', 100),
        'retry_times' => env('NOTIFICATIONS_RETRY_TIMES', 3),
        'retry_delay' => env('NOTIFICATIONS_RETRY_DELAY', 60), // seconds
        'quiet_hours' => [
            'enabled' => env('NOTIFICATIONS_QUIET_HOURS_ENABLED', true),
            'start' => env('NOTIFICATIONS_QUIET_START', '22:00'),
            'end' => env('NOTIFICATIONS_QUIET_END', '08:00'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Real-time Settings
    |--------------------------------------------------------------------------
    */
    'realtime' => [
        'enabled' => env('NOTIFICATIONS_REALTIME_ENABLED', false),
        'driver' => env('NOTIFICATIONS_REALTIME_DRIVER', 'pusher'), // pusher, redis, none
        'channel_prefix' => env('NOTIFICATIONS_CHANNEL_PREFIX', 'hireme'),
        'polling_interval' => env('NOTIFICATIONS_POLLING_INTERVAL', 30), // seconds
    ],
];
```

---

## Environment Variables

### .env File Additions

```bash
# Notification Settings
NOTIFICATIONS_EMAIL_ENABLED=true
NOTIFICATIONS_APP_ENABLED=true
NOTIFICATIONS_SMS_ENABLED=false

# Email Notification Settings
NOTIFICATIONS_FROM_EMAIL="${MAIL_FROM_ADDRESS}"
NOTIFICATIONS_FROM_NAME="${MAIL_FROM_NAME}"
NOTIFICATIONS_EMAIL_QUEUE=notifications

# In-App Notification Settings
NOTIFICATIONS_APP_QUEUE=default
NOTIFICATIONS_APP_RETENTION_DAYS=30

# SMS Settings (Optional)
SMS_PROVIDER=twilio
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=

# Real-time Notifications (Optional)
NOTIFICATIONS_REALTIME_ENABLED=false
NOTIFICATIONS_REALTIME_DRIVER=pusher
NOTIFICATIONS_CHANNEL_PREFIX=hireme
NOTIFICATIONS_POLLING_INTERVAL=30

# Notification Timing
NOTIFICATIONS_QUIET_HOURS_ENABLED=true
NOTIFICATIONS_QUIET_START=22:00
NOTIFICATIONS_QUIET_END=08:00

# Performance Settings
NOTIFICATIONS_BATCH_SIZE=100
NOTIFICATIONS_RETRY_TIMES=3
NOTIFICATIONS_RETRY_DELAY=60
```

---

## Seeders

### 1. Notification Preferences Seeder

**File:** `database/seeders/NotificationPreferencesSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\NotificationPreference;

class NotificationPreferencesSeeder extends Seeder
{
    public function run()
    {
        $notificationTypes = NotificationPreference::getNotificationTypes();
        
        // Get all users
        $users = User::all();
        
        foreach ($users as $user) {
            foreach (array_keys($notificationTypes) as $type) {
                NotificationPreference::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'notification_type' => $type,
                    ],
                    [
                        'email_enabled' => true,
                        'app_enabled' => true,
                        'sms_enabled' => false,
                    ]
                );
            }
        }
        
        $this->command->info('Created notification preferences for ' . $users->count() . ' users');
    }
}
```

### 2. Sample Notifications Seeder

**File:** `database/seeders/SampleNotificationsSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\InAppNotification;
use App\Models\Appointment;

class SampleNotificationsSeeder extends Seeder
{
    public function run()
    {
        // Get sample users
        $clients = User::where('role', 'client')->take(5)->get();
        $providers = User::where('role', 'service_provider')->take(3)->get();
        
        foreach ($clients as $client) {
            // Create sample notifications for clients
            InAppNotification::create([
                'user_id' => $client->id,
                'title' => 'Welcome to HireMe!',
                'message' => 'Thank you for joining our platform. Start browsing services to book your first appointment.',
                'type' => 'info',
                'category' => 'general',
                'is_read' => false,
            ]);
            
            // If client has appointments, create related notifications
            $appointment = Appointment::where('client_id', $client->id)->first();
            if ($appointment) {
                InAppNotification::create([
                    'user_id' => $client->id,
                    'title' => 'Appointment Confirmed',
                    'message' => 'Your appointment for ' . $appointment->service->title . ' has been confirmed.',
                    'type' => 'success',
                    'category' => 'appointment',
                    'appointment_id' => $appointment->id,
                    'action_url' => '/client/appointments/' . $appointment->id,
                    'is_read' => rand(0, 1),
                ]);
            }
        }
        
        foreach ($providers as $provider) {
            InAppNotification::create([
                'user_id' => $provider->id,
                'title' => 'Profile Verification Pending',
                'message' => 'Please complete your profile verification to start receiving bookings.',
                'type' => 'warning',
                'category' => 'system',
                'action_url' => '/provider/profile',
                'is_read' => false,
            ]);
        }
        
        $this->command->info('Created sample notifications');
    }
}
```

---

## Artisan Commands

### 1. Notification Cleanup Command

**File:** `app/Console/Commands/CleanupNotifications.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InAppNotification;
use Carbon\Carbon;

class CleanupNotifications extends Command
{
    protected $signature = 'notifications:cleanup {--days=30 : Days to keep notifications}';
    protected $description = 'Clean up old in-app notifications';

    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $count = InAppNotification::where('created_at', '<', $cutoffDate)
            ->where('is_read', true)
            ->delete();
            
        $this->info("Cleaned up {$count} old notifications (older than {$days} days)");
        
        return 0;
    }
}
```

### 2. Notification Statistics Command

**File:** `app/Console/Commands/NotificationStats.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InAppNotification;
use App\Models\User;

class NotificationStats extends Command
{
    protected $signature = 'notifications:stats';
    protected $description = 'Display notification statistics';

    public function handle()
    {
        $this->info('Notification Statistics');
        $this->line('========================');
        
        // Total notifications
        $total = InAppNotification::count();
        $this->line("Total notifications: {$total}");
        
        // Unread notifications
        $unread = InAppNotification::where('is_read', false)->count();
        $this->line("Unread notifications: {$unread}");
        
        // By category
        $this->line("\nBy Category:");
        $categories = InAppNotification::selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->get();
            
        foreach ($categories as $category) {
            $this->line("  {$category->category}: {$category->count}");
        }
        
        // By type
        $this->line("\nBy Type:");
        $types = InAppNotification::selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->get();
            
        foreach ($types as $type) {
            $this->line("  {$type->type}: {$type->count}");
        }
        
        // Recent activity (last 7 days)
        $recent = InAppNotification::where('created_at', '>=', now()->subDays(7))->count();
        $this->line("\nRecent activity (7 days): {$recent}");
        
        return 0;
    }
}
```

### 3. Send Test Notification Command

**File:** `app/Console/Commands/SendTestNotification.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\NotificationService;

class SendTestNotification extends Command
{
    protected $signature = 'notifications:test {email : User email to send test notification}';
    protected $description = 'Send a test notification to a user';

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found");
            return 1;
        }
        
        try {
            $this->notificationService->sendTestNotification($user);
            $this->info("Test notification sent to {$user->email}");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to send test notification: " . $e->getMessage());
            return 1;
        }
    }
}
```

---

## Queue Jobs

### 1. Process Notification Job

**File:** `app/Jobs/ProcessNotificationJob.php`

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Services\NotificationService;

class ProcessNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1 min, 5 min, 15 min

    protected $notificationType;
    protected $recipientId;
    protected $data;
    protected $channels;

    public function __construct(string $notificationType, int $recipientId, array $data, array $channels = ['email', 'app'])
    {
        $this->notificationType = $notificationType;
        $this->recipientId = $recipientId;
        $this->data = $data;
        $this->channels = $channels;
        
        // Set queue based on notification priority
        $this->onQueue($this->getQueueForNotificationType($notificationType));
    }

    public function handle(NotificationService $notificationService)
    {
        $recipient = User::find($this->recipientId);
        
        if (!$recipient) {
            \Log::warning("Notification recipient not found: {$this->recipientId}");
            return;
        }

        $notificationService->sendAppointmentNotification(
            $this->notificationType,
            $recipient,
            $this->data,
            in_array('email', $this->channels),
            in_array('app', $this->channels)
        );
    }

    public function failed(\Throwable $exception)
    {
        \Log::error("Notification job failed", [
            'type' => $this->notificationType,
            'recipient_id' => $this->recipientId,
            'error' => $exception->getMessage(),
            'data' => $this->data
        ]);
    }

    private function getQueueForNotificationType(string $type): string
    {
        $highPriorityTypes = [
            'appointment_cancelled',
            'appointment_declined',
            'payment_received',
            'emergency_notification'
        ];

        return in_array($type, $highPriorityTypes) ? 'high_priority' : 'notifications';
    }
}
```

---

## API Routes

### Notification API Routes

**File:** `routes/api.php` (additions)

```php
// Notification routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [NotificationController::class, 'delete'])->name('delete');
        Route::post('/preferences', [NotificationController::class, 'updatePreferences'])->name('update-preferences');
        Route::get('/preferences', [NotificationController::class, 'getPreferences'])->name('get-preferences');
    });
});
```

This migration guide provides all the necessary database schemas, models, configurations, and supporting files needed to implement the comprehensive notification system. The next step would be to create the service classes and controllers that will use this foundation.