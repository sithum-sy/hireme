<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentBookingConfirmation extends Mailable implements ShouldQueue
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
            subject: 'Booking Request Received - Confirmation Pending',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.booking-confirmation',
            with: [
                'appointment' => $this->appointment,
                'clientName' => $this->appointment->client->first_name,
                'serviceName' => $this->appointment->service->title,
                'providerName' => $this->appointment->provider->first_name . ' ' . $this->appointment->provider->last_name,
                'businessName' => $this->appointment->provider->providerProfile->business_name ?? null,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'totalPrice' => $this->appointment->total_price,
                'confirmationCode' => $this->appointment->confirmation_code,
                'appointmentUrl' => config('app.url') . '/client/appointments/' . $this->appointment->id,
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
}
