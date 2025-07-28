<?php

namespace App\Mail;

use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceiptMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $appointment;
    public $payment;
    public $invoice;

    /**
     * Create a new message instance.
     */
    public function __construct(array $data)
    {
        $this->appointment = $data['appointment'];
        $this->payment = $data['payment'];
        $this->invoice = $data['invoice'] ?? null;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Receipt - Thank You!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $baseUrl = config('app.frontend_url', config('app.url'));
        
        return new Content(
            view: 'emails.payments.receipt',
            with: [
                'appointment' => $this->appointment,
                'payment' => $this->payment,
                'invoice' => $this->invoice,
                'clientName' => $this->appointment->client->first_name,
                'providerName' => $this->appointment->provider->first_name . ' ' . $this->appointment->provider->last_name,
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'paymentAmount' => $this->payment->amount,
                'paymentDate' => $this->payment->created_at,
                'transactionId' => $this->payment->stripe_payment_intent_id ?? $this->payment->id,
                'businessName' => $this->appointment->provider->provider_profile->business_name ?? null,
                'appointmentUrl' => $baseUrl . '/client/appointments/' . $this->appointment->id,
                'dashboardUrl' => $baseUrl . '/client/dashboard',
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