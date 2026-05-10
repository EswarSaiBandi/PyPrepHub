import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article-card'
import { Pagination } from '@/components/pagination'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { EmptyState } from '@/components/empty-state'
import { Newsletter } from '@/components/newsletter'
import {
  getAllCategorySlugs,
  getPostsByCategory,
  paginate,
} from '@/lib/posts'
import { buildMetadata } from '@/lib/seo'
import { categoryBySlug, getCategory } from '@/lib/categories'

interface Params { params: { category: string } }

export function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }))
}

export function generateMetadata({ params }: Params): Metadata {
  const cat = categoryBySlug(params.category)
  return buildMetadata({
    title: `${cat.name} — articles and tutorials`,
    description: cat.description || `Articles on ${cat.name} — tutorials, interview problems, and deep dives.`,
    path: `/category/${params.category}`,
  })
}

export default function CategoryPage({ params }: Params) {
  const posts = getPostsByCategory(params.category)
  const declared = getCategory(params.category)
  if (!posts.length && !declared) notFound()
  const cat = categoryBySlug(params.category)
  const { posts: page, page: cur, totalPages } = paginate(posts, 1)

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Categories', href: '/blog' },
          { name: cat.name, href: `/category/${params.category}` },
        ]}
      />
      <header className="mt-4 border-b border-ink-200 pb-8 dark:border-ink-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Category</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{cat.name}</h1>
        {cat.description && <p className="mt-2 max-w-2xl text-muted">{cat.description}</p>}
        <p className="mt-2 text-sm text-muted">{posts.length} article{posts.length === 1 ? '' : 's'}</p>
      </header>

      {page.length === 0 ? (
        <EmptyState title="No articles yet in this category" />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {page.map((p) => <ArticleCard key={p.slug} post={p} />)}
        </div>
      )}

      <Pagination page={cur} totalPages={totalPages} basePath={`/category/${params.category}`} />

      <section className="mt-20"><Newsletter /></section>
    </div>
  )
}
