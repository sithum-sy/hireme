<?php

namespace App\Events;

use App\Models\Appointment;
use App\Models\Invoice;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvoiceGenerated
{
    use Dispatchable, SerializesModels;

    public $appointment;
    public $invoice;

    public function __construct(Appointment $appointment, Invoice $invoice)
    {
        $this->appointment = $appointment;
        $this->invoice = $invoice;
    }
}