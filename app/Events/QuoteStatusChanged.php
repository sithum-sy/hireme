<?php

namespace App\Events;

use App\Models\Quote;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuoteStatusChanged
{
    use Dispatchable, SerializesModels;

    public $quote;
    public $oldStatus;
    public $newStatus;

    public function __construct(Quote $quote, $oldStatus, $newStatus)
    {
        $this->quote = $quote;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
