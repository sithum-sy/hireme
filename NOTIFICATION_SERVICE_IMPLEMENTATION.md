# Notification Service Implementation
## Core Backend Services and Controllers

**Version:** 1.0  
**Prerequisites:** NOTIFICATION_SYSTEM_MIGRATION_GUIDE.md  
**Target:** Backend Development Team

---

## Core Service Classes

### 1. NotificationService.php

**File:** `app/Services/NotificationService.php`

```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\InAppNotification;
use App\Models\NotificationPreference;
use App\Models\Appointment;
use App\Jobs\ProcessNotificationJob;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Send notification through multiple channels
     */
    public function sendAppointmentNotification(
        string $type,
        User $recipient,
        array $data,
        bool $sendEmail = true,
        bool $sendInApp = true,
        bool $useQueue = true
    ) {
        try {
            // Check if user has notifications enabled
            if (!$this->canReceiveNotifications($recipient)) {
                Log::info("User has notifications disabled", ['user_id' => $recipient->id]);
                return false;
            }

            // Check quiet hours
            if ($this->isQuietHours($recipient)) {
                Log::info("Notification delayed due to quiet hours", [
                    'user_id' => $recipient->id,
                    'type' => $type
                ]);
                // Schedule for later
                $this->scheduleForLater($type, $recipient, $data, $sendEmail, $sendInApp);
                return true;
            }

            if ($useQueue) {
                // Dispatch to queue for async processing
                $channels = [];
                if ($sendEmail) $channels[] = 'email';
                if ($sendInApp) $channels[] = 'app';

                ProcessNotificationJob::dispatch($type, $recipient->id, $data, $channels);
            } else {
                // Process immediately
                $this->processNotification($type, $recipient, $data, $sendEmail, $sendInApp);
            }

            return true;

        } catch (\Exception $e) {
            Log::error("Notification sending failed", [
                'type' => $type,
                'recipient' => $recipient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Process notification immediately
     */
    public function processNotification(
        string $type,
        User $recipient,
        array $data,
        bool $sendEmail = true,
        bool $sendInApp = true
    ) {
        $results = [
            'email' => false,
            'app' => false
        ];

        if ($sendEmail && $this->shouldSendEmail($recipient, $type)) {
            $results['email'] = $this->sendEmailNotification($type, $recipient, $data);
        }

        if ($sendInApp && $this->shouldSendInApp($recipient, $type)) {
            $results['app'] = $this->createInAppNotification($type, $recipient, $data);
        }

        Log::info("Notification processed", [
            'type' => $type,
            'recipient' => $recipient->id,
            'results' => $results
        ]);

        return $results;
    }

    /**
     * Send email notification
     */
    private function sendEmailNotification(string $type, User $recipient, array $data): bool
    {
        try {
            $mailClass = $this->getMailClass($type, $recipient->role);
            
            if (!$mailClass) {
                Log::warning("No mail class found for notification type", [
                    'type' => $type,
                    'role' => $recipient->role
                ]);
                return false;
            }

            if (!class_exists($mailClass)) {
                Log::error("Mail class does not exist", ['class' => $mailClass]);
                return false;
            }

            Mail::to($recipient->email)->send(new $mailClass($data));

            Log::info("Email notification sent", [
                'type' => $type,
                'recipient' => $recipient->email,
                'class' => $mailClass
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("Email notification failed", [
                'type' => $type,
                'recipient' => $recipient->email,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Create in-app notification
     */
    private function createInAppNotification(string $type, User $recipient, array $data): bool
    {
        try {
            $template = $this->getInAppTemplate($type, $recipient->role);
            
            if (!$template) {
                Log::warning("No in-app template found for notification type", [
                    'type' => $type,
                    'role' => $recipient->role
                ]);
                return false;
            }

            $notification = InAppNotification::create([
                'user_id' => $recipient->id,
                'title' => $this->renderTemplate($template['title'], $data),
                'message' => $this->renderTemplate($template['message'], $data),
                'type' => $template['type'],
                'category' => $template['category'],
                'appointment_id' => $data['appointment_id'] ?? null,
                'quote_id' => $data['quote_id'] ?? null,
                'action_url' => $this->generateActionUrl($type, $data, $recipient->role),
                'metadata' => $this->getNotificationMetadata($type, $data),
            ]);

            Log::info("In-app notification created", [
                'id' => $notification->id,
                'type' => $type,
                'recipient' => $recipient->id
            ]);

            // Trigger real-time update if enabled
            $this->triggerRealTimeUpdate($recipient, $notification);

            return true;

        } catch (\Exception $e) {
            Log::error("In-app notification creation failed", [
                'type' => $type,
                'recipient' => $recipient->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Check if user can receive notifications
     */
    private function canReceiveNotifications(User $recipient): bool
    {
        return $recipient->is_active && 
               $recipient->email_verified_at !== null;
    }

    /**
     * Check if it's quiet hours for the user
     */
    private function isQuietHours(User $recipient): bool
    {
        if (!config('notifications.settings.quiet_hours.enabled')) {
            return false;
        }

        $userTimezone = $recipient->notification_timezone ?? 'Asia/Colombo';
        $now = Carbon::now($userTimezone);
        
        $quietHours = $recipient->notification_quiet_hours ?? [
            'start' => config('notifications.settings.quiet_hours.start'),
            'end' => config('notifications.settings.quiet_hours.end')
        ];

        $startTime = Carbon::createFromFormat('H:i', $quietHours['start'], $userTimezone);
        $endTime = Carbon::createFromFormat('H:i', $quietHours['end'], $userTimezone);

        // Handle quiet hours that span midnight
        if ($startTime->gt($endTime)) {
            return $now->gte($startTime) || $now->lte($endTime);
        }

        return $now->between($startTime, $endTime);
    }

    /**
     * Check if email should be sent for this notification type
     */
    private function shouldSendEmail(User $recipient, string $type): bool
    {
        if (!$recipient->email_notifications_enabled) {
            return false;
        }

        return NotificationPreference::isEnabled($recipient->id, $type, 'email');
    }

    /**
     * Check if in-app notification should be sent for this notification type
     */
    private function shouldSendInApp(User $recipient, string $type): bool
    {
        if (!$recipient->app_notifications_enabled) {
            return false;
        }

        return NotificationPreference::isEnabled($recipient->id, $type, 'app');
    }

    /**
     * Get mail class for notification type and role
     */
    private function getMailClass(string $type, string $role): ?string
    {
        $templates = config('notifications.templates');
        
        return $templates[$type]['email'][$role] ?? 
               $templates[$type]['email']['default'] ?? 
               null;
    }

    /**
     * Get in-app template for notification type and role
     */
    private function getInAppTemplate(string $type, string $role): ?array
    {
        $templates = config('notifications.templates');
        
        return $templates[$type]['app'][$role] ?? 
               $templates[$type]['app']['default'] ?? 
               null;
    }

    /**
     * Render template with data placeholders
     */
    private function renderTemplate(string $template, array $data): string
    {
        $rendered = $template;
        
        foreach ($data as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $rendered = str_replace('{' . $key . '}', $value, $rendered);
            }
        }

        // Handle special placeholders
        if (isset($data['appointment'])) {
            $appointment = $data['appointment'];
            $rendered = str_replace('{service_name}', $appointment->service->title ?? 'Service', $rendered);
            $rendered = str_replace('{client_name}', $appointment->client->full_name ?? 'Client', $rendered);
            $rendered = str_replace('{provider_name}', $appointment->provider->full_name ?? 'Provider', $rendered);
            $rendered = str_replace('{appointment_date}', $appointment->appointment_date->format('M j, Y'), $rendered);
            $rendered = str_replace('{appointment_time}', Carbon::parse($appointment->appointment_time)->format('g:i A'), $rendered);
        }

        return $rendered;
    }

    /**
     * Generate action URL for notification
     */
    private function generateActionUrl(string $type, array $data, string $role): ?string
    {
        $appointmentId = $data['appointment_id'] ?? null;
        $quoteId = $data['quote_id'] ?? null;

        switch ($type) {
            case 'appointment_created':
            case 'appointment_confirmed':
            case 'appointment_cancelled':
                if ($appointmentId) {
                    return $role === 'client' 
                        ? "/client/appointments/{$appointmentId}"
                        : "/provider/appointments/{$appointmentId}";
                }
                break;

            case 'invoice_generated':
            case 'payment_received':
                if ($appointmentId) {
                    return $role === 'client'
                        ? "/client/appointments/{$appointmentId}"
                        : "/provider/payments";
                }
                break;

            case 'quote_received':
            case 'quote_accepted':
                if ($quoteId) {
                    return $role === 'client'
                        ? "/client/quotes/{$quoteId}"
                        : "/provider/quotes/{$quoteId}";
                }
                break;
        }

        return null;
    }

    /**
     * Get notification metadata
     */
    private function getNotificationMetadata(string $type, array $data): array
    {
        $metadata = [
            'notification_type' => $type,
            'sent_at' => now()->toISOString(),
        ];

        if (isset($data['appointment'])) {
            $metadata['appointment_status'] = $data['appointment']->status;
            $metadata['service_id'] = $data['appointment']->service_id;
        }

        return $metadata;
    }

    /**
     * Trigger real-time update for notification
     */
    private function triggerRealTimeUpdate(User $recipient, InAppNotification $notification)
    {
        if (!config('notifications.realtime.enabled')) {
            return;
        }

        // Implement real-time notification (WebSocket, Pusher, etc.)
        // This is where you'd integrate with your real-time service
        Log::info("Real-time notification triggered", [
            'user_id' => $recipient->id,
            'notification_id' => $notification->id
        ]);
    }

    /**
     * Schedule notification for later (after quiet hours)
     */
    private function scheduleForLater(string $type, User $recipient, array $data, bool $sendEmail, bool $sendInApp)
    {
        $userTimezone = $recipient->notification_timezone ?? 'Asia/Colombo';
        $quietHours = $recipient->notification_quiet_hours ?? [
            'start' => config('notifications.settings.quiet_hours.start'),
            'end' => config('notifications.settings.quiet_hours.end')
        ];

        $endTime = Carbon::createFromFormat('H:i', $quietHours['end'], $userTimezone);
        
        // If end time is tomorrow, schedule for tomorrow
        if ($endTime->lt(Carbon::now($userTimezone))) {
            $endTime->addDay();
        }

        $channels = [];
        if ($sendEmail) $channels[] = 'email';
        if ($sendInApp) $channels[] = 'app';

        ProcessNotificationJob::dispatch($type, $recipient->id, $data, $channels)
            ->delay($endTime);
    }

    /**
     * Send test notification
     */
    public function sendTestNotification(User $user): bool
    {
        return $this->sendAppointmentNotification(
            'test_notification',
            $user,
            [
                'test_message' => 'This is a test notification from HireMe platform.',
                'sent_at' => now()->format('Y-m-d H:i:s')
            ],
            true,
            true,
            false // Send immediately, don't queue
        );
    }

    /**
     * Get notification statistics
     */
    public function getStatistics(User $user): array
    {
        return [
            'total_notifications' => InAppNotification::where('user_id', $user->id)->count(),
            'unread_notifications' => InAppNotification::where('user_id', $user->id)->unread()->count(),
            'notifications_today' => InAppNotification::where('user_id', $user->id)
                ->whereDate('created_at', today())
                ->count(),
            'notifications_this_week' => InAppNotification::where('user_id', $user->id)
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
        ];
    }

    /**
     * Bulk mark notifications as read
     */
    public function markAllAsRead(User $user, ?string $category = null): int
    {
        $query = InAppNotification::where('user_id', $user->id)
            ->where('is_read', false);

        if ($category) {
            $query->where('category', $category);
        }

        return $query->update(['is_read' => true]);
    }

    /**
     * Clean up old notifications
     */
    public function cleanupOldNotifications(int $days = 30): int
    {
        $cutoffDate = Carbon::now()->subDays($days);
        
        return InAppNotification::where('created_at', '<', $cutoffDate)
            ->where('is_read', true)
            ->delete();
    }
}
```

---

## Event Listeners

### 1. SendAppointmentStatusNotification.php

**File:** `app/Listeners/SendAppointmentStatusNotification.php`

```php
<?php

namespace App\Listeners;

use App\Events\AppointmentStatusChanged;
use App\Services\NotificationService;
use App\Models\NotificationPreference;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendAppointmentStatusNotification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function handle(AppointmentStatusChanged $event)
    {
        $appointment = $event->appointment;
        $oldStatus = $event->oldStatus;
        $newStatus = $event->newStatus;

        Log::info("Processing appointment status change notification", [
            'appointment_id' => $appointment->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus
        ]);

        // Get notifications to send based on status change
        $notifications = $this->getNotificationsForStatusChange($appointment, $oldStatus, $newStatus);

        foreach ($notifications as $notification) {
            $this->notificationService->sendAppointmentNotification(
                $notification['type'],
                $notification['recipient'],
                [
                    'appointment' => $appointment,
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'service_name' => $appointment->service->title,
                    'client_name' => $appointment->client->full_name,
                    'provider_name' => $appointment->provider->full_name,
                    'appointment_date' => $appointment->appointment_date->format('M j, Y'),
                    'appointment_time' => $appointment->appointment_time,
                ]
            );
        }
    }

    private function getNotificationsForStatusChange($appointment, string $oldStatus, string $newStatus): array
    {
        $notifications = [];

        switch ($newStatus) {
            case 'confirmed':
                if ($oldStatus === 'pending') {
                    $notifications[] = [
                        'type' => NotificationPreference::TYPE_APPOINTMENT_CONFIRMED,
                        'recipient' => $appointment->client
                    ];
                }
                break;

            case 'cancelled_by_provider':
                $notifications[] = [
                    'type' => NotificationPreference::TYPE_APPOINTMENT_CANCELLED,
                    'recipient' => $appointment->client
                ];
                break;

            case 'cancelled_by_client':
                $notifications[] = [
                    'type' => NotificationPreference::TYPE_APPOINTMENT_CANCELLED,
                    'recipient' => $appointment->provider
                ];
                break;

            case 'in_progress':
                if ($oldStatus === 'confirmed') {
                    $notifications[] = [
                        'type' => NotificationPreference::TYPE_APPOINTMENT_STARTED,
                        'recipient' => $appointment->client
                    ];
                }
                break;

            case 'completed':
                if (in_array($oldStatus, ['confirmed', 'in_progress'])) {
                    $notifications[] = [
                        'type' => NotificationPreference::TYPE_APPOINTMENT_COMPLETED,
                        'recipient' => $appointment->client
                    ];
                    $notifications[] = [
                        'type' => NotificationPreference::TYPE_APPOINTMENT_COMPLETED,
                        'recipient' => $appointment->provider
                    ];
                }
                break;

            case 'expired':
                $notifications[] = [
                    'type' => 'appointment_expired',
                    'recipient' => $appointment->client
                ];
                $notifications[] = [
                    'type' => 'appointment_expired',
                    'recipient' => $appointment->provider
                ];
                break;
        }

        return $notifications;
    }

    public function failed(AppointmentStatusChanged $event, $exception)
    {
        Log::error("Appointment status notification failed", [
            'appointment_id' => $event->appointment->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
```

### 2. SendInvoiceNotification.php

**File:** `app/Listeners/SendInvoiceNotification.php`

```php
<?php

namespace App\Listeners;

use App\Events\InvoiceGenerated;
use App\Services\NotificationService;
use App\Models\NotificationPreference;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendInvoiceNotification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function handle(InvoiceGenerated $event)
    {
        $invoice = $event->invoice;
        $appointment = $invoice->appointment;

        // Notify client about new invoice
        $this->notificationService->sendAppointmentNotification(
            NotificationPreference::TYPE_INVOICE_GENERATED,
            $appointment->client,
            [
                'invoice' => $invoice,
                'appointment' => $appointment,
                'appointment_id' => $appointment->id,
                'invoice_amount' => $invoice->total_amount,
                'service_name' => $appointment->service->title,
                'provider_name' => $appointment->provider->full_name,
            ]
        );
    }
}
```

### 3. SendPaymentNotification.php

**File:** `app/Listeners/SendPaymentNotification.php`

```php
<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Services\NotificationService;
use App\Models\NotificationPreference;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendPaymentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function handle(PaymentReceived $event)
    {
        $payment = $event->payment;
        $appointment = $payment->appointment;

        // Notify provider about payment received
        $this->notificationService->sendAppointmentNotification(
            NotificationPreference::TYPE_PAYMENT_RECEIVED,
            $appointment->provider,
            [
                'payment' => $payment,
                'appointment' => $appointment,
                'appointment_id' => $appointment->id,
                'payment_amount' => $payment->amount,
                'service_name' => $appointment->service->title,
                'client_name' => $appointment->client->full_name,
            ]
        );

        // Notify client about payment confirmation
        $this->notificationService->sendAppointmentNotification(
            'payment_confirmed',
            $appointment->client,
            [
                'payment' => $payment,
                'appointment' => $appointment,
                'appointment_id' => $appointment->id,
                'payment_amount' => $payment->amount,
                'service_name' => $appointment->service->title,
                'provider_name' => $appointment->provider->full_name,
            ]
        );
    }
}
```

---

## API Controllers

### 1. NotificationController.php

**File:** `app/Http/Controllers/API/NotificationController.php`

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use App\Models\NotificationPreference;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get user's notifications with pagination and filtering
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:50',
            'unread_only' => 'boolean',
            'category' => 'string|in:appointment,payment,system,general',
            'type' => 'string|in:info,success,warning,error',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = InAppNotification::where('user_id', Auth::id())
                ->with(['appointment.service', 'quote'])
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->boolean('unread_only')) {
                $query->where('is_read', false);
            }

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            $perPage = $request->get('per_page', 20);
            $notifications = $query->paginate($perPage);

            // Get unread count
            $unreadCount = InAppNotification::where('user_id', Auth::id())
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'unread_count' => $unreadCount,
                'statistics' => $this->notificationService->getStatistics(Auth::user())
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get unread notification count
     */
    public function unreadCount()
    {
        try {
            $count = InAppNotification::where('user_id', Auth::id())
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'count' => $count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get unread count'
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(InAppNotification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read'
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'string|in:appointment,payment,system,general',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $count = $this->notificationService->markAllAsRead(
                Auth::user(),
                $request->category
            );

            return response()->json([
                'success' => true,
                'message' => "Marked {$count} notifications as read"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notifications as read'
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function delete(InAppNotification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification'
            ], 500);
        }
    }

    /**
     * Get user's notification preferences
     */
    public function getPreferences()
    {
        try {
            $user = Auth::user();
            $preferences = [];

            foreach (NotificationPreference::getNotificationTypes() as $type => $description) {
                $preference = NotificationPreference::getPreference($user->id, $type);
                
                $preferences[] = [
                    'type' => $type,
                    'description' => $description,
                    'email_enabled' => $preference ? $preference->email_enabled : true,
                    'app_enabled' => $preference ? $preference->app_enabled : true,
                    'sms_enabled' => $preference ? $preference->sms_enabled : false,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'preferences' => $preferences,
                    'global_settings' => [
                        'email_notifications_enabled' => $user->email_notifications_enabled,
                        'app_notifications_enabled' => $user->app_notifications_enabled,
                        'sms_notifications_enabled' => $user->sms_notifications_enabled,
                        'notification_timezone' => $user->notification_timezone,
                        'notification_quiet_hours' => $user->notification_quiet_hours,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get notification preferences'
            ], 500);
        }
    }

    /**
     * Update user's notification preferences
     */
    public function updatePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'global_settings' => 'array',
            'global_settings.email_notifications_enabled' => 'boolean',
            'global_settings.app_notifications_enabled' => 'boolean',
            'global_settings.sms_notifications_enabled' => 'boolean',
            'global_settings.notification_timezone' => 'string|timezone',
            'global_settings.notification_quiet_hours' => 'array',
            'global_settings.notification_quiet_hours.start' => 'required_with:global_settings.notification_quiet_hours|date_format:H:i',
            'global_settings.notification_quiet_hours.end' => 'required_with:global_settings.notification_quiet_hours|date_format:H:i',
            'preferences' => 'array',
            'preferences.*.type' => 'required|string',
            'preferences.*.email_enabled' => 'boolean',
            'preferences.*.app_enabled' => 'boolean',
            'preferences.*.sms_enabled' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();

            // Update global settings
            if ($request->has('global_settings')) {
                $globalSettings = $request->global_settings;
                $updateData = [];

                if (isset($globalSettings['email_notifications_enabled'])) {
                    $updateData['email_notifications_enabled'] = $globalSettings['email_notifications_enabled'];
                }
                if (isset($globalSettings['app_notifications_enabled'])) {
                    $updateData['app_notifications_enabled'] = $globalSettings['app_notifications_enabled'];
                }
                if (isset($globalSettings['sms_notifications_enabled'])) {
                    $updateData['sms_notifications_enabled'] = $globalSettings['sms_notifications_enabled'];
                }
                if (isset($globalSettings['notification_timezone'])) {
                    $updateData['notification_timezone'] = $globalSettings['notification_timezone'];
                }
                if (isset($globalSettings['notification_quiet_hours'])) {
                    $updateData['notification_quiet_hours'] = $globalSettings['notification_quiet_hours'];
                }

                if (!empty($updateData)) {
                    $user->update($updateData);
                }
            }

            // Update specific notification preferences
            if ($request->has('preferences')) {
                foreach ($request->preferences as $preferenceData) {
                    NotificationPreference::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'notification_type' => $preferenceData['type'],
                        ],
                        [
                            'email_enabled' => $preferenceData['email_enabled'] ?? true,
                            'app_enabled' => $preferenceData['app_enabled'] ?? true,
                            'sms_enabled' => $preferenceData['sms_enabled'] ?? false,
                        ]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification preferences updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification preferences',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send test notification
     */
    public function sendTest()
    {
        try {
            $result = $this->notificationService->sendTestNotification(Auth::user());

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Test notification sent successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send test notification'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test notification',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
```

---

## Mail Classes

### 1. AppointmentConfirmedMail.php

**File:** `app/Mail/AppointmentConfirmedMail.php`

```php
<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;

    public function __construct(array $data)
    {
        $this->appointment = $data['appointment'];
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Confirmed - ' . $this->appointment->service->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.confirmed',
            with: [
                'appointment' => $this->appointment,
                'clientName' => $this->appointment->client->first_name,
                'serviceName' => $this->appointment->service->title,
                'providerName' => $this->appointment->provider->full_name,
                'businessName' => $this->appointment->provider->providerProfile->business_name ?? null,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'totalPrice' => $this->appointment->total_price,
                'appointmentUrl' => config('app.url') . '/client/appointments/' . $this->appointment->id,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
```

### 2. AppointmentDeclinedMail.php

**File:** `app/Mail/AppointmentDeclinedMail.php`

```php
<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentDeclinedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;

    public function __construct(array $data)
    {
        $this->appointment = $data['appointment'];
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Request Declined - ' . $this->appointment->service->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.declined',
            with: [
                'appointment' => $this->appointment,
                'clientName' => $this->appointment->client->first_name,
                'serviceName' => $this->appointment->service->title,
                'providerName' => $this->appointment->provider->full_name,
                'businessName' => $this->appointment->provider->providerProfile->business_name ?? null,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'searchUrl' => config('app.url') . '/client/services',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
```

### 3. InvoiceGeneratedMail.php

**File:** `app/Mail/InvoiceGeneratedMail.php`

```php
<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceGeneratedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $invoice;
    public $appointment;

    public function __construct(array $data)
    {
        $this->invoice = $data['invoice'];
        $this->appointment = $data['appointment'];
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice #' . $this->invoice->invoice_number . ' - Payment Required',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoices.generated',
            with: [
                'invoice' => $this->invoice,
                'appointment' => $this->appointment,
                'clientName' => $this->appointment->client->first_name,
                'serviceName' => $this->appointment->service->title,
                'providerName' => $this->appointment->provider->full_name,
                'businessName' => $this->appointment->provider->providerProfile->business_name ?? null,
                'invoiceAmount' => $this->invoice->total_amount,
                'dueDate' => $this->invoice->due_date,
                'paymentUrl' => config('app.url') . '/client/appointments/' . $this->appointment->id,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
```

---

## Event Service Provider Updates

### EventServiceProvider.php

**File:** `app/Providers/EventServiceProvider.php` (additions)

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Existing events...
        
        // Appointment events
        \App\Events\AppointmentStatusChanged::class => [
            \App\Listeners\SendAppointmentStatusNotification::class,
        ],
        
        // Invoice events
        \App\Events\InvoiceGenerated::class => [
            \App\Listeners\SendInvoiceNotification::class,
        ],
        
        // Payment events
        \App\Events\PaymentReceived::class => [
            \App\Listeners\SendPaymentNotification::class,
        ],
        
        // Quote events
        \App\Events\QuoteStatusChanged::class => [
            \App\Listeners\SendQuoteNotification::class,
        ],
        
        // Reschedule events
        \App\Events\RescheduleRequestCreated::class => [
            \App\Listeners\SendRescheduleRequestNotification::class,
        ],
        
        \App\Events\RescheduleRequestResponded::class => [
            \App\Listeners\SendRescheduleResponseNotification::class,
        ],
        
        // Review events
        \App\Events\ReviewSubmitted::class => [
            \App\Listeners\SendReviewNotification::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
```

This comprehensive service implementation provides the core backend functionality for the notification system. The next step would be to create the missing event classes and integrate these services into the existing appointment flow controllers.