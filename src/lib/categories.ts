import type { Category } from './types'

export const categories: Category[] = [
  {
    slug: 'python',
    name: 'Python',
    description: 'Core Python, idioms, the standard library, and performance tips.',
    color: 'from-yellow-400 to-blue-500',
    icon: 'Code2',
  },
  {
    slug: 'data-science',
    name: 'Data Science',
    description: 'End-to-end data workflows, feature engineering, and statistics.',
    color: 'from-emerald-400 to-teal-600',
    icon: 'LineChart',
  },
  {
    slug: 'machine-learning',
    name: 'Machine Learning',
    description: 'Classical ML, deep learning, and model evaluation.',
    color: 'from-rose-400 to-fuchsia-600',
    icon: 'Brain',
  },
  {
    slug: 'numpy',
    name: 'NumPy',
    description: 'Vectorization, broadcasting, and numerical computing tricks.',
    color: 'from-sky-400 to-indigo-600',
    icon: 'Binary',
  },
  {
    slug: 'pandas',
    name: 'Pandas',
    description: 'DataFrames, groupby, joins, and production-grade pipelines.',
    color: 'from-amber-400 to-orange-600',
    icon: 'Table',
  },
  {
    slug: 'sql',
    name: 'SQL',
    description: 'Window functions, query plans, and interview-style problems.',
    color: 'from-cyan-400 to-blue-600',
    icon: 'Database',
  },
  {
    slug: 'ai',
    name: 'AI & LLMs',
    description: 'Transformer internals, prompting, and production LLM systems.',
    color: 'from-violet-400 to-purple-600',
    icon: 'Sparkles',
  },
  {
    slug: 'interviews',
    name: 'Interviews',
    description: 'Curated interview questions with clear, worked solutions.',
    color: 'from-slate-400 to-zinc-700',
    icon: 'Briefcase',
  },
]

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function categoryBySlug(slug: string): Category {
  return (
    getCategory(slug) ?? {
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: '',
      color: 'from-ink-400 to-ink-700',
      icon: 'Tag',
    }
  )
}
