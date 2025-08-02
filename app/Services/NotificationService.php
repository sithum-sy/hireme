<?php

namespace App\Services;

use App\Models\User;
use App\Models\InAppNotification;
use App\Models\Appointment;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * NotificationService - Multi-channel notification system with user preferences
 * 
 * Manages in-app notifications, email notifications, and user notification preferences.
 * Implements notification throttling, preference checking, and multiple delivery channels
 * to ensure users receive appropriate notifications based on their settings.
 */
class NotificationService
{
    /**
     * Send service-related notification
     */
    public function sendServiceNotification(
        string $type,
        User $recipient,
        array $data,
        bool $sendEmail = false,
        bool $sendInApp = true
    ) {
        try {
            // Check if user has notifications enabled
            if (!$this->canReceiveNotifications($recipient)) {
                Log::info("User has notifications disabled", ['user_id' => $recipient->id]);
                return false;
            }

            $results = [
                'email' => false,
                'app' => false
            ];

            if ($sendInApp && $this->shouldSendInApp($recipient, $type)) {
                $results['app'] = $this->createInAppNotification($type, $recipient, $data);
            }

            Log::info("Service notification processed", [
                'type' => $type,
                'recipient' => $recipient->id,
                'results' => $results
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error("Service notification sending failed", [
                'type' => $type,
                'recipient' => $recipient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Send quote-related notification
     */
    public function sendQuoteNotification(
        string $type,
        User $recipient,
        array $data,
        bool $sendEmail = true,
        bool $sendInApp = true
    ) {
        try {
            // Check if user has notifications enabled
            if (!$this->canReceiveNotifications($recipient)) {
                Log::info("User has notifications disabled", ['user_id' => $recipient->id]);
                return false;
            }

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

            Log::info("Quote notification processed", [
                'type' => $type,
                'recipient' => $recipient->id,
                'results' => $results
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error("Quote notification sending failed", [
                'type' => $type,
                'recipient' => $recipient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Send notification through multiple channels
     */
    public function sendAppointmentNotification(
        string $type,
        User $recipient,
        array $data,
        bool $sendEmail = true,
        bool $sendInApp = true
    ) {
        try {
            // Check if user has notifications enabled
            if (!$this->canReceiveNotifications($recipient)) {
                Log::info("User has notifications disabled", ['user_id' => $recipient->id]);
                return false;
            }

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

            // Special handling for AppointmentRequestReceivedMail which needs recipient type
            if ($mailClass === \App\Mail\AppointmentRequestReceivedMail::class) {
                $recipientType = $recipient->role === 'service_provider' ? 'provider' : 'client';
                Mail::to($recipient->email)->send(new $mailClass($data['appointment'], $recipientType));
            } else {
                Mail::to($recipient->email)->send(new $mailClass($data));
            }

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
                'service_id' => $data['service_id'] ?? null,
                'action_url' => $this->generateActionUrl($type, $data, $recipient->role),
                'metadata' => $this->getNotificationMetadata($type, $data),
            ]);

            Log::info("In-app notification created", [
                'id' => $notification->id,
                'type' => $type,
                'recipient' => $recipient->id
            ]);

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
     * Check if email should be sent for this notification type
     */
    private function shouldSendEmail(User $recipient, string $type): bool
    {
        return $recipient->email_notifications_enabled ?? true;
    }

    /**
     * Check if in-app notification should be sent for this notification type
     */
    private function shouldSendInApp(User $recipient, string $type): bool
    {
        return $recipient->app_notifications_enabled ?? true;
    }

    /**
     * Get mail class for notification type and role
     */
    private function getMailClass(string $type, string $role): ?string
    {
        $templates = $this->getEmailTemplates();

        return $templates[$type][$role] ??
            $templates[$type]['default'] ??
            null;
    }

    /**
     * Get in-app template for notification type and role
     */
    private function getInAppTemplate(string $type, string $role): ?array
    {
        $templates = $this->getInAppTemplates();

        return $templates[$type][$role] ??
            $templates[$type]['default'] ??
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
            $rendered = str_replace('{appointment_time}', \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A'), $rendered);
        }

        // Handle quote-related placeholders
        if (isset($data['quote'])) {
            $quote = $data['quote'];
            $rendered = str_replace('{service_name}', $quote->service->title ?? 'Service', $rendered);
            $rendered = str_replace('{service_title}', $quote->service->title ?? 'Service', $rendered);
            $rendered = str_replace('{client_name}', $quote->client->full_name ?? 'Client', $rendered);
            $rendered = str_replace('{provider_name}', $quote->provider->full_name ?? 'Provider', $rendered);
            $rendered = str_replace('{quote_number}', $quote->quote_number ?? '', $rendered);
            $rendered = str_replace('{quoted_price}', $quote->quoted_price ? 'Rs. ' . number_format($quote->quoted_price) : 'Price pending', $rendered);
        }

        // Handle service-related placeholders
        if (isset($data['service'])) {
            $service = $data['service'];
            $rendered = str_replace('{service_title}', $service->title ?? 'Service', $rendered);
            $rendered = str_replace('{service_category}', $service->category->name ?? 'Category', $rendered);
            $rendered = str_replace('{service_price}', 'Rs. ' . number_format($service->base_price ?? 0), $rendered);
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
        $serviceId = $data['service_id'] ?? null;

        switch ($type) {
            case 'appointment_request_received':
            case 'appointment_created':
            case 'appointment_confirmed':
            case 'appointment_declined':
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
            case 'quote_request_sent':
            case 'quote_request_received':
            case 'quote_response_received':
            case 'quote_declined':
            case 'quote_withdrawn':
            case 'quote_expired':
                if ($quoteId) {
                    return $role === 'client'
                        ? "/client/quotes/{$quoteId}"
                        : "/provider/quotes/{$quoteId}";
                }
                break;

            case 'service_created':
            case 'service_updated':
            case 'service_activated':
            case 'service_deactivated':
                if ($serviceId) {
                    return "/provider/services/{$serviceId}";
                }
                break;

            case 'service_deleted':
                return "/provider/services";
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

        if (isset($data['service'])) {
            $metadata['service_id'] = $data['service']->id;
            $metadata['service_status'] = $data['service']->is_active ? 'active' : 'inactive';
            $metadata['service_category'] = $data['service']->category->name ?? null;
        }

        return $metadata;
    }

    /**
     * Get email templates configuration
     */
    private function getEmailTemplates(): array
    {
        return [
            'appointment_request_received' => [
                'client' => \App\Mail\AppointmentRequestReceivedMail::class,
                'service_provider' => \App\Mail\AppointmentRequestReceivedMail::class,
            ],
            'appointment_created' => [
                'client' => \App\Mail\AppointmentBookingConfirmation::class,
                'service_provider' => \App\Mail\AppointmentProviderNotification::class,
            ],
            'appointment_confirmed' => [
                'client' => \App\Mail\AppointmentConfirmedMail::class,
            ],
            'appointment_declined' => [
                'client' => \App\Mail\AppointmentDeclinedMail::class,
            ],
            'appointment_cancelled' => [
                'client' => \App\Mail\AppointmentCancelledMail::class,
                'service_provider' => \App\Mail\AppointmentCancelledMail::class,
            ],
            'appointment_started' => [
                'client' => \App\Mail\AppointmentStartedMail::class,
            ],
            'appointment_completed' => [
                'client' => \App\Mail\AppointmentCompletedMail::class,
                'service_provider' => \App\Mail\AppointmentCompletedMail::class,
            ],
            'invoice_generated' => [
                'client' => \App\Mail\InvoiceGeneratedMail::class,
            ],
            'payment_receipt' => [
                'client' => \App\Mail\PaymentReceiptMail::class,
            ],
            'payment_confirmed' => [
                'service_provider' => \App\Mail\PaymentReceivedMail::class,
            ],
            'review_received' => [
                'default' => \App\Mail\ReviewReceivedMail::class,
            ],
            'appointment_reminder_24h' => [
                'client' => \App\Mail\AppointmentReminderMail::class,
                'service_provider' => \App\Mail\AppointmentReminderMail::class,
            ],
        ];
    }

    /**
     * Get in-app templates configuration
     */
    private function getInAppTemplates(): array
    {
        return [
            'appointment_request_received' => [
                'client' => [
                    'title' => 'Booking Request Submitted',
                    'message' => 'Your booking request for {service_name} has been submitted. The provider will respond within 24 hours.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
                'service_provider' => [
                    'title' => 'New Booking Request',
                    'message' => 'You have a new booking request for {service_name} from {client_name}.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
            ],
            'appointment_created' => [
                'client' => [
                    'title' => 'Booking Request Submitted',
                    'message' => 'Your booking request for {service_name} has been submitted. The provider will respond within 24 hours.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
                'service_provider' => [
                    'title' => 'New Booking Request',
                    'message' => 'You have a new booking request for {service_name} from {client_name}.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
            ],

            'appointment_confirmed' => [
                'client' => [
                    'title' => 'Appointment Confirmed',
                    'message' => 'Your appointment for {service_name} on {appointment_date} has been confirmed.',
                    'type' => 'success',
                    'category' => 'appointment',
                ],
            ],

            'appointment_declined' => [
                'client' => [
                    'title' => 'Appointment Declined',
                    'message' => 'Unfortunately, your appointment request for {service_name} has been declined.',
                    'type' => 'warning',
                    'category' => 'appointment',
                ],
            ],

            'appointment_cancelled' => [
                'client' => [
                    'title' => 'Appointment Cancelled',
                    'message' => 'Your appointment for {service_name} has been cancelled.',
                    'type' => 'warning',
                    'category' => 'appointment',
                ],
                'service_provider' => [
                    'title' => 'Appointment Cancelled',
                    'message' => 'The appointment for {service_name} with {client_name} has been cancelled.',
                    'type' => 'warning',
                    'category' => 'appointment',
                ],
            ],

            'appointment_started' => [
                'client' => [
                    'title' => 'Service Started',
                    'message' => 'Your {service_name} appointment has started. The provider is now on their way or working on your service.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
            ],

            'appointment_completed' => [
                'client' => [
                    'title' => 'Service Completed',
                    'message' => 'Your {service_name} appointment has been completed. Please make the necessary payments.',
                    'type' => 'success',
                    'category' => 'appointment',
                ],
                'service_provider' => [
                    'title' => 'Service Completed',
                    'message' => 'You have completed the {service_name} service for {client_name}.',
                    'type' => 'success',
                    'category' => 'appointment',
                ],
            ],

            'invoice_generated' => [
                'client' => [
                    'title' => 'Invoice Generated',
                    'message' => 'An invoice has been generated for your {service_name} appointment. Please review and pay.',
                    'type' => 'info',
                    'category' => 'payment',
                ],
            ],

            'payment_receipt' => [
                'client' => [
                    'title' => 'Payment Successful',
                    'message' => 'Your payment for {service_name} has been processed successfully. Receipt sent to your email.',
                    'type' => 'success',
                    'category' => 'payment',
                ],
            ],

            'payment_confirmed' => [
                'service_provider' => [
                    'title' => 'Payment Received',
                    'message' => 'Payment has been received for the {service_name} service with {client_name}. Earnings are now available.',
                    'type' => 'success',
                    'category' => 'payment',
                ],
            ],

            'review_received' => [
                'default' => [
                    'title' => 'New Review Received',
                    'message' => '{reviewer_name} left you a {rating}-star review for {service_name}. This appointment is now closed.',
                    'type' => 'info',
                    'category' => 'general',
                ],
            ],

            // Service management notifications
            'service_created' => [
                'service_provider' => [
                    'title' => 'Service Created Successfully',
                    'message' => 'Your service "{service_title}" has been created and is now live.',
                    'type' => 'success',
                    'category' => 'general',
                ],
            ],

            'service_updated' => [
                'service_provider' => [
                    'title' => 'Service Updated Successfully',
                    'message' => 'Your service "{service_title}" has been updated with the latest changes.',
                    'type' => 'info',
                    'category' => 'general',
                ],
            ],

            'service_activated' => [
                'service_provider' => [
                    'title' => 'Service Activated',
                    'message' => 'Your service "{service_title}" is now active and visible to clients.',
                    'type' => 'success',
                    'category' => 'general',
                ],
            ],

            'service_deactivated' => [
                'service_provider' => [
                    'title' => 'Service Deactivated',
                    'message' => 'Your service "{service_title}" has been deactivated and is no longer visible to clients.',
                    'type' => 'warning',
                    'category' => 'general',
                ],
            ],

            'service_deleted' => [
                'service_provider' => [
                    'title' => 'Service Deleted',
                    'message' => 'Your service "{service_title}" has been permanently deleted.',
                    'type' => 'error',
                    'category' => 'general',
                ],
            ],

            'appointment_reminder_24h' => [
                'client' => [
                    'title' => 'Appointment Reminder',
                    'message' => 'Reminder: Your {service_name} appointment is tomorrow at {appointment_time}.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
                'service_provider' => [
                    'title' => 'Appointment Reminder',
                    'message' => 'Reminder: You have an appointment with {client_name} tomorrow at {appointment_time}.',
                    'type' => 'info',
                    'category' => 'appointment',
                ],
            ],

            // Quote notification templates
            'quote_request_sent' => [
                'client' => [
                    'title' => 'Quote Request Sent',
                    'message' => 'Your quote request for {service_name} has been sent successfully. The provider will respond within 24 hours.',
                    'type' => 'info',
                    'category' => 'general',
                ],
            ],

            'quote_request_received' => [
                'service_provider' => [
                    'title' => 'New Quote Request',
                    'message' => 'You have a new quote request for {service_name} from {client_name}. Please review and respond.',
                    'type' => 'info',
                    'category' => 'general',
                ],
            ],

            'quote_response_received' => [
                'client' => [
                    'title' => 'Quote Response Received',
                    'message' => '{provider_name} has responded to your quote request for {service_name} with a price of {quoted_price}.',
                    'type' => 'success',
                    'category' => 'general',
                ],
            ],

            'quote_accepted' => [
                'service_provider' => [
                    'title' => 'Quote Accepted',
                    'message' => '{client_name} has accepted your quote for {service_name} ({quoted_price}). An appointment will be created automatically.',
                    'type' => 'success',
                    'category' => 'general',
                ],
            ],

            'quote_declined' => [
                'service_provider' => [
                    'title' => 'Quote Declined',
                    'message' => '{client_name} has declined your quote for {service_name}. You can view other quote requests or adjust your pricing.',
                    'type' => 'warning',
                    'category' => 'general',
                ],
            ],

            'quote_withdrawn' => [
                'client' => [
                    'title' => 'Quote Withdrawn',
                    'message' => '{provider_name} has withdrawn their quote for {service_name}. You can request quotes from other providers.',
                    'type' => 'warning',
                    'category' => 'general',
                ],
            ],

            'quote_expired' => [
                'client' => [
                    'title' => 'Quote Expired',
                    'message' => 'Your quote request for {service_name} has expired. You can submit a new quote request if still needed.',
                    'type' => 'warning',
                    'category' => 'general',
                ],
                'service_provider' => [
                    'title' => 'Quote Expired',
                    'message' => 'Your quote for {service_name} with {client_name} has expired and is no longer valid.',
                    'type' => 'info',
                    'category' => 'general',
                ],
            ],
        ];
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
            false, // Don't send email for test
            true   // Send in-app notification
        );
    }
}
