import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { usePosts, formatDate } from '@/hooks/usePosts';

const TopHeadline = () => {
  const { posts } = usePosts({ limit: 5 });
  if (!posts.length) return null;

  const [hero, ...side] = posts;

  return (
    <section className="container-blog py-8" aria-labelledby="top-headline-heading">
      <h2 id="top-headline-heading" className="sr-only">Top Headlines</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hero */}
        <article className="lg:col-span-2 relative rounded-lg overflow-hidden group bg-card border border-border">
          <Link to={`/blog/${hero.slug}`} className="block">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={hero.featured_image ?? ''}
                alt={hero.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white space-y-3">
              <div className="flex items-center gap-2">
                {hero.is_breaking && <span className="badge-breaking">Breaking</span>}
                {hero.categories && <span className="badge-category">{hero.categories.name}</span>}
              </div>
              <h3 className="text-2xl md:text-4xl font-extrabold leading-tight">{hero.title}</h3>
              {hero.excerpt && (
                <p className="text-sm md:text-base opacity-90 line-clamp-2 max-w-3xl">{hero.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-xs opacity-80">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(hero.published_at)}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {hero.views.toLocaleString('en-IN')}</span>
                <span>By {hero.author_name}</span>
              </div>
            </div>
          </Link>
        </article>

        {/* Side */}
        <div className="flex flex-col gap-4">
          {side.map((p) => (
            <article key={p.id} className="flex gap-3 bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors">
              <Link to={`/blog/${p.slug}`} className="flex gap-3 w-full">
                <div className="w-32 shrink-0 aspect-[4/3] overflow-hidden">
                  <img src={p.featured_image ?? ''} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="py-2 pr-3 space-y-1 flex-1">
                  {p.categories && <span className="blog-meta">{p.categories.name}</span>}
                  <h3 className="text-sm font-bold leading-snug line-clamp-3">{p.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{formatDate(p.published_at)}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopHeadline;
