'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Heading } from '@/lib/types'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!headings.length) return
    const ids = headings.map((h) => h.id)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: [0, 1] },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 0.75}rem` }}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block truncate border-l-2 pl-3 py-0.5 transition',
                active === h.id
                  ? 'border-brand-500 font-semibold text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
