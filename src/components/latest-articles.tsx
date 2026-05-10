import Link from 'next/link'
import type { Post } from '@/lib/types'
import { ArticleCard } from './article-card'

export function LatestArticles({ posts }: { posts: Post[] }) {
  if (!posts.length) return null
  return (
    <section className="container py-16" aria-labelledby="latest-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="latest-heading" className="text-2xl font-bold md:text-3xl">Latest articles</h2>
          <p className="mt-1 text-sm text-muted">Fresh explainers, interview problems, and walkthroughs.</p>
        </div>
        <Link href="/blog" className="link text-sm">All articles →</Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  )
}
