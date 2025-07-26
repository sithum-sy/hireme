<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        $schedule->command('quotes:mark-expired')->hourly();
        
        // Process expired appointments every hour
        $schedule->job(new \App\Jobs\ProcessExpiredAppointments)->hourly();
        
        // Process expired appointments every 30 minutes for faster response
        $schedule->command('appointments:process-expired')
            ->everyThirtyMinutes()
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
