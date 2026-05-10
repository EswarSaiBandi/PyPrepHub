# Deploying PyPrepHub to Vercel

This project is a standard Next.js 14 App Router site. The recommended host is Vercel, which runs Next.js natively. Any Node 18+ host (Netlify, Cloudflare Pages with the Next adapter, Fly, Render) will also work.

## Prerequisites

- A GitHub / GitLab / Bitbucket repository with this codebase pushed.
- A [Vercel](https://vercel.com) account (free tier is sufficient).
- A domain you control (optional — Vercel gives you a `*.vercel.app` URL out of the box).

## Step 1 — push to Git

```bash
git init
git add .
git commit -m "chore: initial PyPrepHub scaffold"
git branch -M main
git remote add origin git@github.com:you/pyprephub.git
git push -u origin main
```

## Step 2 — import into Vercel

1. Visit [vercel.com/new](https://vercel.com/new) and pick your repo.
2. **Framework preset:** Next.js (auto-detected).
3. **Build command:** `pnpm build` (auto-detected).
4. **Install command:** `pnpm install --frozen-lockfile`.
5. **Output directory:** leave blank — Next.js handles it.

Click **Deploy**.

The first build takes ~2–3 minutes. Subsequent builds are incremental (~30 seconds).

## Step 3 — environment variables

In the Vercel project → **Settings → Environment Variables**, add the variables from `.env.example`. At minimum:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=PyPrepHub
```

Production-only variables (add at least to the Production environment):

- `NEXT_PUBLIC_ADSENSE_CLIENT` — `ca-pub-XXXXXXXXXXXXXXXX`
- `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- `NEXT_PUBLIC_GA_ID` — `G-XXXXXXXXXX`
- `NEXT_PUBLIC_GSC_VERIFICATION` — the meta content from Search Console
- `NEWSLETTER_PROVIDER`, `NEWSLETTER_API_KEY`, `NEWSLETTER_LIST_ID`

After you set variables, redeploy (`Deployments → ... → Redeploy`) so the build picks them up.

## Step 4 — custom domain

1. Vercel project → **Settings → Domains → Add**.
2. Enter your domain, add the `A` / `CNAME` record shown to your DNS provider.
3. Vercel auto-issues an SSL certificate (Let's Encrypt).

Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy — `sitemap.xml`, canonical URLs, and OpenGraph tags all depend on it.

## Step 5 — submit to search engines

After the domain is live:

1. **Google Search Console.** Add a property for your domain, verify using the `NEXT_PUBLIC_GSC_VERIFICATION` env var (meta tag method) or DNS. Submit `https://your-domain.com/sitemap.xml`.
2. **Bing Webmaster Tools.** Import the GSC property or verify manually. Submit the sitemap.
3. **IndexNow** (optional). Push new URLs to Bing & Yandex immediately — see `next-sitemap`'s IndexNow integration if you add it.

## Performance checklist

Run [PageSpeed Insights](https://pagespeed.web.dev) on the deployed site. The default configuration targets:

- LCP < 2.5s
- CLS < 0.1
- TBT < 200ms

If AdSense is pushing metrics down:

- Confirm ad slots have explicit `min-height` (done in `src/components/ads.tsx`) — this prevents layout shift.
- Consider lazy-loading the AdSense script via `strategy="lazyOnload"` instead of `afterInteractive` if you run heavy ads.

## Analytics (optional)

Set `NEXT_PUBLIC_GA_ID` to enable Google Analytics 4. The script is loaded with `next/script` at `afterInteractive` and passes `anonymize_ip: true` by default.

For a privacy-friendlier alternative, swap GA for [Plausible](https://plausible.io) or [Umami](https://umami.is) — add one extra `<Script>` to `src/app/layout.tsx`.

## Rollback

Every deployment is immutable. To roll back:

```
Vercel → Deployments → pick a previous successful deploy → Promote to Production
```

No rebuild is needed.

## Content updates

New articles are picked up automatically on the next build. Push your markdown to main:

```bash
git add content/posts/new-article.md
git commit -m "content: new article on X"
git push
```

Vercel builds and deploys in ~30 seconds. The sitemap and RSS feed are regenerated on every build.

## Troubleshooting

| Symptom                                  | Fix                                                                 |
|------------------------------------------|---------------------------------------------------------------------|
| Sitemap missing posts                    | Check frontmatter — `title`, `date`, `category` are required.       |
| Comments widget empty                    | All four `NEXT_PUBLIC_GISCUS_*` env vars must be set.               |
| AdSense `<ins>` stays blank              | Site must be approved by AdSense. Can take 1–14 days for new sites. |
| Build fails on `gray-matter` frontmatter | Invalid YAML. Check for unescaped colons and quotes.                |
| Images 403 from unsplash.com             | Hostname must be in `next.config.mjs > images.remotePatterns`.      |

## What NOT to commit

- `.env.local` — secrets live there; it's gitignored.
- `.next/`, `node_modules/` — gitignored.
- `NEXT_PUBLIC_*` names are *public*. Any value you put here is shipped to the browser. Do not use them for secrets.
