<?php

namespace Tests\Unit;

use App\Enquiries\Enquiry;
use Tests\TestCase;

class EnquiryTest extends TestCase
{
    private function make(string $in, string $out, int $guests = 2, string $name = 'Ana Perera'): Enquiry
    {
        return Enquiry::fromValidated(['checkIn' => $in, 'checkOut' => $out, 'guests' => (string) $guests, 'name' => $name, 'email' => 'a@b.co']);
    }

    public function test_the_stay_is_written_as_short_as_it_can_be(): void
    {
        $this->assertSame('12 to 16 Dec 2026', $this->make('2026-12-12', '2026-12-16')->stay());
        $this->assertSame('30 Nov to 3 Dec 2026', $this->make('2026-11-30', '2026-12-03')->stay());
        $this->assertSame('28 Dec 2026 to 2 Jan 2027', $this->make('2026-12-28', '2027-01-02')->stay());
    }

    public function test_nights_and_labels(): void
    {
        $one = $this->make('2026-12-12', '2026-12-13', guests: 1);
        $this->assertSame(1, $one->nights());
        $this->assertSame('1 night', $one->nightsLabel());
        $this->assertSame('1 guest', $one->guestsLabel());
        $this->assertSame('4 nights', $this->make('2026-12-12', '2026-12-16')->nightsLabel());
        // Across the change of month and a clock change elsewhere: whole days in Sri Lanka, which has none.
        $this->assertSame(35, $this->make('2026-03-01', '2026-04-05')->nights());
    }

    public function test_first_name_and_an_empty_phone(): void
    {
        $e = $this->make('2026-12-12', '2026-12-16', name: 'Ana  Maria Perera');
        $this->assertSame('Ana', $e->firstName());
        $this->assertNull($e->phone);
        $this->assertNull($e->message);
    }

    public function test_references_are_easy_to_read_out(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $this->assertMatchesRegularExpression('/^HH-\d{6}-[A-HJ-NP-Z2-9]{4}$/', Enquiry::newReference());
        }
    }
}
