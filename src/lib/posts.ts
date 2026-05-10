import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { cache } from 'react'
import type { Post, PostFrontmatter, PaginatedPosts } from './types'
import { excerptFrom, slugify, unique } from './utils'
import { siteConfig } from './site'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

function readAllFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
}

function parseFile(filename: string): Post | null {
  const full = path.join(POSTS_DIR, filename)
  const raw = fs.readFileSync(full, 'utf8')
  const { data, content } = matter(raw)
  const fm = data as Partial<PostFrontmatter>
  if (!fm.title || !fm.date || !fm.category) return null
  if (fm.draft && process.env.NODE_ENV === 'production') return null
  const slug = filename.replace(/\.(md|mdx)$/, '')
  const rt = readingTime(content)
  return {
    slug,
    title: fm.title,
    description: fm.description ?? excerptFrom(content, 160),
    date: fm.date,
    updated: fm.updated,
    author: fm.author ?? siteConfig.author.name,
    category: fm.category,
    tags: (fm.tags ?? []).map((t) => t.toLowerCase()),
    cover: fm.cover,
    coverAlt: fm.coverAlt,
    featured: fm.featured ?? false,
    trending: fm.trending ?? false,
    draft: fm.draft ?? false,
    series: fm.series,
    difficulty: fm.difficulty,
    readingTime: rt.text,
    wordCount: rt.words,
    excerpt: excerptFrom(content, 200),
  }
}

export const getAllPosts = cache((): Post[] => {
  const files = readAllFiles()
  const posts = files.map(parseFile).filter((p): p is Post => p !== null)
  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  return posts
})

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null
}

export function getPostRaw(slug: string): { post: Post; markdown: string } | null {
  const candidates = [`${slug}.md`, `${slug}.mdx`]
  for (const c of candidates) {
    const full = path.join(POSTS_DIR, c)
    if (fs.existsSync(full)) {
      const raw = fs.readFileSync(full, 'utf8')
      const { content } = matter(raw)
      const post = parseFile(c)
      if (post) return { post, markdown: content }
    }
  }
  return null
}

export function getPostsByCategory(categorySlug: string): Post[] {
  return getAllPosts().filter((p) => slugify(p.category) === categorySlug)
}

export function getPostsByTag(tag: string): Post[] {
  const target = tag.toLowerCase()
  return getAllPosts().filter((p) => p.tags.includes(target))
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of getAllPosts()) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function getAllCategorySlugs(): string[] {
  return unique(getAllPosts().map((p) => slugify(p.category)))
}

export function getFeaturedPosts(limit = 4): Post[] {
  const featured = getAllPosts().filter((p) => p.featured)
  return (featured.length ? featured : getAllPosts()).slice(0, limit)
}

export function getTrendingPosts(limit = 6): Post[] {
  const trending = getAllPosts().filter((p) => p.trending)
  return (trending.length ? trending : getAllPosts()).slice(0, limit)
}

export function getLatestPosts(limit = 6): Post[] {
  return getAllPosts().slice(0, limit)
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const sameCategory = slugify(p.category) === slugify(post.category) ? 3 : 0
      const tagOverlap = p.tags.filter((t) => post.tags.includes(t)).length
      return { post: p, score: sameCategory + tagOverlap }
    })
    .sort((a, b) => b.score - a.score || +new Date(b.post.date) - +new Date(a.post.date))
    .slice(0, limit)
    .map((x) => x.post)
}

export function paginate(posts: Post[], page: number, perPage = siteConfig.postsPerPage): PaginatedPosts {
  const total = posts.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  return {
    posts: posts.slice(start, start + perPage),
    page: current,
    totalPages,
    total,
  }
}

export function getDailyChallenge(): Post | null {
  const interview = getAllPosts().filter(
    (p) => slugify(p.category) === 'interviews' || p.tags.includes('challenge'),
  )
  const pool = interview.length ? interview : getAllPosts()
  if (!pool.length) return null
  const day = Math.floor(Date.now() / 86_400_000)
  return pool[day % pool.length]
}
