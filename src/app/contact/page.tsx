import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Get in touch with the PyPrepHub editorial team.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <article className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <h1>Contact</h1>
        <p>We read every message. Please pick the channel that fits:</p>
        <ul>
          <li><strong>Editorial & corrections:</strong> <a href="mailto:editor@pyprephub.com">editor@pyprephub.com</a></li>
          <li><strong>Partnerships & advertising:</strong> <a href="mailto:ads@pyprephub.com">ads@pyprephub.com</a></li>
          <li><strong>Guest posts:</strong> <a href="mailto:write@pyprephub.com">write@pyprephub.com</a></li>
          <li><strong>Privacy requests:</strong> <a href="mailto:privacy@pyprephub.com">privacy@pyprephub.com</a></li>
        </ul>
        <p>We typically respond within 2 business days.</p>
      </article>
    </div>
  )
}
