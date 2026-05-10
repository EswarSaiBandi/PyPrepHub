import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'
import type { Post } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export function DailyChallenge({ post }: { post: Post | null }) {
  if (!post) return null
  return (
    <section className="container py-8" aria-labelledby="challenge-heading">
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-8 dark:border-brand-800/40 dark:from-brand-950/30 dark:via-ink-950 dark:to-ink-900">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <Flame className="h-3.5 w-3.5" /> Daily challenge · {formatDate(new Date().toISOString())}
            </div>
            <h2 id="challenge-heading" className="mt-3 text-2xl font-bold md:text-3xl">
              {post.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">{post.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>{post.readingTime}</span>
              {post.difficulty && <span className="capitalize">Difficulty: {post.difficulty}</span>}
              <span>{post.category}</span>
            </div>
          </div>
          <Link href={`/blog/${post.slug}`} className="btn-primary whitespace-nowrap">
            Solve it <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
