import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Check back soon — new articles are published weekly.',
  ctaHref = '/blog',
  ctaLabel = 'Browse all articles',
}: {
  title?: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-12 text-center dark:border-ink-700 dark:bg-ink-900/50">
      <FileQuestion className="mx-auto h-10 w-10 text-ink-400" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      <Link href={ctaHref} className="btn-primary mt-6">{ctaLabel}</Link>
    </div>
  )
}
