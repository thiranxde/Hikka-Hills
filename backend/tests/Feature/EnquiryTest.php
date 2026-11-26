<?php

namespace Tests\Feature;

use App\Mail\EnquiryCopy;
use App\Mail\EnquiryReceived;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Tests\TestCase;

class EnquiryTest extends TestCase
{
    private const OWNER = 'owner@hikkahills.test';

    private string $logPath;

    protected function setUp(): void
    {
        parent::setUp();

        // 26 Nov 2026, 10:00 in Sri Lanka.
        $this->travelTo(CarbonImmutable::parse('2026-11-26 10:00', 'Asia/Colombo'));

        config([
            'villa.enquiries.to' => [self::OWNER],
            'villa.enquiries.send_copy' => true,
            'villa.enquiries.max_guests' => 12,
            'villa.enquiries.per_minute' => 100,
            'villa.enquiries.per_day' => 100,
            'villa.site_url' => 'https://hikkahills.test',
        ]);

        $this->logPath = storage_path('logs/testing-enquiries.log');
        File::delete($this->logPath);
        config(['logging.channels.enquiries' => ['driver' => 'single', 'path' => $this->logPath, 'level' => 'info']]);
    }

    protected function tearDown(): void
    {
        File::delete($this->logPath);
        parent::tearDown();
    }

    /** @return array<string, mixed> */
    private function enquiry(array $overrides = []): array
    {
        return array_merge([
            'checkIn' => '2026-12-12',
            'checkOut' => '2026-12-16',
            'guests' => '4',
            'name' => 'Ana Perera',
            'email' => 'ana@example.com',
            'phone' => '+94 77 123 4567',
            'message' => 'Arriving in the afternoon.',
        ], $overrides);
    }

    public function test_a_complete_enquiry_is_emailed_to_the_owner_and_a_copy_to_the_guest(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/enquiries', $this->enquiry());

        $response->assertCreated()
            ->assertJson(['status' => 'sent', 'copySent' => true])
            ->assertJsonPath('reference', fn (string $ref) => (bool) preg_match('/^HH-261126-[A-HJ-NP-Z2-9]{4}$/', $ref));
        $reference = $response->json('reference');

        Mail::assertSent(EnquiryReceived::class, function (EnquiryReceived $mail) use ($reference) {
            return $mail->hasTo(self::OWNER)
                && $mail->hasReplyTo('ana@example.com', 'Ana Perera')
                && $mail->hasSubject("Enquiry {$reference}: 12 to 16 Dec 2026, 4 guests – Ana Perera")
                && $mail->enquiry->nights() === 4
                && $mail->enquiry->message === 'Arriving in the afternoon.';
        });
        Mail::assertSent(EnquiryCopy::class, function (EnquiryCopy $mail) {
            return $mail->hasTo('ana@example.com')
                && $mail->hasReplyTo(self::OWNER)
                && $mail->hasSubject('Your enquiry to Hikka Hills (12 to 16 Dec 2026)');
        });
        Mail::assertSentCount(2);

        $log = File::get($this->logPath);
        $this->assertStringContainsString("Enquiry {$reference} received", $log);
        $this->assertStringContainsString('Arriving in the afternoon.', $log);
        $this->assertStringContainsString("Enquiry {$reference} emailed", $log);
    }

    public function test_the_owner_email_shows_every_detail_and_escapes_what_the_guest_typed(): void
    {
        Mail::fake();
        $this->postJson('/api/enquiries', $this->enquiry([
            'name' => 'Ana <b>Perera</b>',
            'message' => "First line\n<script>alert(1)</script>",
        ]))->assertCreated();

        Mail::assertSent(EnquiryReceived::class, function (EnquiryReceived $mail) {
            $mail->assertSeeInHtml('New enquiry from Ana <b>Perera</b>') // escaped by default
                ->assertDontSeeInHtml('<b>Perera</b>', false)
                ->assertSeeInHtml('<script>alert(1)</script>')
                ->assertDontSeeInHtml('<script>', false)
                ->assertSeeInHtml('First line<br', false)
                ->assertSeeInHtml('Sat 12 Dec 2026')
                ->assertSeeInHtml('Wed 16 Dec 2026')
                ->assertSeeInHtml('+94 77 123 4567')
                ->assertSeeInText('Guests:     4')
                ->assertSeeInText('<script>alert(1)</script>');

            return true;
        });
    }

    public function test_the_emails_really_render_and_send_through_a_mailer(): void
    {
        // Not Mail::fake(): Laravel's "array" mailer builds every message for real (as SMTP would) and keeps it.
        config(['mail.default' => 'array']);

        $this->postJson('/api/enquiries', $this->enquiry(['message' => "Two lines\nof message"]))->assertCreated();

        $sent = app('mailer')->getSymfonyTransport()->messages();
        $this->assertCount(2, $sent);

        $owner = $sent[0]->getOriginalMessage();
        $this->assertSame(self::OWNER, $owner->getTo()[0]->getAddress());
        $this->assertSame('ana@example.com', $owner->getReplyTo()[0]->getAddress());
        $this->assertStringContainsString('Two lines<br />', $owner->getHtmlBody());
        $this->assertStringContainsString("Message:\nTwo lines\nof message", str_replace("\r\n", "\n", $owner->getTextBody()));

        $copy = $sent[1]->getOriginalMessage();
        $this->assertSame('ana@example.com', $copy->getTo()[0]->getAddress());
        $this->assertSame(self::OWNER, $copy->getReplyTo()[0]->getAddress());
        $this->assertStringNotContainsString('Two lines', $copy->getHtmlBody());
    }

    public function test_the_guest_copy_never_repeats_their_message(): void
    {
        Mail::fake();
        $this->postJson('/api/enquiries', $this->enquiry(['message' => 'Buy cheap watches at spam.example']))->assertCreated();

        Mail::assertSent(EnquiryCopy::class, function (EnquiryCopy $mail) {
            $mail->assertSeeInHtml('Thank you, Ana.')
                ->assertSeeInHtml('will reply personally with availability and rates')
                ->assertDontSeeInHtml('spam.example')
                ->assertDontSeeInText('spam.example');

            return true;
        });
    }

    public function test_no_copy_goes_to_the_guest_when_copies_are_switched_off(): void
    {
        Mail::fake();
        config(['villa.enquiries.send_copy' => false]);

        $this->postJson('/api/enquiries', $this->enquiry())->assertCreated()->assertJson(['copySent' => false]);

        Mail::assertSent(EnquiryReceived::class);
        Mail::assertNotSent(EnquiryCopy::class);
    }

    public function test_phone_and_message_are_optional(): void
    {
        Mail::fake();
        $this->postJson('/api/enquiries', $this->enquiry(['phone' => '', 'message' => '']))->assertCreated();

        Mail::assertSent(EnquiryReceived::class, fn (EnquiryReceived $mail) => $mail->enquiry->phone === null && $mail->enquiry->message === null);
    }

    public function test_without_an_owner_address_nothing_is_sent_and_it_says_not_connected(): void
    {
        Mail::fake();
        config(['villa.enquiries.to' => []]);

        $this->postJson('/api/enquiries', $this->enquiry())
            ->assertStatus(503)
            ->assertJson(['status' => 'not_connected']);

        Mail::assertNothingSent();
    }

    public function test_an_invalid_enquiry_is_still_checked_before_saying_not_connected(): void
    {
        config(['villa.enquiries.to' => []]);

        $this->postJson('/api/enquiries', $this->enquiry(['email' => 'nope']))->assertUnprocessable();
    }

    public function test_a_bot_that_fills_the_hidden_field_is_told_it_worked_but_nothing_is_sent(): void
    {
        Mail::fake();

        $this->postJson('/api/enquiries', $this->enquiry(['website' => 'http://spam.example']))
            ->assertCreated()
            ->assertJson(['status' => 'sent']);

        Mail::assertNothingSent();
        $this->assertStringContainsString('hidden field was filled', File::get($this->logPath));
    }

    /** @return array<string, array{array<string, mixed>, string, string}> */
    public static function invalidEnquiries(): array
    {
        return [
            'no arrival' => [['checkIn' => ''], 'checkIn', 'Choose your arrival date.'],
            'arrival not a date' => [['checkIn' => '12/12/2026'], 'checkIn', 'Choose your arrival date.'],
            'arrival passed' => [['checkIn' => '2026-11-24'], 'checkIn', 'The arrival date has already passed.'],
            'arrival too far ahead' => [['checkIn' => '2029-01-01', 'checkOut' => '2029-01-05'], 'checkIn', 'That arrival date is too far ahead to enquire about yet.'],
            'no departure' => [['checkOut' => ''], 'checkOut', 'Choose your departure date.'],
            'departure on arrival day' => [['checkOut' => '2026-12-12'], 'checkOut', 'Departure must be after arrival.'],
            'departure before arrival' => [['checkOut' => '2026-12-10'], 'checkOut', 'Departure must be after arrival.'],
            'no guests' => [['guests' => ''], 'guests', 'How many guests?'],
            'zero guests' => [['guests' => '0'], 'guests', 'Enter a whole number of guests, at least 1.'],
            'half a guest' => [['guests' => '2.5'], 'guests', 'Enter a whole number of guests, at least 1.'],
            'too many guests' => [['guests' => '13'], 'guests', 'For more than 12 guests, tell us in the message.'],
            'no name' => [['name' => '  '], 'name', 'Please enter your name.'],
            'one letter name' => [['name' => 'A'], 'name', 'Please enter your name.'],
            'name over two lines' => [['name' => "Ana\nBcc: x@example.com"], 'name', 'Please enter your name on one line.'],
            'no email' => [['email' => ''], 'email', 'Please enter your email, so we can reply.'],
            'email without a domain' => [['email' => 'ana@example'], 'email', 'That email address does not look right.'],
            'not an email' => [['email' => 'ana at example.com'], 'email', 'That email address does not look right.'],
            'phone too short' => [['phone' => '12'], 'phone', 'Enter a phone number with its country code, e.g. +94 77 123 4567.'],
            'phone with letters' => [['phone' => '+94 77 CALL ME'], 'phone', 'Enter a phone number with its country code, e.g. +94 77 123 4567.'],
            'phone too long' => [['phone' => '+94 77 123 4567 8901 23'], 'phone', 'Enter a phone number with its country code, e.g. +94 77 123 4567.'],
            'message too long' => [['message' => str_repeat('a', 2001)], 'message', 'Please keep the message under 2,000 characters.'],
        ];
    }

    #[DataProvider('invalidEnquiries')]
    public function test_each_field_is_checked_with_the_forms_own_words(array $overrides, string $field, string $message): void
    {
        Mail::fake();

        $this->postJson('/api/enquiries', $this->enquiry($overrides))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field => $message]);

        Mail::assertNothingSent();
    }

    public function test_arrival_may_be_yesterday_in_sri_lanka_for_guests_in_earlier_time_zones(): void
    {
        Mail::fake();

        $this->postJson('/api/enquiries', $this->enquiry(['checkIn' => '2026-11-25', 'checkOut' => '2026-11-27']))->assertCreated();
    }

    public function test_when_the_mail_server_fails_the_guest_is_told_and_the_enquiry_is_kept_in_the_log(): void
    {
        $this->useMailTransport(new FailingTransport);

        $response = $this->postJson('/api/enquiries', $this->enquiry())
            ->assertStatus(502)
            ->assertJson(['status' => 'failed']);

        $log = File::get($this->logPath);
        $this->assertStringContainsString('Enquiry '.$response->json('reference').' received', $log);
        $this->assertStringContainsString('NOT emailed to the owner', $log);
    }

    public function test_when_only_the_guest_copy_fails_the_enquiry_still_counts_as_sent(): void
    {
        $this->useMailTransport(new FailingTransport(failFor: 'ana@example.com'));

        $this->postJson('/api/enquiries', $this->enquiry())
            ->assertCreated()
            ->assertJson(['status' => 'sent', 'copySent' => false]);
    }

    public function test_one_address_can_only_send_a_few_enquiries_a_minute(): void
    {
        Mail::fake();
        config(['villa.enquiries.per_minute' => 2]);

        $this->postJson('/api/enquiries', $this->enquiry())->assertCreated();
        $this->postJson('/api/enquiries', $this->enquiry())->assertCreated();
        $this->postJson('/api/enquiries', $this->enquiry())
            ->assertStatus(429)
            ->assertJson(['status' => 'busy'])
            ->assertHeader('Retry-After');

        Mail::assertSentCount(4); // two enquiries, each to the owner and the guest
    }

    public function test_the_website_may_call_the_api_from_another_address_when_it_is_listed(): void
    {
        config(['cors.allowed_origins' => ['https://hikkahills.test', 'https://www.hikkahills.test']]);
        $preflight = fn (string $origin) => $this->call('OPTIONS', '/api/enquiries', server: [
            'HTTP_ORIGIN' => $origin,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type',
        ]);

        $preflight('https://hikkahills.test')->assertHeader('Access-Control-Allow-Origin', 'https://hikkahills.test');
        $preflight('https://elsewhere.example')->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_unknown_addresses_answer_json(): void
    {
        $this->get('/api/nothing-here')->assertNotFound()->assertHeader('Content-Type', 'application/json');
        $this->getJson('/api/enquiries')->assertStatus(405);
    }

    private function useMailTransport(AbstractTransport $transport): void
    {
        Mail::extend('test-transport', fn () => $transport);
        config(['mail.mailers.test-transport' => ['transport' => 'test-transport'], 'mail.default' => 'test-transport']);
    }
}

/** A mail server that refuses everything, or only mail to one address. */
class FailingTransport extends AbstractTransport
{
    public function __construct(private ?string $failFor = null)
    {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $to = array_map(fn ($address) => $address->getAddress(), $message->getEnvelope()->getRecipients());
        if ($this->failFor === null || in_array($this->failFor, $to, true)) {
            throw new TransportException('Connection refused');
        }
    }

    public function __toString(): string
    {
        return 'failing://';
    }
}
