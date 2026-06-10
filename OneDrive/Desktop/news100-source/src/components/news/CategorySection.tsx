import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import NewsCard from './NewsCard';
import { useCategoryPosts } from '@/hooks/usePosts';

interface CategorySectionProps {
  title: string;
  slug: string;
  accent?: 'orange' | 'red';
}

const CategorySection = ({ title, slug }: CategorySectionProps) => {
  const posts = useCategoryPosts(slug, 4);
  if (!posts.length) return null;

  const [lead, ...rest] = posts;

  return (
    <section className="container-blog py-10" aria-labelledby={`${slug}-heading`}>
      <div className="flex items-end justify-between mb-6 border-b-2 border-border">
        <h2 id={`${slug}-heading`} className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight pb-3 border-b-4 border-primary -mb-[2px]">
          {title}
        </h2>
        <Link to={`/category/${slug}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 pb-3">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2 lg:row-span-1">
          <NewsCard post={lead} size="lg" />
        </div>
        {rest.map((p) => (
          <NewsCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
