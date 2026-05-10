import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { cn, formatDate, slugify } from '@/lib/utils'
import type { Post } from '@/lib/types'
import { categoryBySlug } from '@/lib/categories'

interface ArticleCardProps {
  post: Post
  variant?: 'default' | 'horizontal' | 'compact' | 'featured'
  priority?: boolean
  className?: string
}

export function ArticleCard({ post, variant = 'default', priority, className }: ArticleCardProps) {
  const cat = categoryBySlug(slugify(post.category))
  const href = `/blog/${post.slug}`

  if (variant === 'compact') {
    return (
      <article className={cn('group flex gap-3', className)}>
        <Link href={href} className="shrink-0">
          <div className="relative h-16 w-20 overflow-hidden rounded-md bg-ink-100 dark:bg-ink-800">
            {post.cover && (
              <Image
                src={post.cover}
                alt={post.coverAlt ?? post.title}
                fill
                sizes="80px"
                className="object-cover transition group-hover:scale-105"
              />
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/category/${cat.slug}`} className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {cat.name}
          </Link>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">
            <Link href={href} className="hover:text-brand-600 dark:hover:text-brand-400">
              {post.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-muted">{formatDate(post.date)} · {post.readingTime}</p>
        </div>
      </article>
    )
  }

  if (variant === 'horizontal') {
    return (
      <article className={cn('card group grid overflow-hidden md:grid-cols-[240px_1fr]', className)}>
        <Link href={href} className="relative block aspect-[16/10] md:aspect-auto">
          <div className="absolute inset-0 bg-ink-100 dark:bg-ink-800">
            {post.cover && (
              <Image
                src={post.cover}
                alt={post.coverAlt ?? post.title}
                fill
                sizes="(min-width: 768px) 240px, 100vw"
                className="object-cover transition group-hover:scale-[1.03]"
                priority={priority}
              />
            )}
          </div>
        </Link>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs">
            <Link href={`/category/${cat.slug}`} className="font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              {cat.name}
            </Link>
            <span className="text-ink-300">·</span>
            <time dateTime={post.date} className="text-muted">{formatDate(post.date)}</time>
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug">
            <Link href={href} className="hover:text-brand-600 dark:hover:text-brand-400">{post.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{post.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime}</span>
            <span>{post.wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className={cn('group relative overflow-hidden rounded-2xl', className)}>
        <Link href={href} className="block">
          <div className="relative aspect-[16/10] bg-ink-100 dark:bg-ink-800">
            {post.cover && (
              <Image
                src={post.cover}
                alt={post.coverAlt ?? post.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                priority={priority}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
              {cat.name}
            </span>
            <h3 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">{post.title}</h3>
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-ink-200">{post.description}</p>
            <p className="mt-3 text-xs text-ink-300">{formatDate(post.date)} · {post.readingTime}</p>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className={cn('card group flex h-full flex-col overflow-hidden', className)}>
      <Link href={href} className="relative block aspect-[16/9]">
        <div className="absolute inset-0 bg-ink-100 dark:bg-ink-800">
          {post.cover && (
            <Image
              src={post.cover}
              alt={post.coverAlt ?? post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              priority={priority}
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          <Link href={`/category/${cat.slug}`} className="font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {cat.name}
          </Link>
          <span className="text-ink-300">·</span>
          <time dateTime={post.date} className="text-muted">{formatDate(post.date)}</time>
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug">
          <Link href={href} className="hover:text-brand-600 dark:hover:text-brand-400">{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.description}</p>
        <div className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4 text-xs text-muted dark:border-ink-800">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime}</span>
          {post.difficulty && <span className="capitalize">{post.difficulty}</span>}
        </div>
      </div>
    </article>
  )
}
