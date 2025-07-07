<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfileUpdateNotification extends Notification
{
    use Queueable;

    protected $updateType;
    protected $details;

    public function __construct($updateType, $details = [])
    {
        $this->updateType = $updateType;
        $this->details = $details;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $message = new MailMessage();

        switch ($this->updateType) {
            case 'profile_updated':
                return $message
                    ->subject('Profile Updated Successfully')
                    ->line('Your profile has been updated successfully.')
                    ->line('If you did not make this change, please contact our support team.')
                    ->action('View Profile', url('/profile'));

            case 'password_changed':
                return $message
                    ->subject('Password Changed Successfully')
                    ->line('Your password has been changed successfully.')
                    ->line('If you did not make this change, please contact our support team immediately.')
                    ->action('Login', url('/login'));

            case 'provider_documents_updated':
                return $message
                    ->subject('Provider Documents Updated')
                    ->line('Your provider documents have been updated.')
                    ->line('Your profile may require re-verification.')
                    ->action('View Profile', url('/profile'));
        }

        return $message;
    }

    public function toArray($notifiable)
    {
        return [
            'type' => $this->updateType,
            'details' => $this->details,
            'message' => $this->getNotificationMessage(),
        ];
    }

    private function getNotificationMessage()
    {
        switch ($this->updateType) {
            case 'profile_updated':
                return 'Your profile has been updated successfully.';
            case 'password_changed':
                return 'Your password has been changed successfully.';
            case 'provider_documents_updated':
                return 'Your provider documents have been updated.';
            default:
                return 'Your account has been updated.';
        }
    }
}
