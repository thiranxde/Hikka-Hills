<?php

namespace App\Mail;

use App\Enquiries\Enquiry;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * To the guest: we have your enquiry. Reply-To is the owner, so a reply reaches them.
 *
 * It repeats the dates and the number of guests but never the guest's message or name in the subject: anyone can type
 * any address into the form, and this way the copy cannot carry someone else's words to a stranger.
 */
class EnquiryCopy extends Mailable
{
    /** @param  list<string>  $owner  the owner's address(es), for Reply-To */
    public function __construct(public Enquiry $enquiry, public array $owner) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your enquiry to '.config('villa.name').' ('.$this->enquiry->stay().')',
            replyTo: $this->owner,
        );
    }

    public function content(): Content
    {
        $e = $this->enquiry;
        $villa = (string) config('villa.name');

        return new Content(
            view: 'mail.enquiry',
            text: 'mail.enquiry-text',
            with: [
                'preheader' => "We have your enquiry for {$e->stay()}.",
                'heading' => "Thank you, {$e->firstName()}.",
                'lines' => [
                    "We have your enquiry for {$villa} and will reply personally with availability and rates.",
                    'If anything below needs changing, simply reply to this email.',
                ],
                'facts' => [
                    'Arrival' => $e->checkIn->format('D j M Y'),
                    'Departure' => $e->checkOut->format('D j M Y'),
                    'Nights' => (string) $e->nights(),
                    'Guests' => (string) $e->guests,
                    'Reference' => $e->reference,
                ],
                'guestMessage' => null,
                'footnote' => 'You are receiving this because this address was entered in the enquiry form on '
                    .config('villa.site_url').'. If that was not you, you can ignore this email.',
            ],
        );
    }
}
