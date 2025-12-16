<?php

namespace App\Mail;

use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mime\Email;
use GuzzleHttp\Client;

class BrevoTransport extends AbstractTransport
{
    protected $client;
    protected $apiKey;

    public function __construct($apiKey)
    {
        parent::__construct();

        $this->client = new Client([
            'base_uri' => 'https://api.brevo.com/v3/',
        ]);

        $this->apiKey = $apiKey;
    }

    protected function doSend(SentMessage $message): void
    {
        /** @var Email $email */
        $email = $message->getOriginalMessage();

        $payload = [
            'sender' => [
                'email' => env('MAIL_FROM_ADDRESS'),
                'name'  => env('MAIL_FROM_NAME', 'SimCool'),
            ],
            'to' => array_map(
                fn($addr) => ['email' => $addr->getAddress()],
                $email->getTo()
            ),
            'subject' => $email->getSubject(),
            'htmlContent' => $email->getHtmlBody() ?? $email->getTextBody(),
        ];

        $this->client->post('smtp/email', [
            'headers' => [
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => $payload,
        ]);
    }

    public function __toString(): string
    {
        return 'brevo';
    }
}
