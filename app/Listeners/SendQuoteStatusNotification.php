<?php

namespace App\Listeners;

use App\Events\QuoteStatusChanged;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendQuoteStatusNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The name of the queue the job should be sent to.
     *
     * @var string|null
     */
    public $queue = 'notifications';

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 60;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(QuoteStatusChanged $event): void
    {
        $quote = $event->quote;
        $oldStatus = $event->oldStatus;
        $newStatus = $event->newStatus;

        Log::info("Processing quote status change notification", [
            'quote_id' => $quote->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus
        ]);

        // Resolve notification service from container to avoid serialization issues
        $notificationService = app(NotificationService::class);

        // Get notifications to send based on status change
        $notifications = $this->getNotificationsForStatusChange($quote, $oldStatus, $newStatus);

        foreach ($notifications as $notification) {
            $notificationService->sendQuoteNotification(
                $notification['type'],
                $notification['recipient'],
                [
                    'quote' => $quote,
                    'quote_id' => $quote->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'service_name' => $quote->service->title,
                    'service_title' => $quote->service->title,
                    'client_name' => $quote->client->full_name,
                    'provider_name' => $quote->provider->full_name,
                    'quoted_price' => $quote->quoted_price,
                    'quote_number' => $quote->quote_number,
                ]
            );
        }
    }

    private function getNotificationsForStatusChange($quote, ?string $oldStatus, string $newStatus): array
    {
        $notifications = [];

        switch ($newStatus) {
            case 'pending':
                // New quote request created
                if ($oldStatus === null) {
                    // Send confirmation to client
                    $notifications[] = [
                        'type' => 'quote_request_sent',
                        'recipient' => $quote->client
                    ];
                    // Send new quote request notification to provider
                    $notifications[] = [
                        'type' => 'quote_request_received',
                        'recipient' => $quote->provider
                    ];
                }
                break;

            case 'quoted':
                if ($oldStatus === 'pending') {
                    // Provider responded with quote
                    $notifications[] = [
                        'type' => 'quote_response_received',
                        'recipient' => $quote->client
                    ];
                }
                break;

            case 'accepted':
                if ($oldStatus === 'quoted') {
                    // Client accepted quote
                    $notifications[] = [
                        'type' => 'quote_accepted',
                        'recipient' => $quote->provider
                    ];
                }
                break;

            case 'declined':
            case 'rejected':
                if ($oldStatus === 'quoted') {
                    // Client declined quote
                    $notifications[] = [
                        'type' => 'quote_declined',
                        'recipient' => $quote->provider
                    ];
                }
                break;

            case 'withdrawn':
                if (in_array($oldStatus, ['pending', 'quoted'])) {
                    // Provider withdrew quote
                    $notifications[] = [
                        'type' => 'quote_withdrawn',
                        'recipient' => $quote->client
                    ];
                }
                break;

            case 'expired':
                // Quote expired - notify both parties
                $notifications[] = [
                    'type' => 'quote_expired',
                    'recipient' => $quote->client
                ];
                if ($oldStatus === 'quoted') {
                    // Only notify provider if they had provided a quote
                    $notifications[] = [
                        'type' => 'quote_expired',
                        'recipient' => $quote->provider
                    ];
                }
                break;
        }

        return $notifications;
    }

    public function failed(QuoteStatusChanged $event, $exception)
    {
        Log::error("Quote status notification failed", [
            'quote_id' => $event->quote->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}