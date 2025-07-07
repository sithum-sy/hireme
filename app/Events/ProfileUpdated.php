<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProfileUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $updateType;
    public $changes;

    public function __construct(User $user, $updateType, $changes = [])
    {
        $this->user = $user;
        $this->updateType = $updateType;
        $this->changes = $changes;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->user->id);
    }
}
