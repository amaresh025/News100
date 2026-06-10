import { TrendingUp } from 'lucide-react';
import NewsCard from './NewsCard';
import { usePosts } from '@/hooks/usePosts';

const TrendingNews = () => {
  const { posts } = usePosts({ trending: true, limit: 4 });
  if (!posts.length) return null;
  return (
    <section className="container-blog py-10 bg-accent/40 rounded-xl my-6" aria-labelledby="trending-heading">
      <div className="px-2 mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 id="trending-heading" className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
          Trending Now
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 px-2">
        {posts.map((p) => <NewsCard key={p.id} post={p} />)}
      </div>
    </section>
  );
};

export default TrendingNews;
