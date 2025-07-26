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

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(AppointmentStatusChanged $event): void
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
                        'type' => 'appointment_confirmed',
                        'recipient' => $appointment->client
                    ];
                }
                break;

            case 'cancelled_by_provider':
                $notifications[] = [
                    'type' => 'appointment_cancelled',
                    'recipient' => $appointment->client
                ];
                break;

            case 'cancelled_by_client':
                $notifications[] = [
                    'type' => 'appointment_cancelled',
                    'recipient' => $appointment->provider
                ];
                break;

            case 'in_progress':
                if ($oldStatus === 'confirmed') {
                    $notifications[] = [
                        'type' => 'appointment_started',
                        'recipient' => $appointment->client
                    ];
                }
                break;

            case 'completed':
                if (in_array($oldStatus, ['confirmed', 'in_progress'])) {
                    $notifications[] = [
                        'type' => 'appointment_completed',
                        'recipient' => $appointment->client
                    ];
                    $notifications[] = [
                        'type' => 'appointment_completed',
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

            // Add special case for provider declining
            case 'cancelled_by_provider':
                if ($oldStatus === 'pending') {
                    $notifications[] = [
                        'type' => 'appointment_declined',
                        'recipient' => $appointment->client
                    ];
                } else {
                    $notifications[] = [
                        'type' => 'appointment_cancelled',
                        'recipient' => $appointment->client
                    ];
                }
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
