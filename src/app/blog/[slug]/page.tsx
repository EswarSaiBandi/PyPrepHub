import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, User } from 'lucide-react'
import { getAllPosts, getPostRaw, getRelatedPosts } from '@/lib/posts'
import { renderMarkdown } from '@/lib/mdx'
import { postMetadata, absoluteUrl } from '@/lib/seo'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import { formatDate, slugify } from '@/lib/utils'
import { categoryBySlug } from '@/lib/categories'
import { PostBody } from '@/components/post-body'
import { TableOfContents } from '@/components/table-of-contents'
import { ReadingProgress } from '@/components/reading-progress'
import { RelatedArticles } from '@/components/related-articles'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { TagList } from '@/components/tag-list'
import { ShareButtons } from '@/components/share-buttons'
import { Comments } from '@/components/comments'
import { Newsletter } from '@/components/newsletter'
import { JsonLd } from '@/components/json-ld'
import { StickySidebarAd, InArticleAd } from '@/components/ads'

interface Params {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const data = getPostRaw(params.slug)
  if (!data) return { title: 'Not found' }
  return postMetadata(data.post)
}

export default async function PostPage({ params }: Params) {
  const data = getPostRaw(params.slug)
  if (!data) notFound()

  const { post, markdown } = data
  const { html, headings } = await renderMarkdown(markdown)
  const related = getRelatedPosts(post)
  const cat = categoryBySlug(slugify(post.category))
  const url = absoluteUrl(`/blog/${post.slug}`)

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={[
          articleSchema(post),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Articles', url: '/blog' },
            { name: cat.name, url: `/category/${cat.slug}` },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article className="container py-10">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Articles', href: '/blog' },
            { name: cat.name, href: `/category/${cat.slug}` },
            { name: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        <header className="mx-auto mt-6 max-w-3xl text-center">
          <Link
            href={`/category/${cat.slug}`}
            className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
          >
            {cat.name}
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted">{post.description}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.updated && post.updated !== post.date && (
                <span className="text-ink-400"> · updated {formatDate(post.updated)}</span>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readingTime}</span>
          </div>
        </header>

        {post.cover && (
          <figure className="mx-auto mt-10 max-w-4xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
              <Image
                src={post.cover}
                alt={post.coverAlt ?? post.title}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </figure>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <PostBody html={html} />

            <InArticleAd />

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6 dark:border-ink-800">
              <TagList tags={post.tags} />
              <ShareButtons url={url} title={post.title} />
            </div>

            <div className="mt-10">
              <Newsletter variant="inline" title="Enjoyed this piece?" subtitle="Get the next one in your inbox. One email a week, zero fluff." />
            </div>

            <div className="mt-16">
              <h2 className="text-xl font-bold">Discussion</h2>
              <p className="mt-1 text-sm text-muted">Share feedback, ask questions, or report corrections.</p>
              <div className="mt-6">
                <Comments slug={post.slug} />
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <TableOfContents headings={headings} />
              <StickySidebarAd />
            </div>
          </aside>
        </div>

        <RelatedArticles posts={related} />
      </article>
    </>
  )
}
