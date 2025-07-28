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
    const TYPE_SERVICE_CREATED = 'service_created';
    const TYPE_SERVICE_UPDATED = 'service_updated';
    const TYPE_SERVICE_ACTIVATED = 'service_activated';
    const TYPE_SERVICE_DEACTIVATED = 'service_deactivated';
    const TYPE_SERVICE_DELETED = 'service_deleted';

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
            self::TYPE_SERVICE_CREATED => 'Service created',
            self::TYPE_SERVICE_UPDATED => 'Service updated',
            self::TYPE_SERVICE_ACTIVATED => 'Service activated',
            self::TYPE_SERVICE_DEACTIVATED => 'Service deactivated',
            self::TYPE_SERVICE_DELETED => 'Service deleted',
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
