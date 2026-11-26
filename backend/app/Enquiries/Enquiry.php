<?php

namespace App\Enquiries;

use Carbon\CarbonImmutable;

/**
 * One booking enquiry from the website's form, after it has been checked (App\Http\Requests\StoreEnquiryRequest).
 * Nothing is stored in a database: the enquiry is written to the enquiries log and emailed.
 */
final readonly class Enquiry
{
    /** Letters and digits that cannot be mistaken for each other when read out (no O/0, I/1). */
    private const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function __construct(
        public string $reference,
        public CarbonImmutable $checkIn,
        public CarbonImmutable $checkOut,
        public int $guests,
        public string $name,
        public string $email,
        public ?string $phone,
        public ?string $message,
        public CarbonImmutable $receivedAt,
    ) {}

    /** @param  array<string, mixed>  $data  the validated request */
    public static function fromValidated(array $data, ?CarbonImmutable $receivedAt = null): self
    {
        $tz = (string) config('villa.timezone');
        $receivedAt ??= CarbonImmutable::now($tz);

        return new self(
            reference: self::newReference($receivedAt),
            checkIn: CarbonImmutable::createFromFormat('!Y-m-d', (string) $data['checkIn'], $tz),
            checkOut: CarbonImmutable::createFromFormat('!Y-m-d', (string) $data['checkOut'], $tz),
            guests: (int) $data['guests'],
            name: trim((string) $data['name']),
            email: trim((string) $data['email']),
            phone: filled($data['phone'] ?? null) ? trim((string) $data['phone']) : null,
            message: filled($data['message'] ?? null) ? trim((string) $data['message']) : null,
            receivedAt: $receivedAt->setTimezone($tz),
        );
    }

    /** A short reference the owner and the guest can both quote, e.g. "HH-261126-K7QM". */
    public static function newReference(?CarbonImmutable $at = null): string
    {
        $at ??= CarbonImmutable::now((string) config('villa.timezone'));
        $code = '';
        for ($i = 0; $i < 4; $i++) {
            $code .= self::REFERENCE_ALPHABET[random_int(0, strlen(self::REFERENCE_ALPHABET) - 1)];
        }

        return 'HH-'.$at->format('ymd').'-'.$code;
    }

    public function nights(): int
    {
        return (int) $this->checkIn->diffInDays($this->checkOut);
    }

    public function firstName(): string
    {
        return preg_split('/\s+/', $this->name)[0] ?? $this->name;
    }

    /** "12 to 16 Dec 2026", or across months and years "30 Dec 2026 to 3 Jan 2027". */
    public function stay(): string
    {
        $from = match (true) {
            $this->checkIn->year !== $this->checkOut->year => 'j M Y',
            $this->checkIn->month !== $this->checkOut->month => 'j M',
            default => 'j',
        };

        return $this->checkIn->format($from).' to '.$this->checkOut->format('j M Y');
    }

    public function guestsLabel(): string
    {
        return $this->guests.' '.($this->guests === 1 ? 'guest' : 'guests');
    }

    public function nightsLabel(): string
    {
        $n = $this->nights();

        return $n.' '.($n === 1 ? 'night' : 'nights');
    }

    /** @return array<string, mixed> what the enquiries log keeps */
    public function toLog(): array
    {
        return [
            'reference' => $this->reference,
            'checkIn' => $this->checkIn->toDateString(),
            'checkOut' => $this->checkOut->toDateString(),
            'guests' => $this->guests,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'receivedAt' => $this->receivedAt->toIso8601String(),
        ];
    }
}
