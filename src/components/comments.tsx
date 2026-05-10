'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Comments({ slug }: { slug: string }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'General'
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  if (!repo || !repoId || !categoryId) {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-6 text-center text-sm text-muted dark:border-ink-700 dark:bg-ink-900">
        Comments are disabled. Set Giscus environment variables to enable them — see
        {' '}<code className="rounded bg-ink-200 px-1 dark:bg-ink-800">.env.example</code>.
      </div>
    )
  }

  if (!mounted) return <div className="h-64 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-900" />

  return (
    <div className="giscus-wrapper" key={resolvedTheme}>
      <Giscus
        id={`comments-${slug}`}
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="specific"
        term={slug}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === 'dark' ? 'dark_dimmed' : 'light'}
        lang="en"
        loading="lazy"
      />
    </div>
  )
}
