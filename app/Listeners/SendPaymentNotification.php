<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendPaymentNotification implements ShouldQueue
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
    public function handle(PaymentReceived $event): void
    {
        $appointment = $event->appointment;
        $payment = $event->payment;
        $invoice = $event->invoice;

        Log::info("Processing payment received notification", [
            'appointment_id' => $appointment->id,
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'client_id' => $appointment->client_id,
            'provider_id' => $appointment->provider_id
        ]);

        $baseData = [
            'appointment' => $appointment,
            'payment' => $payment,
            'invoice' => $invoice,
            'appointment_id' => $appointment->id,
            'payment_id' => $payment->id,
            'service_name' => $appointment->service->title,
            'provider_name' => $appointment->provider->full_name,
            'client_name' => $appointment->client->full_name,
            'appointment_date' => $appointment->appointment_date->format('M j, Y'),
            'appointment_time' => $appointment->appointment_time,
            'payment_amount' => $payment->amount,
            'payment_date' => $payment->created_at->format('M j, Y g:i A'),
            'transaction_id' => $payment->stripe_payment_intent_id ?? $payment->id,
        ];

        // Send payment receipt to client
        $this->notificationService->sendAppointmentNotification(
            'payment_receipt',
            $appointment->client,
            array_merge($baseData, [
                'receipt_type' => 'client'
            ])
        );

        // Send payment confirmation to provider
        $this->notificationService->sendAppointmentNotification(
            'payment_confirmed',
            $appointment->provider,
            array_merge($baseData, [
                'receipt_type' => 'provider'
            ])
        );
    }

    public function failed(PaymentReceived $event, $exception)
    {
        Log::error("Payment notification failed", [
            'appointment_id' => $event->appointment->id,
            'payment_id' => $event->payment->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}