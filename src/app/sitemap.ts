import type { MetadataRoute } from 'next'
import { getAllPosts, getAllCategorySlugs, getAllTags } from '@/lib/posts'
import { siteConfig } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, '')
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: 'weekly',
    priority: p.featured ? 0.9 : 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = getAllCategorySlugs().map((c) => ({
    url: `${base}/category/${c}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map(({ tag }) => ({
    url: `${base}/tag/${tag}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes]
}
