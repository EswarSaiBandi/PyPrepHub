import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  basePath: string
}

export function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const build = (n: number) => (n === 1 ? basePath : `${basePath}/page/${n}`)
  const pages = range(page, totalPages)

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink
        href={build(Math.max(1, page - 1))}
        disabled={page <= 1}
        rel="prev"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </PageLink>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} className="px-2 text-ink-400">…</span>
        ) : (
          <PageLink
            key={p}
            href={build(p)}
            current={p === page}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </PageLink>
        ),
      )}
      <PageLink
        href={build(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        rel="next"
        aria-label="Next page"
      >
        Next <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  )
}

function PageLink({
  href,
  children,
  current,
  disabled,
  ...rest
}: {
  href: string
  children: React.ReactNode
  current?: boolean
  disabled?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = cn(
    'inline-flex min-w-9 items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition',
    current
      ? 'border-brand-600 bg-brand-600 text-white'
      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800',
    disabled && 'pointer-events-none opacity-40',
  )
  if (disabled) return <span className={cls}>{children}</span>
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  )
}

function range(current: number, total: number): (number | '…')[] {
  const out: (number | '…')[] = []
  const window = 1
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= window) {
      out.push(i)
    } else if (out[out.length - 1] !== '…') {
      out.push('…')
    }
  }
  return out
}
