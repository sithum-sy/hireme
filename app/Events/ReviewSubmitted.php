<?php

namespace App\Events;

use App\Models\Review;
use App\Models\Appointment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewSubmitted
{
    use Dispatchable, SerializesModels;

    public $review;
    public $appointment;

    public function __construct(Review $review, Appointment $appointment)
    {
        $this->review = $review;
        $this->appointment = $appointment;
    }
}