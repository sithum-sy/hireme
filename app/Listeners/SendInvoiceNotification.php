<?php

namespace App\Listeners;

use App\Events\InvoiceGenerated;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendInvoiceNotification implements ShouldQueue
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
    public function handle(InvoiceGenerated $event): void
    {
        $appointment = $event->appointment;
        $invoice = $event->invoice;

        Log::info("Processing invoice generated notification", [
            'appointment_id' => $appointment->id,
            'invoice_id' => $invoice->id,
            'client_id' => $appointment->client_id
        ]);

        // Send notification to client about invoice generation
        $this->notificationService->sendAppointmentNotification(
            'invoice_generated',
            $appointment->client,
            [
                'appointment' => $appointment,
                'invoice' => $invoice,
                'appointment_id' => $appointment->id,
                'invoice_id' => $invoice->id,
                'service_name' => $appointment->service->title,
                'provider_name' => $appointment->provider->full_name,
                'client_name' => $appointment->client->full_name,
                'appointment_date' => $appointment->appointment_date->format('M j, Y'),
                'appointment_time' => $appointment->appointment_time,
                'invoice_amount' => $invoice->total_amount,
                'due_date' => $invoice->due_date->format('M j, Y'),
            ]
        );
    }

    public function failed(InvoiceGenerated $event, $exception)
    {
        Log::error("Invoice notification failed", [
            'appointment_id' => $event->appointment->id,
            'invoice_id' => $event->invoice->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}