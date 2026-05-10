import { Hero } from '@/components/hero'
import { LatestArticles } from '@/components/latest-articles'
import { PopularCategories } from '@/components/popular-categories'
import { DailyChallenge } from '@/components/daily-challenge'
import { FeaturedTutorials } from '@/components/featured-tutorials'
import { TrendingTopics } from '@/components/trending-topics'
import { Newsletter } from '@/components/newsletter'
import { FooterAd } from '@/components/ads'
import {
  getAllTags,
  getDailyChallenge,
  getFeaturedPosts,
  getLatestPosts,
  getTrendingPosts,
} from '@/lib/posts'

export default function HomePage() {
  const latest = getLatestPosts(6)
  const featured = getFeaturedPosts(4)
  const trending = getTrendingPosts(8)
  const challenge = getDailyChallenge()
  const tags = getAllTags()

  return (
    <>
      <Hero />
      <DailyChallenge post={challenge} />
      <FeaturedTutorials posts={featured} />
      <PopularCategories />
      <LatestArticles posts={latest} />
      <TrendingTopics posts={trending} tags={tags} />
      <div className="container"><FooterAd /></div>
      <section className="container pb-20">
        <Newsletter />
      </section>
    </>
  )
}
