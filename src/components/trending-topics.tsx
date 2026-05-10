import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import type { Post } from '@/lib/types'
import { ArticleCard } from './article-card'

export function TrendingTopics({ posts, tags }: { posts: Post[]; tags: { tag: string; count: number }[] }) {
  return (
    <section className="container py-16" aria-labelledby="trending-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="trending-heading" className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <TrendingUp className="h-6 w-6 text-brand-600" /> Trending this week
          </h2>
          <p className="mt-1 text-sm text-muted">What the community is reading right now.</p>
        </div>
        <Link href="/blog" className="link text-sm">All articles →</Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <ol className="divide-y divide-ink-100 dark:divide-ink-800">
          {posts.slice(0, 5).map((p, i) => (
            <li key={p.slug} className="flex gap-4 py-5 first:pt-0 last:pb-0">
              <span className="shrink-0 bg-gradient-to-br from-brand-500 to-brand-800 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <ArticleCard post={p} variant="compact" />
              </div>
            </li>
          ))}
        </ol>

        <aside>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Hot tags
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 18).map(({ tag, count }) => (
              <Link key={tag} href={`/tag/${tag}`} className="chip">
                #{tag} <span className="text-ink-400">{count}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
