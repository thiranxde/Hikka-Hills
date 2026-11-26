# Hikka Hills: enquiry API

The Laravel backend for the Hikka Hills website. It receives booking enquiries from the site's form and emails them to
the owner, with a short copy to the guest.

```
composer install
cp .env.example .env
php artisan key:generate
php artisan serve     # http://127.0.0.1:8000
php artisan test
```

Set `ENQUIRY_TO` (the owner's inbox) and the `MAIL_*` settings in `.env` to send real email; until then mail is written
to `storage/logs/laravel.log`. See `CLAUDE.md` for the API, the emails and how to put it live.
