# Backend: Hikka Hills enquiry API (Laravel 13)

A small JSON API for the website in `../`. Its one job: take a booking enquiry from the form, check it, and email it to
the owner (with a short copy to the guest). **No database**: the only things written are the enquiries log and the
rate-limit counters, both on disk.

## Stack
- PHP 8.3 or newer (developed on 8.5.12 in `C:\php`, as for the gifting platform), Laravel 13, PHPUnit 12, Pint.
- No Sanctum, no sessions, no queue: mail is sent while the guest waits, so the site can say truthfully whether it went.

## Commands (from `backend/`, or the npm scripts from the root)
- `composer install`, then `cp .env.example .env` and `php artisan key:generate` (first time)
- `php artisan serve` (root: `npm run dev:api`): API at http://127.0.0.1:8000. `npm run dev` forwards the site's `/api` here.
- `php artisan test` (root: `npm run test:api`)
- `./vendor/bin/pint`: format

## The API
`POST /api/enquiries` (`EnquiryController`), JSON with the form's own field names: `checkIn`, `checkOut` (yyyy-mm-dd),
`guests`, `name`, `email`, `phone` (optional), `message` (optional), and `website` (the hidden spam trap; must be empty).

| Answer | When |
| --- | --- |
| `201 {status: "sent", reference, copySent}` | Emailed to the owner. `copySent`: the guest's copy went too |
| `422 {message, errors: {field: [text]}}` | A field needs fixing. Same checks and wording as `src/features/booking/lib/enquiry.ts`, so the site shows them under the field |
| `503 {status: "not_connected"}` | `ENQUIRY_TO` is empty. Nothing sent; the site says enquiries are not switched on yet |
| `502 {status: "failed", reference}` | The mail server refused or could not be reached. The enquiry is still in the log |
| `429 {status: "busy"}` | More than `ENQUIRY_PER_MINUTE` (5) or `ENQUIRY_PER_DAY` (20) from one IP |

`GET /up` is Laravel's health check. Every other address answers JSON 404.

- **Validation** (`StoreEnquiryRequest`): arrival from yesterday (Sri Lanka time, for guests in earlier time zones) up
  to `ENQUIRY_MAX_DAYS_AHEAD` (730) days ahead; departure after arrival; 1 to `ENQUIRY_MAX_GUESTS` guests (keep equal to
  `booking.maxGuests` in `src/config/site.ts`); the name on one line (no header injection); phone 7 to 15 digits.
  **Change a rule in both places** (here and `enquiry.ts`), with the same words.
- **Spam:** the hidden `website` field (a bot that fills it is told "sent" and nothing is sent), and the rate limit
  (`AppServiceProvider`, counted in the file cache). Behind a proxy or CDN, set Laravel's trusted proxies so the limit
  counts visitors, not the proxy.
- **The enquiries log** (`storage/logs/enquiries-YYYY-MM-DD.log`, kept `ENQUIRY_LOG_DAYS` = 30 days): every enquiry as
  received, before any mail is tried, so none is lost if the mail server is down. It holds guests' details; never serve
  `storage/` to the web.

## Emails
Two mailables, one HTML template and one text template (`resources/views/mail/enquiry*.blade.php`, inline styles, the
site's colours):
- `EnquiryReceived`, to `ENQUIRY_TO`: every detail and the guest's message. **Reply-To is the guest**, so the owner just
  presses Reply. Subject: `Enquiry HH-261126-K7QM: 12 to 16 Dec 2026, 4 guests – Ana Perera`.
- `EnquiryCopy`, to the guest (`ENQUIRY_SEND_COPY`): dates, guests and the reference, **Reply-To the owner**. It never
  repeats the guest's message: anyone can type any address into the form, so the copy must not carry free text to a
  stranger.
- In a mail view, **never name a variable `$message`**: Laravel puts its own message object there. The guest's text is
  `$guestMessage`. Everything a guest typed is printed with `{{ }}` (escaped) in the HTML.

Which service delivers the mail is only configuration (`MAIL_*` in `.env`). `MAIL_MAILER=log` (the default) writes
each email to `storage/logs/laravel.log`. For Gmail, as the gifting platform does: `MAIL_MAILER=smtp`,
`MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_USERNAME` and `MAIL_FROM_ADDRESS` the Gmail address, `MAIL_PASSWORD`
an app password (https://myaccount.google.com/apppasswords, needs 2-Step Verification). Gmail allows about 500
messages a day, plenty here.

## Going live
- Any PHP 8.3+ host. Point the web root at `backend/public`. `APP_ENV=production`, `APP_DEBUG=false`, a fresh `APP_KEY`.
- `ENQUIRY_TO` (the owner's inbox), the `MAIL_*` details, `FRONTEND_URL` (the live site) and `CORS_ALLOWED_ORIGINS`
  (the live site's address(es), e.g. `https://hikkahills.lk,https://www.hikkahills.lk`).
- On the site: build with `VITE_API_URL` = this API's address (e.g. `https://api.hikkahills.lk`), or serve this API
  under the site's own `/api` and leave it empty.
- `storage/` and `bootstrap/cache/` writable by the web server.

## Tests
`tests/Feature/EnquiryTest.php` (sending, both emails' content and escaping, a real render through the `array` mailer,
every validation message, not connected, the spam trap, mail failures, the rate limit, CORS) and
`tests/Unit/EnquiryTest.php` (dates, nights, references). The site's side is in `../e2e/booking.spec.ts`, which fakes
this API's answers.
