import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-extrabold text-brand-600 md:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold md:text-3xl">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        The page you're looking for doesn't exist — it may have been moved or deleted.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary"><Home className="h-4 w-4" /> Home</Link>
        <Link href="/search" className="btn-outline"><Search className="h-4 w-4" /> Search articles</Link>
      </div>
    </div>
  )
}
