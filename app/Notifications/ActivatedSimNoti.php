<?php

namespace App\Notifications;

use App\Models\Country;
use App\Models\Region;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class ActivatedSimNoti extends Notification implements ShouldQueue
{
    use Queueable;

    protected $esim;

    public function __construct($esim)
    {
        $this->esim = $esim;
    }

    public function via($notifiable): array
    {
        return [FcmChannel::class];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $countries = Country::whereIn('id',[$this->esim->package->country_ids])->pluck('name');
        $region = Region::where('id',$this->esim->package->region)->pluck('name');
        return (new FcmMessage(
            notification: new FcmNotification(
                title: 'Your Esim Activated!',
                body: 'Your ICCID ' . $this->esim->iccid . '!'
            )
        ))
            ->data([
                'type'     => '2',
                'iccid' => $this->esim->iccid,
                'country_region' => !empty($countries) ? implode($countries) : $region,
            ]);
    }
}
