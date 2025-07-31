<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;
    public $userType;

    /**
     * Create a new message instance.
     */
    public function __construct(array $data)
    {
        $this->appointment = $data['appointment'];
        $this->userType = $data['user_type'];
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->userType === 'client' 
            ? 'Reminder: Your appointment tomorrow - ' . $this->appointment->service->title
            : 'Reminder: Appointment tomorrow with ' . $this->appointment->client->first_name;

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $viewTemplate = $this->userType === 'client' 
            ? 'emails.appointments.reminder-client'
            : 'emails.appointments.reminder-provider';

        return new Content(
            view: $viewTemplate,
            with: [
                'appointment' => $this->appointment,
                'userType' => $this->userType,
                'clientName' => $this->appointment->client->first_name,
                'providerName' => $this->appointment->provider->full_name,
                'businessName' => $this->appointment->provider->providerProfile->business_name ?? null,
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'formattedDateTime' => $this->appointment->formatted_date_time,
                'totalPrice' => $this->appointment->total_price,
                'clientAddress' => $this->appointment->client_address,
                'appointmentUrl' => $this->getAppointmentUrl(),
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

    private function getAppointmentUrl(): string
    {
        $baseUrl = config('app.url');
        
        if ($this->userType === 'client') {
            return $baseUrl . '/client/appointments/' . $this->appointment->id;
        } else {
            return $baseUrl . '/provider/appointments/' . $this->appointment->id;
        }
    }
}
