import Link from 'next/link'
import { Binary, Brain, Briefcase, Code2, Database, LineChart, Sparkles, Table, Tag } from 'lucide-react'
import { categories } from '@/lib/categories'

const ICONS = {
  Code2, LineChart, Brain, Binary, Table, Database, Sparkles, Briefcase, Tag,
} as const

type IconName = keyof typeof ICONS

export function PopularCategories() {
  return (
    <section className="container py-16" aria-labelledby="cat-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="cat-heading" className="text-2xl font-bold md:text-3xl">Popular categories</h2>
          <p className="mt-1 text-sm text-muted">Browse by topic — everything is tagged for fast retrieval.</p>
        </div>
        <Link href="/blog" className="link text-sm">All articles →</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => {
          const Icon = ICONS[c.icon as IconName] ?? Tag
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative overflow-hidden rounded-xl border border-ink-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-500"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
