import type { Metadata } from 'next'
import Link from 'next/link'
import { Binary, Brain, Briefcase, Code2, Database, LineChart, Sparkles, Table, Tag } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { categories } from '@/lib/categories'
import { getAllPosts, getAllTags, getPostsByCategory } from '@/lib/posts'
import { slugify } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'

const ICONS = { Code2, LineChart, Brain, Binary, Table, Database, Sparkles, Briefcase, Tag } as const
type IconName = keyof typeof ICONS

export const metadata: Metadata = buildMetadata({
  title: 'Topics',
  description: 'Every category and tag on PyPrepHub — browse by topic.',
  path: '/topics',
})

export default function TopicsPage() {
  const all = getAllPosts()
  const tags = getAllTags()

  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Topics', href: '/topics' }]} />
      <header className="mt-4 border-b border-ink-200 pb-8 dark:border-ink-800">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse all topics</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {all.length} articles across {categories.length} categories and {tags.length} tags. Pick a category to start.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = getPostsByCategory(c.slug).length
            const Icon = ICONS[c.icon as IconName] ?? Tag
            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-500"
              >
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-semibold">{c.name}</h3>
                    <span className="shrink-0 text-xs font-semibold text-muted">{count} article{count === 1 ? '' : 's'}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {tags.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold">All tags</h2>
          <p className="mt-1 text-sm text-muted">Sorted by article count.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tag/${tag}`} className="chip">
                #{tag} <span className="text-ink-400">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-xl font-semibold">Recent articles by category</h2>
        <div className="mt-6 space-y-8">
          {categories.map((c) => {
            const posts = getPostsByCategory(c.slug).slice(0, 3)
            if (!posts.length) return null
            return (
              <div key={c.slug}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold">
                    <Link href={`/category/${c.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">{c.name}</Link>
                  </h3>
                  <Link href={`/category/${c.slug}`} className="link text-sm">All →</Link>
                </div>
                <ul className="mt-3 divide-y divide-ink-100 dark:divide-ink-800">
                  {posts.map((p) => (
                    <li key={p.slug} className="py-3">
                      <Link href={`/blog/${p.slug}`} className="group flex items-center justify-between gap-4">
                        <span className="line-clamp-1 font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400">{p.title}</span>
                        <span className="shrink-0 text-xs text-muted">{p.readingTime}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
