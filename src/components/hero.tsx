import Link from 'next/link'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="container relative py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/category/interviews"
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 px-3 py-1 text-xs font-semibold text-ink-700 backdrop-blur transition hover:border-brand-500 hover:text-brand-700 dark:border-ink-800 dark:bg-ink-900/80 dark:text-ink-200 dark:hover:text-brand-400"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            New: 2026 ML interview question bank
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Ace your next{' '}
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 bg-clip-text text-transparent">
              data interview
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg">
            Hand-crafted tutorials and interview problems across Python, Pandas, NumPy,
            SQL, Machine Learning, and modern AI — written by engineers who hire.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/blog" className="btn-primary">
              Browse articles <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/category/interviews" className="btn-outline">
              <Zap className="h-4 w-4" /> Start interview prep
            </Link>
          </div>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6 text-center">
            {[
              { label: 'Interview problems', value: '500+' },
              { label: 'Deep dives', value: '120+' },
              { label: 'Weekly readers', value: '18k' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold md:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
