import type { Post } from '@/lib/types'
import { ArticleCard } from './article-card'

export function RelatedArticles({ posts }: { posts: Post[] }) {
  if (!posts.length) return null
  return (
    <section className="mt-16" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-bold">Related articles</h2>
      <p className="mt-1 text-sm text-muted">Continue exploring topics from this piece.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
    </section>
  )
}
