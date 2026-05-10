export interface PostFrontmatter {
  title: string
  description: string
  date: string
  updated?: string
  author?: string
  category: string
  tags: string[]
  cover?: string
  coverAlt?: string
  draft?: boolean
  featured?: boolean
  trending?: boolean
  series?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface Post extends PostFrontmatter {
  slug: string
  readingTime: string
  wordCount: number
  excerpt: string
}

export interface PostWithContent extends Post {
  content: string
  headings: Heading[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface Category {
  slug: string
  name: string
  description: string
  color: string
  icon: string
}

export interface PaginatedPosts {
  posts: Post[]
  page: number
  totalPages: number
  total: number
}
