<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentRequestReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;
    public $recipientType; // 'client' or 'provider'

    public function __construct(Appointment $appointment, string $recipientType)
    {
        $this->appointment = $appointment;
        $this->recipientType = $recipientType;
    }

    public function envelope(): Envelope
    {
        $subject = $this->recipientType === 'client'
            ? 'Appointment Request Submitted Successfully'
            : 'New Appointment Request Received';

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $view = $this->recipientType === 'client'
            ? 'emails.appointments.request-received-client'
            : 'emails.appointments.request-received-provider';

        $baseUrl = config('app.frontend_url', config('app.url'));
        $role = $this->recipientType === 'client' ? '/client' : '/provider';

        return new Content(
            view: $view,
            with: [
                'appointment' => $this->appointment,
                'clientName' => $this->appointment->client->first_name,
                'providerName' => $this->appointment->provider->first_name . ' ' . $this->appointment->provider->last_name,
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'totalPrice' => $this->appointment->total_price,
                'businessName' => $this->appointment->provider->provider_profile->business_name ?? null,
                'appointmentUrl' => $baseUrl . $role . '/appointments/' . $this->appointment->id,
                'dashboardUrl' => $baseUrl . $role . '/dashboard',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
