'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        const doc = document.documentElement
        const height = doc.scrollHeight - doc.clientHeight
        const p = height > 0 ? (doc.scrollTop / height) * 100 : 0
        setProgress(Math.min(100, Math.max(0, p)))
        raf = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-brand-500 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
