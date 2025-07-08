<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusChanged
{
    use Dispatchable, SerializesModels;

    public $appointment;
    public $oldStatus;
    public $newStatus;

    public function __construct(Appointment $appointment, $oldStatus, $newStatus)
    {
        $this->appointment = $appointment;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
