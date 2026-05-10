import type { Metadata } from 'next'
import { Newsletter } from '@/components/newsletter'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: `Who's behind ${siteConfig.name} and why we publish.`,
  path: '/about',
})

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
      <article className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <h1>About {siteConfig.name}</h1>
        <p>
          {siteConfig.name} is a focused publication for engineers and data professionals preparing for
          interviews at top tech companies. We write careful, technical explainers on Python, Pandas,
          NumPy, SQL, classical machine learning, and modern AI systems.
        </p>
        <h2>Our editorial principles</h2>
        <ul>
          <li><strong>Worked examples over slogans.</strong> Every concept is demonstrated with runnable code.</li>
          <li><strong>Depth where it matters.</strong> We prefer one thorough article to ten shallow ones.</li>
          <li><strong>Interview-honest.</strong> We only teach patterns that hold up under follow-up questions.</li>
          <li><strong>Free, ad-supported.</strong> We never put learning behind a paywall.</li>
        </ul>
        <h2>Who writes here</h2>
        <p>
          Our contributors are practising engineers — senior ICs and staff+ folks who have sat on both
          sides of the interview table at FAANG, quant firms, and high-growth startups. If you'd like to
          contribute, email{' '}
          <a href="mailto:editor@pyprephub.com">editor@pyprephub.com</a>.
        </p>
        <h2>How we fund the site</h2>
        <p>
          Articles are free to read. We display minimal, non-intrusive ads via Google AdSense and run a
          free weekly newsletter. We do not sell your email and never run sponsored posts without a
          clear disclosure at the top of the article.
        </p>
      </article>
      <div className="mt-16">
        <Newsletter />
      </div>
    </div>
  )
}
