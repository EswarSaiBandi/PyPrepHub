import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchClient } from '@/components/search-client'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { buildSearchIndex } from '@/lib/search-index'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Search',
  description: 'Search articles across Python, Pandas, NumPy, SQL, Machine Learning, and AI.',
  path: '/search',
  noIndex: true,
})

export default function SearchPage() {
  const docs = buildSearchIndex()
  return (
    <div className="container max-w-3xl py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Search', href: '/search' }]} />
      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Search</h1>
        <p className="mt-2 text-muted">Instant, client-side search across {docs.length} article{docs.length === 1 ? '' : 's'}.</p>
      </header>
      <div className="mt-8">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-900" />}>
          <SearchClient docs={docs} />
        </Suspense>
      </div>
    </div>
  )
}
