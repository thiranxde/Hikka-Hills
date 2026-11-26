{{-- The plain-text part of every email (same data as mail/enquiry). Plain text, so nothing is HTML-escaped. --}}
{!! $heading !!}

@foreach ($lines as $line)
{!! $line !!}

@endforeach
@foreach ($facts as $label => $value)
{!! str_pad($label.':', 11) !!} {!! $value !!}
@endforeach
@if (filled($guestMessage ?? null))

Message:
{!! $guestMessage !!}
@endif

--
{!! config('villa.name') !!}, Hikkaduwa, Sri Lanka
{!! config('villa.site_url') !!}
@if (filled($footnote ?? null))

{!! $footnote !!}
@endif
