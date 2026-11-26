<?php

namespace App\Mail;

use App\Enquiries\Enquiry;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * To the owner: a new enquiry, with everything the guest typed. Reply-To is the guest, so pressing Reply answers them.
 * Not queued: sent while the guest waits, so the website can say truthfully whether it went.
 */
class EnquiryReceived extends Mailable
{
    public function __construct(public Enquiry $enquiry) {}

    public function envelope(): Envelope
    {
        $e = $this->enquiry;

        return new Envelope(
            subject: "Enquiry {$e->reference}: {$e->stay()}, {$e->guestsLabel()} – {$e->name}",
            replyTo: [new Address($e->email, $e->name)],
        );
    }

    public function content(): Content
    {
        $e = $this->enquiry;

        return new Content(
            view: 'mail.enquiry',
            text: 'mail.enquiry-text',
            with: [
                'preheader' => "{$e->name}: {$e->stay()}, {$e->guestsLabel()}",
                'heading' => "New enquiry from {$e->name}",
                'lines' => ["Reply to this email to answer {$e->firstName()} directly."],
                'facts' => [
                    'Arrival' => $e->checkIn->format('D j M Y'),
                    'Departure' => $e->checkOut->format('D j M Y'),
                    'Nights' => (string) $e->nights(),
                    'Guests' => (string) $e->guests,
                    'Name' => $e->name,
                    'Email' => $e->email,
                    'Phone' => $e->phone ?? 'Not given',
                    'Reference' => $e->reference,
                    'Received' => $e->receivedAt->format('j M Y, H:i').' (Sri Lanka time)',
                ],
                'guestMessage' => $e->message,
                'footnote' => 'Sent from the enquiry form on '.config('villa.site_url').'.',
            ],
        );
    }
}
