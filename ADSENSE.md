# Google AdSense Integration Guide

PyPrepHub is AdSense-ready out of the box. This doc walks through the exact steps from "I just deployed the site" to "AdSense-approved with ads live."

## Prerequisites

- The site is live on a custom domain (not a `*.vercel.app` URL — AdSense will reject subdomain-only properties).
- There are at least ~10 quality articles published (AdSense reviews editorial depth).
- Privacy Policy, About, and Contact pages exist (they do — this scaffold includes all three).

## Step 1 — apply for AdSense

1. Visit [google.com/adsense](https://www.google.com/adsense) and apply using your domain.
2. While the application is pending (1–14 days), keep publishing and driving a small amount of organic traffic.
3. You'll receive a publisher ID of the form `ca-pub-1234567890123456`.

## Step 2 — wire the publisher ID

Add to your Vercel project (Production environment):

```
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
```

Redeploy. The site now loads the AdSense loader script `afterInteractive` and renders real `<ins class="adsbygoogle">` elements in every ad slot.

Until this variable is set, `<AdSlot>` renders a dashed placeholder saying *"Ad placeholder · set NEXT_PUBLIC_ADSENSE_CLIENT to enable"* — useful during local dev.

## Step 3 — add `ads.txt`

Google requires an `ads.txt` file at your domain root. Create `public/ads.txt`:

```
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

Replace the number with your `pub-…` ID. `f08c47fec0942fa0` is Google's public TAG-ID (correct as written, do not change).

Verify it serves at `https://your-domain.com/ads.txt` after deploy.

## Step 4 — create ad units

In AdSense → **Ads → By ad unit**, create four display ads and copy each slot ID:

| Slot name           | Type              | Where it renders                     | Config key                   |
|---------------------|-------------------|--------------------------------------|------------------------------|
| Top Banner          | Display (horizontal, responsive) | Above the fold, under the header | `adsense.slots.topBanner`   |
| Sidebar             | Display (vertical, responsive)   | Sticky sidebar on article pages  | `adsense.slots.sidebar`     |
| In-Article          | Display (fluid, in-article)      | Inside long-form posts           | `adsense.slots.inArticle`   |
| Footer              | Display (horizontal, responsive) | Above the newsletter block       | `adsense.slots.footer`      |

Paste the slot IDs into [`src/lib/site.ts`](src/lib/site.ts):

```ts
adsense: {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
  slots: {
    topBanner: '1234567890',   // your actual slot IDs
    sidebar: '2345678901',
    inArticle: '3456789012',
    footer: '4567890123',
  },
},
```

Commit and push.

## Step 5 — add new slots (if you want more)

1. In AdSense, create an ad unit, copy the slot ID.
2. Add it to `siteConfig.adsense.slots`.
3. Place the component:

```tsx
import { AdSlot } from '@/components/ads'
import { siteConfig } from '@/lib/site'

<AdSlot slot={siteConfig.adsense.slots.mySlot} format="auto" />
```

Available formats: `auto`, `fluid`, `rectangle`, `vertical`, `horizontal`.

## Step 6 — comply with ad policies

Google has strict [content policies](https://support.google.com/adsense/answer/48182). Pre-approval checklist:

- ✅ Privacy policy discloses cookies and advertising (ours does).
- ✅ No adult, copyrighted, or prohibited content.
- ✅ Original writing, not scraped.
- ✅ Easy-to-find About and Contact pages.
- ✅ No artificial traffic, click prompts, or ad-placement tricks.

## Step 7 — preserve Core Web Vitals

Ads are the #1 source of CLS (Cumulative Layout Shift) and LCP regressions. This scaffold mitigates that with:

- **Explicit `min-height`** on every `<ins>` container → the browser reserves space before the ad loads → no layout shift.
- **`afterInteractive` loading** of the AdSense loader → doesn't block hydration.
- **No ads in the critical LCP element** (hero, post cover image).

Audit after going live using [PageSpeed Insights](https://pagespeed.web.dev). Target CLS < 0.1 and LCP < 2.5s.

If the Top Banner is hurting your LCP, swap its `<Script strategy>` in `src/app/layout.tsx` to `"lazyOnload"` — this delays the AdSense loader until the page is fully idle. You lose a few impressions on bouncing visitors; you gain a green LCP.

## Step 8 — GDPR / CCPA consent

If you serve EU or California traffic, AdSense requires a consent banner. Two clean options:

1. **Google-managed consent** (simplest) — enable it in AdSense → Privacy & messaging. Google injects the CMP automatically.
2. **Self-hosted CMP** — use [Cookiebot](https://www.cookiebot.com) or similar, wire the IAB TCF v2 signal to AdSense.

Either way, verify in AdSense → Privacy & messaging that a message is active for GDPR and CCPA regions.

## Common issues

**Blank ad space.** Either the site isn't approved yet, or the slot is too narrow for the format. Try `format="auto"` with `data-full-width-responsive="true"` (already our default).

**"getting blank" in console.** You haven't been approved, or your ad-blocker is active. Check in incognito with no extensions.

**Policy violation email.** Read the specific unit flagged. Usually it's ad density (too many ads per page) or placement (ads inside non-content UI like nav). Fix and request a review.

**Low CPM.** AdSense optimises over weeks, not hours. Give it 30 days and track RPM, not individual impressions.

## Debugging

Open DevTools → Network, filter by `adsbygoogle`. You should see:

- `adsbygoogle.js?client=ca-pub-…` load once (200 OK).
- One `show_ads` request per ad unit.
- Each `<ins>` gets `data-ad-status="filled"` (or `"unfilled"` if no ad was available — normal for low-traffic pages).

Turn on AdSense's [in-page verification tool](https://support.google.com/adsense/answer/6211033) if in doubt.

## Going further

- **Auto Ads.** AdSense can auto-place ads using ML. Enable in AdSense → Ads → By site → Auto ads. This works alongside your manual placements. If you enable it, monitor CLS — auto ads sometimes inject in layout-damaging positions.
- **A/B test placements.** AdSense has Experiments (Ads → Experiments) for styling and placement tests.
- **Consider alternatives.** At high scale, [Ezoic](https://www.ezoic.com) or [Mediavine](https://www.mediavine.com) tend to pay significantly better CPMs than AdSense alone. Mediavine requires ~50k monthly sessions.
