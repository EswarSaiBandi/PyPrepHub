import { cn } from '@/lib/utils'

export function PostBody({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn('prose prose-zinc max-w-none dark:prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
