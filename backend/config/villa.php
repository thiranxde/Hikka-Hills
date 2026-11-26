<?php

/*
| The villa, and where its website's enquiries go. Everything a host needs to change is an environment variable
| (see .env.example); nothing here is a secret.
*/

return [

    'name' => env('VILLA_NAME', 'Hikka Hills'),

    /** The public website (the React site), no slash at the end. Emails link to it. */
    'site_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'),

    /** Dates in an enquiry are the villa's calendar days. */
    'timezone' => 'Asia/Colombo',

    'enquiries' => [

        /**
         * The owner's inbox. Until it is set the API answers 503 "not_connected" and sends nothing, and the website
         * says enquiries are not switched on yet. Several addresses may be given, separated by commas.
         */
        'to' => array_values(array_filter(array_map('trim', explode(',', (string) env('ENQUIRY_TO', ''))))),

        /** Also email the guest a short copy (dates and guests, never their message), with Reply-To set to the owner. */
        'send_copy' => (bool) env('ENQUIRY_SEND_COPY', true),

        /** The most guests one enquiry may ask for. Keep it equal to `booking.maxGuests` in src/config/site.ts. */
        'max_guests' => (int) env('ENQUIRY_MAX_GUESTS', 12),

        /** How far ahead an arrival may be, in days. */
        'max_days_ahead' => (int) env('ENQUIRY_MAX_DAYS_AHEAD', 730),

        /** Enquiries one address (IP) may send: a few a minute, and a cap per day. */
        'per_minute' => (int) env('ENQUIRY_PER_MINUTE', 3),
        'per_day' => (int) env('ENQUIRY_PER_DAY', 20),
    ],

];
