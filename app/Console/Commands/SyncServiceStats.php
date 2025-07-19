<?php

namespace App\Console\Commands;

use App\Models\Service;
use Illuminate\Console\Command;

class SyncServiceStats extends Command
{
    protected $signature = 'services:sync-stats';
    protected $description = 'Sync service statistics with actual data';

    public function handle()
    {
        $this->info('Syncing service statistics...');

        Service::chunk(100, function ($services) {
            foreach ($services as $service) {
                $service->syncBookingCount();
                $this->line("Synced service: {$service->title}");
            }
        });

        $this->info('Service statistics synced successfully!');
    }
}
