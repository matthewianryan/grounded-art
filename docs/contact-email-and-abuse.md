# Contact email and abuse controls

The contact form posts to the API, stores every accepted message in Postgres, and then sends
an internal notification through Resend. Email delivery is a notification path only; the
database remains the source of truth.

## Environment

All project environment values live in the repo-root `.env`. Copy `.env.example` to `.env`.
Do not create app-local `.env` files under `apps/api`, `apps/landing`, or `apps/web`.

Required production contact values:

```bash
RESEND_API_KEY=
RESEND_API_URL=https://api.resend.com/emails
CONTACT_NOTIFICATION_TO=hello@grounded-art.co.za
CONTACT_NOTIFICATION_FROM="Grounded Art <notifications@grounded-art.co.za>"
CONTACT_NOTIFICATION_REPLY_TO_SUBMITTER=true
CORS_ORIGINS=["https://grounded-art.co.za","https://www.grounded-art.co.za"]
```

Leave the Turnstile values blank until spam makes it necessary:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_SITEVERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify
```

## Resend DNS

In Resend, the sending domain is `grounded-art.co.za`. Add the exact DNS records shown on
the Resend domain screen at your DNS provider. Values are unique per Resend domain setup, so
do not copy placeholder or truncated values from screenshots.

Typical Resend records for this domain setup:

| Purpose | Type | Name | Value | Priority |
| --- | --- | --- | --- | --- |
| DKIM | TXT | `resend._domainkey` | the full `p=...` key from Resend | |
| Return path / SPF | MX | `send` | the full `feedback-smtp...amazonses.com` host from Resend | `10` |
| SPF | TXT | `send` | the full `v=spf1 ... ~all` value from Resend | |

If your DNS is in Cloudflare, enter the record names exactly as Resend shows them, leave TTL
on Auto, and make sure these records are DNS-only. TXT and MX records are not proxied.

Also add DMARC if the domain does not already have it:

| Type | Name | Value |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@grounded-art.co.za; adkim=s; aspf=s` |

Start with `p=none` so delivery can be observed without rejecting legitimate mail. Move to
`quarantine` or `reject` only after DKIM/SPF alignment is confirmed.

## Abuse controls

Always enabled:

- Server-side IP rate limit.
- Server-side email rate limit.
- Hidden honeypot field. Honeypot hits receive a no-content success response and are not
  stored or emailed.
- Maximum field lengths and minimum message length.

Optional:

- Cloudflare Turnstile. Set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
  to enable it. If `TURNSTILE_SECRET_KEY` is blank, the API does not require a challenge.

Default rate limits:

```bash
CONTACT_RATE_LIMIT_IP_MAX=5
CONTACT_RATE_LIMIT_IP_WINDOW_SECONDS=900
CONTACT_RATE_LIMIT_EMAIL_MAX=3
CONTACT_RATE_LIMIT_EMAIL_WINDOW_SECONDS=3600
```
