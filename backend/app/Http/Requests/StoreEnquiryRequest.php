<?php

namespace App\Http\Requests;

use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

/**
 * The same checks as the website's form (src/features/booking/lib/enquiry.ts), with the same wording, so a message
 * from here can be shown under its field. Field names are the form's own (camelCase).
 *
 * Arrival may be "yesterday" in Sri Lanka: a guest west of Colombo can still be on the previous day.
 */
class StoreEnquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $now = CarbonImmutable::now((string) config('villa.timezone'));
        $earliest = $now->subDay()->toDateString();
        $latest = $now->addDays((int) config('villa.enquiries.max_days_ahead'))->toDateString();

        return [
            'checkIn' => ['bail', 'required', 'date_format:Y-m-d', "after_or_equal:{$earliest}", "before_or_equal:{$latest}"],
            'checkOut' => ['bail', 'required', 'date_format:Y-m-d', 'after:checkIn'],
            'guests' => ['bail', 'required', 'integer', 'min:1', 'max:'.(int) config('villa.enquiries.max_guests')],
            'name' => ['bail', 'required', 'string', 'min:2', 'max:100', 'not_regex:/[\x00-\x1F\x7F]/'],
            'email' => ['bail', 'required', 'string', 'max:254', 'email:rfc', 'regex:/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/'],
            'phone' => ['bail', 'nullable', 'string', 'max:30', 'regex:/^[+\d\s().-]+$/', $this->phoneDigits(...)],
            'message' => ['nullable', 'string', 'max:2000'],
            // The hidden "leave this empty" field. Bots fill it; the controller then says "sent" and sends nothing.
            'website' => ['nullable'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        $phone = 'Enter a phone number with its country code, e.g. +94 77 123 4567.';
        $email = 'That email address does not look right.';
        $guests = 'Enter a whole number of guests, at least 1.';

        return [
            'checkIn.required' => 'Choose your arrival date.',
            'checkIn.date_format' => 'Choose your arrival date.',
            'checkIn.after_or_equal' => 'The arrival date has already passed.',
            'checkIn.before_or_equal' => 'That arrival date is too far ahead to enquire about yet.',
            'checkOut.required' => 'Choose your departure date.',
            'checkOut.date_format' => 'Choose your departure date.',
            'checkOut.after' => 'Departure must be after arrival.',
            'guests.required' => 'How many guests?',
            'guests.integer' => $guests,
            'guests.min' => $guests,
            'guests.max' => 'For more than :max guests, tell us in the message.',
            'name.required' => 'Please enter your name.',
            'name.string' => 'Please enter your name.',
            'name.min' => 'Please enter your name.',
            'name.max' => 'Please keep your name under 100 characters.',
            'name.not_regex' => 'Please enter your name on one line.',
            'email.required' => 'Please enter your email, so we can reply.',
            'email.string' => $email,
            'email.max' => $email,
            'email.email' => $email,
            'email.regex' => $email,
            'phone.string' => $phone,
            'phone.max' => $phone,
            'phone.regex' => $phone,
            'message.string' => 'Please write your message as text.',
            'message.max' => 'Please keep the message under 2,000 characters.',
        ];
    }

    /** Between 7 and 15 digits, as the form asks (an international number is at most 15). */
    private function phoneDigits(string $attribute, mixed $value, Closure $fail): void
    {
        $digits = strlen((string) preg_replace('/\D/', '', (string) $value));
        if ($digits < 7 || $digits > 15) {
            $fail('Enter a phone number with its country code, e.g. +94 77 123 4567.');
        }
    }
}
