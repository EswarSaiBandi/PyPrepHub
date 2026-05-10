import Link from 'next/link'
import { Github, Linkedin, Rss, Twitter, Youtube } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { categories } from '@/lib/categories'
import { Newsletter } from './newsletter'

const socialIcons = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
} as const

const linkClass =
  'text-ink-700 hover:text-brand-600 dark:text-ink-200 dark:hover:text-brand-400'

export function Footer() {
  const half = Math.ceil(categories.length / 2)
  const catsLeft = categories.slice(0, half)
  const catsRight = categories.slice(half)

  return (
    <footer className="mt-20 border-t border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900/50">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="text-lg font-bold">
            {siteConfig.name}
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted">{siteConfig.description}</p>
          <div className="mt-4 flex gap-2">
            {Object.entries(siteConfig.social).map(([key, url]) => {
              const Icon = socialIcons[key as keyof typeof socialIcons]
              if (!Icon) return null
              return (
                <a
                  key={key}
                  href={url}
                  rel="noopener noreferrer me"
                  target="_blank"
                  aria-label={key}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-700 transition hover:bg-white dark:border-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
            <a
              href="/feed.xml"
              aria-label="RSS feed"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-700 transition hover:bg-white dark:border-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              <Rss className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Weekly digest
            </h3>
            <p className="mt-2 text-sm text-muted">
              One email a week. Interview problems and fresh explainers.
            </p>
            <div className="mt-3">
              <Newsletter variant="compact" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Categories
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <ul className="space-y-2">
              {catsLeft.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className={linkClass}>{c.name}</Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {catsRight.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className={linkClass}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/blog" className={linkClass}>All articles</Link></li>
            <li><Link href="/topics" className={linkClass}>Topics &amp; tags</Link></li>
            <li><Link href="/search" className={linkClass}>Search</Link></li>
            <li><a href="/feed.xml" className={linkClass}>RSS feed</a></li>
            <li><a href="/sitemap.xml" className={linkClass}>Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/about" className={linkClass}>About</Link></li>
            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
            <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-200 py-6 dark:border-ink-800">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>
            Built with <Link href="https://nextjs.org" className="link">Next.js</Link> and
            {' '}<Link href="https://tailwindcss.com" className="link">Tailwind CSS</Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
