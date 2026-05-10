import type { Metadata } from 'next'
import { siteConfig } from './site'
import type { Post } from './types'

interface BuildMetadataArgs {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  noIndex?: boolean
}

export function absoluteUrl(path = ''): string {
  const base = siteConfig.url.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function buildMetadata(args: BuildMetadataArgs = {}): Metadata {
  const title = args.title ? `${args.title} | ${siteConfig.name}` : siteConfig.name
  const description = args.description ?? siteConfig.description
  const url = absoluteUrl(args.path ?? '/')
  const image = args.image ?? absoluteUrl(siteConfig.ogImage)

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    applicationName: siteConfig.name,
    authors: args.authors?.map((name) => ({ name })) ?? [{ name: siteConfig.author.name }],
    keywords: args.tags,
    alternates: {
      canonical: url,
      types: {
        'application/rss+xml': [{ url: absoluteUrl('/feed.xml'), title: `${siteConfig.name} — RSS feed` }],
      },
    },
    robots: args.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: args.type ?? 'website',
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(args.type === 'article' && {
        publishedTime: args.publishedTime,
        modifiedTime: args.modifiedTime ?? args.publishedTime,
        authors: args.authors,
        tags: args.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: siteConfig.author.twitter,
      site: siteConfig.author.twitter,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    },
  }
}

export function postMetadata(post: Post): Metadata {
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.cover ? absoluteUrl(post.cover) : undefined,
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    authors: [post.author ?? siteConfig.author.name],
    tags: post.tags,
  })
}
