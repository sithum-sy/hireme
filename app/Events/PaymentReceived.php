<?php

namespace App\Events;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentReceived
{
    use Dispatchable, SerializesModels;

    public $appointment;
    public $payment;
    public $invoice;

    public function __construct(Appointment $appointment, Payment $payment, Invoice $invoice = null)
    {
        $this->appointment = $appointment;
        $this->payment = $payment;
        $this->invoice = $invoice;
    }
}