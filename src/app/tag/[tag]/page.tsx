import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article-card'
import { Pagination } from '@/components/pagination'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { EmptyState } from '@/components/empty-state'
import { getAllTags, getPostsByTag, paginate } from '@/lib/posts'
import { buildMetadata } from '@/lib/seo'

interface Params { params: { tag: string } }

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }))
}

export function generateMetadata({ params }: Params): Metadata {
  return buildMetadata({
    title: `#${params.tag}`,
    description: `Articles tagged #${params.tag} on PyPrepHub.`,
    path: `/tag/${params.tag}`,
  })
}

export default function TagPage({ params }: Params) {
  const tag = decodeURIComponent(params.tag).toLowerCase()
  const posts = getPostsByTag(tag)
  if (!posts.length) notFound()
  const { posts: page, page: cur, totalPages } = paginate(posts, 1)

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Tags', href: '/blog' },
          { name: `#${tag}`, href: `/tag/${tag}` },
        ]}
      />
      <header className="mt-4 border-b border-ink-200 pb-8 dark:border-ink-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Tag</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">#{tag}</h1>
        <p className="mt-2 text-sm text-muted">{posts.length} article{posts.length === 1 ? '' : 's'}</p>
      </header>

      {page.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {page.map((p) => <ArticleCard key={p.slug} post={p} />)}
        </div>
      )}

      <Pagination page={cur} totalPages={totalPages} basePath={`/tag/${tag}`} />
    </div>
  )
}
