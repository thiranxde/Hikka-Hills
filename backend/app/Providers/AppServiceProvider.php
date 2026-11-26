<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Enquiries from one address: a few a minute and a cap per day, so the form cannot be used to flood the
        // owner's inbox or to send copies to strangers. Counted in the cache (CACHE_STORE, "file" by default).
        RateLimiter::for('enquiries', function (Request $request) {
            $busy = fn (Request $request, array $headers) => response()->json([
                'status' => 'busy',
                'message' => 'You have sent several enquiries in a short time. Please wait a little and try again.',
            ], 429, $headers);

            return [
                Limit::perMinute((int) config('villa.enquiries.per_minute'))->by('minute:'.$request->ip())->response($busy),
                Limit::perDay((int) config('villa.enquiries.per_day'))->by('day:'.$request->ip())->response($busy),
            ];
        });
    }
}
