<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AppointmentService;

class MarkExpiredQuotes extends Command
{
    protected $signature = 'quotes:mark-expired';
    protected $description = 'Mark expired quotes as expired';

    public function handle(AppointmentService $appointmentService)
    {
        $expiredCount = $appointmentService->markExpiredQuotes();
        $this->info("Marked {$expiredCount} quotes as expired.");
    }
}
