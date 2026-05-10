export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'PyPrepHub',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'Python, Data Science, Machine Learning, NumPy, Pandas, SQL & AI interview preparation.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pyprephub.com',
  ogImage: '/og-default.png',
  author: {
    name: 'PyPrepHub Editorial',
    twitter: '@pyprephub',
    url: 'https://pyprephub.com/about',
  },
  locale: 'en_US',
  postsPerPage: 9,
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Articles', href: '/blog' },
    { label: 'Topics', href: '/topics' },
    { label: 'Interviews', href: '/category/interviews' },
    { label: 'About', href: '/about' },
  ],
  social: {
    twitter: 'https://twitter.com/pyprephub',
    github: 'https://github.com/pyprephub',
    linkedin: 'https://linkedin.com/company/pyprephub',
    youtube: 'https://youtube.com/@pyprephub',
  },
  adsense: {
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
    slots: {
      topBanner: '1234567890',
      sidebar: '2345678901',
      inArticle: '3456789012',
      footer: '4567890123',
    },
  },
} as const

export type SiteConfig = typeof siteConfig
