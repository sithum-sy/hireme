<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentProviderNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Appointment Request - Action Required',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.provider-notification',
            with: [
                'appointment' => $this->appointment,
                'providerName' => $this->appointment->provider->first_name,
                'clientName' => $this->appointment->client->first_name . ' ' . $this->appointment->client->last_name,  
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'totalPrice' => $this->appointment->total_price,
                'clientPhone' => $this->appointment->client_phone,
                'clientEmail' => $this->appointment->client_email,
                'location' => $this->getLocationText(),
                'confirmationCode' => $this->appointment->confirmation_code,
                'acceptUrl' => config('app.url') . '/provider/appointments/' . $this->appointment->id . '/accept',
                'declineUrl' => config('app.url') . '/provider/appointments/' . $this->appointment->id . '/decline',
                'appointmentUrl' => config('app.url') . '/provider/appointments/' . $this->appointment->id,
                'expiresAt' => $this->appointment->expires_at,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get formatted location text
     */
    private function getLocationText(): string
    {
        switch ($this->appointment->location_type) {
            case 'client_address':
                return 'At client location: ' . ($this->appointment->client_address ?: 'Address provided separately');
            case 'provider_location':
                return 'At your business location';
            case 'custom_location':
                return 'Custom location: ' . ($this->appointment->client_address ?: 'Location to be determined');
            default:
                return 'Location to be determined';
        }
    }
}
