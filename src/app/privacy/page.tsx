import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy policy',
  description: `How ${siteConfig.name} collects and uses data.`,
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Privacy', href: '/privacy' }]} />
      <article className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <h1>Privacy policy</h1>
        <p><em>Last updated: {new Date().toISOString().slice(0, 10)}</em></p>

        <h2>What we collect</h2>
        <p>
          We collect minimal information needed to operate {siteConfig.name}:
        </p>
        <ul>
          <li><strong>Analytics:</strong> if Google Analytics is enabled, anonymised usage metrics (page, referrer, device) with IP anonymisation active.</li>
          <li><strong>Newsletter:</strong> your email address, stored with our email provider, used only to deliver the newsletter you opted into.</li>
          <li><strong>Comments:</strong> comments are powered by GitHub Discussions via Giscus. Comment content, GitHub username, and reaction data live in GitHub and are governed by GitHub's privacy policy.</li>
        </ul>

        <h2>Advertising</h2>
        <p>
          We use Google AdSense. Google and its partners may use cookies to personalise ads based on prior
          visits to this site and other sites on the internet. You can opt out of personalised advertising by
          visiting <a href="https://www.google.com/settings/ads" rel="noopener">Google Ads Settings</a>.
        </p>

        <h2>Cookies</h2>
        <p>
          Essential cookies enable site functionality (e.g. theme preference). Analytics and advertising
          cookies are set only after page load. You can clear cookies through your browser at any time.
        </p>

        <h2>Your rights</h2>
        <p>
          You can request access, correction, or deletion of your personal data by emailing
          {' '}<a href="mailto:privacy@pyprephub.com">privacy@pyprephub.com</a>. We'll respond within 30 days.
        </p>

        <h2>Contact</h2>
        <p>Questions? Reach us at <a href="mailto:privacy@pyprephub.com">privacy@pyprephub.com</a>.</p>
      </article>
    </div>
  )
}
