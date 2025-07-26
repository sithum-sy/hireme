<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentExpiredNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $recipient;

    /**
     * Create a new message instance.
     *
     * @param Appointment $appointment
     * @param string $recipient 'client' or 'provider'
     */
    public function __construct(Appointment $appointment, $recipient = 'client')
    {
        $this->appointment = $appointment;
        $this->recipient = $recipient;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        if ($this->recipient === 'client') {
            return $this->buildClientNotification();
        } else {
            return $this->buildProviderNotification();
        }
    }

    /**
     * Build notification for client
     */
    private function buildClientNotification()
    {
        return $this->subject('Appointment Request Expired - HireMe')
            ->view('emails.appointments.expired-client')
            ->with([
                'clientName' => $this->appointment->client->first_name,
                'providerName' => $this->appointment->provider->first_name . ' ' . $this->appointment->provider->last_name,
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date->format('l, F j, Y'),
                'appointmentTime' => $this->appointment->formatted_time_range,
                'totalPrice' => number_format($this->appointment->total_price, 2),
                'confirmationCode' => $this->appointment->confirmation_code ?? $this->appointment->id,
                'hoursWaited' => $this->appointment->created_at->diffInHours(now()),
                'searchUrl' => url('/client/services?category_id=' . $this->appointment->service->category_id),
                'supportEmail' => config('mail.support_email', 'support@hireme.lk')
            ]);
    }

    /**
     * Build notification for provider
     */
    private function buildProviderNotification()
    {
        return $this->subject('Missed Appointment Opportunity - HireMe')
            ->view('emails.appointments.expired-provider')
            ->with([
                'providerName' => $this->appointment->provider->first_name,
                'clientName' => $this->appointment->client->first_name . ' ' . $this->appointment->client->last_name,
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date->format('l, F j, Y'),
                'appointmentTime' => $this->appointment->formatted_time_range,
                'totalPrice' => number_format($this->appointment->total_price, 2),
                'confirmationCode' => $this->appointment->confirmation_code ?? $this->appointment->id,
                'hoursWaited' => $this->appointment->created_at->diffInHours(now()),
                'dashboardUrl' => url('/provider/dashboard'),
                'settingsUrl' => url('/provider/settings/notifications'),
                'supportEmail' => config('mail.support_email', 'support@hireme.lk')
            ]);
    }
}