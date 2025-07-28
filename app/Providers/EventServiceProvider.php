<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        
        // Appointment events
        \App\Events\AppointmentStatusChanged::class => [
            \App\Listeners\SendAppointmentStatusNotification::class,
        ],
        
        // Invoice events
        \App\Events\InvoiceGenerated::class => [
            \App\Listeners\SendInvoiceNotification::class,
        ],
        
        // Payment events
        \App\Events\PaymentReceived::class => [
            \App\Listeners\SendPaymentNotification::class,
        ],
        
        // Review events
        \App\Events\ReviewSubmitted::class => [
            \App\Listeners\SendReviewNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
