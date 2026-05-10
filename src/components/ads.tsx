'use client'

import { useEffect, useRef } from 'react'
import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

interface AdSlotProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  layout?: string
  className?: string
  style?: React.CSSProperties
  responsive?: boolean
  label?: string
}

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export function AdSlot({
  slot,
  format = 'auto',
  layout,
  className,
  style,
  responsive = true,
  label = 'Advertisement',
}: AdSlotProps) {
  const ref = useRef<HTMLModElement | null>(null)
  const client = siteConfig.adsense.client

  useEffect(() => {
    if (!client || !ref.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ignore
    }
  }, [client, slot])

  if (!client) {
    // No publisher ID set — render nothing in production so visitors see a clean page.
    // Set NEXT_PUBLIC_ADSENSE_CLIENT in your env vars once AdSense issues your ca-pub-… ID.
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          aria-hidden
          className={cn(
            'flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-ink-300 bg-ink-50 text-xs text-ink-400 dark:border-ink-700 dark:bg-ink-900',
            className,
          )}
          style={style}
        >
          Ad placeholder · set NEXT_PUBLIC_ADSENSE_CLIENT to enable
        </div>
      )
    }
    return null
  }

  return (
    <aside className={cn('ad-container', className)} aria-label={label}>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-400">{label}</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout && { 'data-ad-layout': layout })}
        {...(responsive && { 'data-full-width-responsive': 'true' })}
      />
    </aside>
  )
}

function adsEnabled(): boolean {
  return Boolean(siteConfig.adsense.client) || process.env.NODE_ENV === 'development'
}

export function TopBannerAd() {
  if (!adsEnabled()) return null
  return (
    <div className="border-b border-ink-200 bg-ink-50 py-2 dark:border-ink-800 dark:bg-ink-900/50">
      <div className="container">
        <AdSlot
          slot={siteConfig.adsense.slots.topBanner}
          format="horizontal"
          className="mx-auto max-w-5xl"
          style={{ minHeight: 90 }}
          label="Sponsored"
        />
      </div>
    </div>
  )
}

export function StickySidebarAd() {
  if (!adsEnabled()) return null
  return (
    <aside className="sticky top-24" aria-label="Sidebar advertising">
      <AdSlot
        slot={siteConfig.adsense.slots.sidebar}
        format="vertical"
        style={{ minHeight: 600 }}
      />
    </aside>
  )
}

export function InArticleAd() {
  if (!adsEnabled()) return null
  return (
    <div className="my-8">
      <AdSlot
        slot={siteConfig.adsense.slots.inArticle}
        format="fluid"
        layout="in-article"
        style={{ minHeight: 280 }}
      />
    </div>
  )
}

export function FooterAd() {
  if (!adsEnabled()) return null
  return (
    <AdSlot
      slot={siteConfig.adsense.slots.footer}
      format="horizontal"
      className="my-8"
      style={{ minHeight: 90 }}
    />
  )
}
