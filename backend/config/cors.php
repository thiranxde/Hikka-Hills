<?php

/*
| Which websites may call this API from a browser. In development the React site calls it through Vite's proxy (same
| origin, so CORS is not involved); a live site on another address must be listed in CORS_ALLOWED_ORIGINS
| (comma separated, exactly as the browser shows it, e.g. "https://hikkahills.lk,https://www.hikkahills.lk").
*/

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['POST', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'))))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => ['Retry-After'],

    'max_age' => 3600,

    'supports_credentials' => false,

];
