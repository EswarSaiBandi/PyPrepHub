import { getAllPosts } from './posts'

export interface SearchDoc {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  date: string
}

export function buildSearchIndex(): SearchDoc[] {
  return getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    tags: p.tags,
    date: p.date,
  }))
}
