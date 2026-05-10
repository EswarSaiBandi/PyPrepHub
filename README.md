# PyPrepHub

A production-ready, SEO-optimised educational site for Python, Data Science, Machine Learning, NumPy, Pandas, SQL, and AI interview preparation. Built on Next.js 14 App Router, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14** with the App Router, React Server Components, static rendering, and streaming.
- **Markdown blog system** — author posts in `content/posts/*.md` with YAML frontmatter.
- **Dynamic routes** — `/blog/[slug]`, `/category/[category]`, `/tag/[tag]`, paginated archives.
- **Search** — client-side fuzzy search via Fuse.js, zero server dependency.
- **SEO** — per-page OpenGraph / Twitter metadata, JSON-LD (Article, BreadcrumbList, WebSite, Organization), auto sitemap, robots.txt, RSS feed.
- **Dark / light mode** via `next-themes` with system preference.
- **Syntax highlighting** via Shiki / rehype-pretty-code with two themes and line numbers.
- **Table of contents** with scroll-spy active-section highlighting.
- **Reading progress bar**, related articles, share buttons.
- **Comments** — Giscus (GitHub Discussions) integration.
- **Newsletter** — provider-pluggable API route (Buttondown / ConvertKit / Mailchimp).
- **AdSense-ready** — top banner, sticky sidebar, in-article, and footer ad slots.
- **Performance** — lazy images via `next/image`, font optimisation via `next/font`, route-level static generation.
- **Accessible** — WCAG-oriented colour palette, skip-link, focus styles, semantic headings.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Writing a post

Create a file at `content/posts/my-new-post.md`:

```markdown
---
title: "Pandas apply() vs. map(): A Benchmark"
description: "Which one should you actually reach for?"
date: "2026-05-10"
author: "Your Name"
category: "Pandas"
tags: ["pandas", "performance"]
cover: "https://images.unsplash.com/photo-..."
featured: true
trending: false
difficulty: "intermediate"
---

Your post content in **Markdown**.
```

Supported frontmatter keys are defined in [`src/lib/types.ts`](src/lib/types.ts).

- `featured: true` — shown in the Featured Tutorials section on the homepage.
- `trending: true` — shown in Trending This Week.
- `draft: true` — hidden from production builds.

The post is auto-discovered on the next build (or dev-server HMR). Slug comes from the filename.

## Project structure

```
.
├── content/posts/        # Markdown posts (source of truth)
├── public/               # Static assets (og images, logos, favicons)
├── src/
│   ├── app/              # App Router routes, layouts, sitemap/robots/RSS
│   ├── components/       # UI components
│   └── lib/              # Post loader, MDX pipeline, SEO, schema, search
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Scripts

| Command            | Description                        |
|--------------------|------------------------------------|
| `pnpm dev`         | Dev server at `:3000`              |
| `pnpm build`       | Production build                   |
| `pnpm start`       | Serve the built site               |
| `pnpm lint`        | ESLint                             |
| `pnpm typecheck`   | TypeScript without emit            |

## Environment variables

See [`.env.example`](.env.example) for the complete list. Minimum for local dev:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See integration guides below for AdSense, Giscus, and the newsletter provider.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). TL;DR: push to GitHub, import into Vercel, set environment variables, done.

## AdSense

See [ADSENSE.md](ADSENSE.md) for the end-to-end setup, including `ads.txt`, per-slot IDs, and Core Web Vitals guidance.

## License

MIT.
