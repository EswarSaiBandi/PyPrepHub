import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article-card'
import { Pagination } from '@/components/pagination'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { getAllPosts, paginate } from '@/lib/posts'
import { siteConfig } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'

interface Params {
  params: { page: string }
}

export function generateStaticParams() {
  const total = Math.ceil(getAllPosts().length / siteConfig.postsPerPage)
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ page: String(i + 2) }))
}

export function generateMetadata({ params }: Params): Metadata {
  const page = Number(params.page)
  return buildMetadata({
    title: `All articles · Page ${page}`,
    description: `Browse PyPrepHub articles — page ${page}.`,
    path: `/blog/page/${page}`,
  })
}

export default function BlogPaginated({ params }: Params) {
  const pageNum = Number(params.page)
  if (!Number.isFinite(pageNum) || pageNum < 2) notFound()

  const all = getAllPosts()
  const result = paginate(all, pageNum)
  if (pageNum > result.totalPages) notFound()

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Articles', href: '/blog' },
          { name: `Page ${pageNum}`, href: `/blog/page/${pageNum}` },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        All articles · Page {pageNum}
      </h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} basePath="/blog" />
    </div>
  )
}
