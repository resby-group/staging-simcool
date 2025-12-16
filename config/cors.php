<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
    env('FRONTEND_URL'),
    env('ADMIN_FRONTEND_URL'),
    'https://staging.simcool.io',
    'https://admin-staging.simcool.io',
    ],
    
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
