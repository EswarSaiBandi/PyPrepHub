'use client'

import { useState, FormEvent } from 'react'
import { Mail, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterProps {
  variant?: 'default' | 'compact' | 'inline'
  title?: string
  subtitle?: string
}

export function Newsletter({ variant = 'default', title, subtitle }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Subscription failed')
      setState('ok')
      setMessage('Welcome aboard — check your inbox to confirm.')
      setEmail('')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Subscription failed')
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-2" aria-label="Newsletter signup">
        <label htmlFor="nl-email" className="sr-only">Email</label>
        <div className="flex gap-2">
          <input
            id="nl-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none dark:border-ink-700 dark:bg-ink-900"
          />
          <button type="submit" disabled={state === 'loading'} className="btn-primary whitespace-nowrap">
            {state === 'loading' ? '...' : 'Subscribe'}
          </button>
        </div>
        {message && (
          <p className={cn('text-xs', state === 'ok' ? 'text-emerald-600' : 'text-rose-600')}>{message}</p>
        )}
      </form>
    )
  }

  return (
    <section className={cn('relative overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-brand-50 via-white to-brand-50 p-8 dark:border-ink-800 dark:from-ink-900 dark:via-ink-950 dark:to-ink-900', variant === 'inline' && 'p-6')}>
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <Mail className="h-3.5 w-3.5" /> Newsletter
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight">{title ?? 'Level up your interview prep.'}</h3>
          <p className="mt-2 text-sm text-muted">
            {subtitle ?? 'Weekly: one deep-dive article, two interview problems, and a curated reading list. No fluff, unsubscribe anytime.'}
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 md:w-auto" aria-label="Newsletter signup">
          <label htmlFor="nl-email-full" className="sr-only">Email</label>
          <div className="flex gap-2">
            <input
              id="nl-email-full"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none dark:border-ink-700 dark:bg-ink-900 md:w-72"
            />
            <button type="submit" disabled={state === 'loading'} className="btn-primary whitespace-nowrap">
              {state === 'ok' ? <><Check className="h-4 w-4" /> Subscribed</> : state === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
          {message && (
            <p className={cn('text-xs', state === 'ok' ? 'text-emerald-600' : 'text-rose-600')}>{message}</p>
          )}
        </form>
      </div>
    </section>
  )
}
