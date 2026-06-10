import NewsCard from './NewsCard';
import { usePosts } from '@/hooks/usePosts';

const LatestNews = () => {
  const { posts } = usePosts({ limit: 8 });
  // Skip first 5 (used in TopHeadline) to avoid duplication
  const list = posts.slice(5);
  if (!list.length) return null;
  return (
    <section className="container-blog py-10" aria-labelledby="latest-heading">
      <h2 id="latest-heading" className="section-title">Latest News</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => <NewsCard key={p.id} post={p} size="lg" />)}
      </div>
    </section>
  );
};

export default LatestNews;
