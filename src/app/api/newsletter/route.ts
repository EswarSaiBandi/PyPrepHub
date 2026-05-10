import { NextResponse } from 'next/server'

export const runtime = 'edge'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function subscribeButtondown(email: string) {
  const key = process.env.NEWSLETTER_API_KEY
  if (!key) return { ok: false, error: 'Newsletter provider not configured' }
  const res = await fetch('https://api.buttondown.email/v1/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${key}`,
    },
    body: JSON.stringify({ email }),
  })
  if (res.ok) return { ok: true }
  const data = (await res.json().catch(() => ({}))) as { detail?: string }
  return { ok: false, error: data.detail ?? 'Subscription failed' }
}

async function subscribeConvertKit(email: string) {
  const key = process.env.NEWSLETTER_API_KEY
  const formId = process.env.NEWSLETTER_LIST_ID
  if (!key || !formId) return { ok: false, error: 'Newsletter provider not configured' }
  const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, email }),
  })
  if (res.ok) return { ok: true }
  return { ok: false, error: 'Subscription failed' }
}

async function subscribeMailchimp(email: string) {
  const key = process.env.NEWSLETTER_API_KEY
  const listId = process.env.NEWSLETTER_LIST_ID
  if (!key || !listId) return { ok: false, error: 'Newsletter provider not configured' }
  const dc = key.split('-')[1]
  if (!dc) return { ok: false, error: 'Malformed Mailchimp API key' }
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `apikey ${key}`,
    },
    body: JSON.stringify({ email_address: email, status: 'pending' }),
  })
  if (res.ok) return { ok: true }
  const data = (await res.json().catch(() => ({}))) as { detail?: string }
  return { ok: false, error: data.detail ?? 'Subscription failed' }
}

export async function POST(req: Request) {
  let body: { email?: string; honeypot?: string }
  try {
    body = (await req.json()) as { email?: string; honeypot?: string }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const email = body.email?.trim().toLowerCase()
  if (body.honeypot) return NextResponse.json({ ok: true })
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 400 })
  }
  if (email.length > 254) {
    return NextResponse.json({ ok: false, error: 'Email too long' }, { status: 400 })
  }

  const provider = (process.env.NEWSLETTER_PROVIDER ?? 'buttondown').toLowerCase()
  const result =
    provider === 'convertkit'
      ? await subscribeConvertKit(email)
      : provider === 'mailchimp'
        ? await subscribeMailchimp(email)
        : await subscribeButtondown(email)

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
