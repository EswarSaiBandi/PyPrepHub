import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleCard } from '@/components/article-card'
import { Pagination } from '@/components/pagination'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { EmptyState } from '@/components/empty-state'
import { getAllPosts, getAllTags, paginate } from '@/lib/posts'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'All articles',
  description: 'Every article on PyPrepHub — Python, data science, ML, SQL, and interview prep.',
  path: '/blog',
})

export default function BlogIndex() {
  const all = getAllPosts()
  const { posts, page, totalPages } = paginate(all, 1)
  const tags = getAllTags().slice(0, 16)

  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Articles', href: '/blog' }]} />
      <header className="mt-4 border-b border-ink-200 pb-8 dark:border-ink-800">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All articles</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {all.length} article{all.length === 1 ? '' : 's'} across Python, data engineering, ML, and interviews.
        </p>
        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tag/${tag}`} className="chip">
                #{tag} <span className="text-ink-400">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <ArticleCard key={p.slug} post={p} priority={i < 3} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/blog" />
    </div>
  )
}
