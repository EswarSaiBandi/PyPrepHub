'use client'

import { useMemo, useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SearchDoc } from '@/lib/search-index'
import { formatDate } from '@/lib/utils'

interface Props {
  docs: SearchDoc[]
}

export function SearchClient({ docs }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get('q') ?? ''
  const [q, setQ] = useState(initial)

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'description', weight: 0.25 },
          { name: 'tags', weight: 0.15 },
          { name: 'category', weight: 0.1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [docs],
  )

  useEffect(() => {
    const t = setTimeout(() => {
      const url = new URL(window.location.href)
      if (q) url.searchParams.set('q', q)
      else url.searchParams.delete('q')
      router.replace(url.pathname + url.search, { scroll: false })
    }, 200)
    return () => clearTimeout(t)
  }, [q, router])

  const results = q.trim().length >= 2 ? fuse.search(q).slice(0, 30).map((r) => r.item) : []

  return (
    <div>
      <label htmlFor="search-q" className="sr-only">Search</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          id="search-q"
          type="search"
          autoFocus
          placeholder="Search Python, pandas, SQL, ML…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-10 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Clear"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {q.trim().length < 2 ? (
        <p className="mt-6 text-sm text-muted">Type at least 2 characters to search.</p>
      ) : results.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No results for <span className="font-semibold text-ink-700 dark:text-ink-200">“{q}”</span>. Try another keyword.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {results.length} result{results.length === 1 ? '' : 's'} for <span className="font-semibold text-ink-700 dark:text-ink-200">“{q}”</span>
          </p>
          <ul className="mt-4 divide-y divide-ink-100 dark:divide-ink-800">
            {results.map((r) => (
              <li key={r.slug} className="py-4">
                <Link href={`/blog/${r.slug}`} className="group block">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                    {r.category}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {r.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{r.description}</p>
                  <p className="mt-2 text-xs text-muted">{formatDate(r.date)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
