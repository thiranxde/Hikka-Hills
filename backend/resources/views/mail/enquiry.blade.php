{{--
    Every email the villa sends: a heading, a few lines, a table of facts, the guest's message (owner only), a footnote.
    Inline styles and tables only, because that is what email programs read. The colours are the website's
    (forest-950, cream, linen, line, ink, muted in src/index.css). Everything typed by a guest is escaped with {{ }}.
--}}
@php($villa = config('villa.name'))
@php($site = config('villa.site_url'))
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>{{ $heading }}</title>
</head>
<body style="margin:0;padding:0;background:#ede8de;color:#22241f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{ $preheader }}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede8de;">
<tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
            <td style="background:#17201b;padding:28px 32px;text-align:center;">
                <a href="{{ $site }}" style="color:#f5f3ee;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:6px;text-transform:uppercase;">{{ $villa }}</a>
                <div style="margin-top:6px;color:#d9c9b2;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Hikkaduwa &middot; Sri Lanka</div>
            </td>
        </tr>
        <tr>
            <td style="background:#f5f3ee;padding:36px 32px 32px;">
                <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;color:#22241f;">{{ $heading }}</h1>

                @foreach ($lines as $line)
                    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#45473f;">{{ $line }}</p>
                @endforeach

                @if ($facts !== [])
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;border-top:1px solid #d9d4c9;">
                        @foreach ($facts as $label => $value)
                            <tr>
                                <td style="padding:10px 12px 10px 0;border-bottom:1px solid #d9d4c9;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6d66;white-space:nowrap;vertical-align:top;width:34%;">{{ $label }}</td>
                                <td style="padding:10px 0;border-bottom:1px solid #d9d4c9;font-size:15px;color:#22241f;vertical-align:top;word-break:break-word;">{{ $value }}</td>
                            </tr>
                        @endforeach
                    </table>
                @endif

                @if (filled($guestMessage ?? null))
                    <p style="margin:28px 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6d66;">Message</p>
                    <div style="padding:16px 18px;background:#ede8de;font-size:15px;line-height:1.6;color:#22241f;word-break:break-word;">{!! nl2br(e($guestMessage)) !!}</div>
                @endif
            </td>
        </tr>
        <tr>
            <td style="padding:20px 32px;text-align:center;font-size:12px;line-height:1.6;color:#6b6d66;">
                @if (filled($footnote ?? null))
                    <p style="margin:0 0 8px;">{{ $footnote }}</p>
                @endif
                <p style="margin:0;"><a href="{{ $site }}" style="color:#6b6d66;">{{ $villa }}</a> &middot; Hikkaduwa, Sri Lanka</p>
            </td>
        </tr>
    </table>
</td></tr>
</table>
</body>
</html>
