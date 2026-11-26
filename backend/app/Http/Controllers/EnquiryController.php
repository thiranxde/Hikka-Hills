<?php

namespace App\Http\Controllers;

use App\Enquiries\Enquiry;
use App\Http\Requests\StoreEnquiryRequest;
use App\Mail\EnquiryCopy;
use App\Mail\EnquiryReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * POST /api/enquiries: the website's booking enquiry.
 *
 * Answers (the website's src/features/booking/lib/submitEnquiry.ts reads them):
 * - 201 {status: "sent", reference, copySent}: the owner has it; copySent says whether the guest's copy went too.
 * - 422 {message, errors: {field: [message]}}: a field needs fixing (same wording as the form).
 * - 503 {status: "not_connected"}: ENQUIRY_TO is not set, so there is nowhere to send it. Nothing is sent.
 * - 502 {status: "failed", reference}: the mail server refused or could not be reached. The enquiry is in the log.
 * - 429: too many enquiries from one address (App\Providers\AppServiceProvider).
 */
class EnquiryController extends Controller
{
    public function __invoke(StoreEnquiryRequest $request): JsonResponse
    {
        if ($request->filled('website')) {
            // A bot filled the hidden field: answer as if it worked, so it learns nothing, and send nothing.
            Log::channel('enquiries')->notice('Enquiry dropped: the hidden field was filled', ['ip' => $request->ip()]);

            return response()->json(['status' => 'sent', 'reference' => Enquiry::newReference(), 'copySent' => false], 201);
        }

        /** @var list<string> $owner */
        $owner = config('villa.enquiries.to');
        if ($owner === []) {
            return response()->json([
                'status' => 'not_connected',
                'message' => 'Online enquiries are not switched on yet, so nothing has been sent.',
            ], 503);
        }

        $enquiry = Enquiry::fromValidated($request->validated());
        $log = Log::channel('enquiries');
        $log->info("Enquiry {$enquiry->reference} received", $enquiry->toLog() + ['ip' => $request->ip()]);

        try {
            Mail::to($owner)->send(new EnquiryReceived($enquiry));
        } catch (Throwable $failure) {
            report($failure);
            $log->error("Enquiry {$enquiry->reference} NOT emailed to the owner: {$failure->getMessage()}");

            return response()->json([
                'status' => 'failed',
                'reference' => $enquiry->reference,
                'message' => 'We could not send your enquiry just now. Please try again in a few minutes, or contact us directly.',
            ], 502);
        }

        $copySent = false;
        if (config('villa.enquiries.send_copy')) {
            try {
                Mail::to($enquiry->email, $enquiry->name)->send(new EnquiryCopy($enquiry, $owner));
                $copySent = true;
            } catch (Throwable $failure) {
                // The owner has the enquiry, which is what matters; the guest just gets no copy.
                report($failure);
            }
        }

        $log->info("Enquiry {$enquiry->reference} emailed", ['owner' => true, 'copy' => $copySent]);

        return response()->json(['status' => 'sent', 'reference' => $enquiry->reference, 'copySent' => $copySent], 201);
    }
}
