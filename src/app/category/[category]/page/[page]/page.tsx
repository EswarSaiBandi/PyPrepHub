import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article-card'
import { Pagination } from '@/components/pagination'
import { Breadcrumbs } from '@/components/breadcrumbs'
import {
  getAllCategorySlugs,
  getPostsByCategory,
  paginate,
} from '@/lib/posts'
import { siteConfig } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'
import { categoryBySlug } from '@/lib/categories'

interface Params { params: { category: string; page: string } }

export function generateStaticParams() {
  const out: { category: string; page: string }[] = []
  for (const category of getAllCategorySlugs()) {
    const total = Math.ceil(getPostsByCategory(category).length / siteConfig.postsPerPage)
    for (let i = 2; i <= total; i++) out.push({ category, page: String(i) })
  }
  return out
}

export function generateMetadata({ params }: Params): Metadata {
  const cat = categoryBySlug(params.category)
  return buildMetadata({
    title: `${cat.name} · Page ${params.page}`,
    description: cat.description,
    path: `/category/${params.category}/page/${params.page}`,
  })
}

export default function CategoryPaginated({ params }: Params) {
  const pageNum = Number(params.page)
  if (!Number.isFinite(pageNum) || pageNum < 2) notFound()
  const posts = getPostsByCategory(params.category)
  const result = paginate(posts, pageNum)
  if (pageNum > result.totalPages) notFound()
  const cat = categoryBySlug(params.category)

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: cat.name, href: `/category/${params.category}` },
          { name: `Page ${pageNum}`, href: `/category/${params.category}/page/${pageNum}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        {cat.name} · Page {pageNum}
      </h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.posts.map((p) => <ArticleCard key={p.slug} post={p} />)}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} basePath={`/category/${params.category}`} />
    </div>
  )
}
