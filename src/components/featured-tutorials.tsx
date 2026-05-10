import Link from 'next/link'
import type { Post } from '@/lib/types'
import { ArticleCard } from './article-card'

export function FeaturedTutorials({ posts }: { posts: Post[] }) {
  if (!posts.length) return null
  const [hero, ...rest] = posts
  return (
    <section className="container py-16" aria-labelledby="featured-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="featured-heading" className="text-2xl font-bold md:text-3xl">Featured tutorials</h2>
          <p className="mt-1 text-sm text-muted">Deep, worked walkthroughs our editors recommend first.</p>
        </div>
        <Link href="/blog" className="link text-sm">View all →</Link>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ArticleCard post={hero} variant="featured" priority />
        <div className="grid gap-6">
          {rest.slice(0, 3).map((p) => (
            <ArticleCard key={p.slug} post={p} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  )
}
