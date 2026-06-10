import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PostRow } from '@/hooks/usePosts';

const MostRead = () => {
  const [posts, setPosts] = useState<PostRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('id,title,slug,excerpt,featured_image,author_name,is_breaking,is_trending,views,published_at,category_id, categories(id,name,slug)')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5);
      setPosts((data as PostRow[]) ?? []);
    })();
  }, []);
  if (!posts.length) return null;
  return (
    <section className="container-blog py-10" aria-labelledby="most-read-heading">
      <h2 id="most-read-heading" className="section-title">Most Read</h2>
      <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
        {posts.map((p, i) => (
          <li key={p.id} className="relative bg-card border border-border rounded-lg p-4 pl-12 hover:border-primary/40 transition-colors">
            <span className="absolute left-3 top-3 text-4xl font-extrabold text-primary/80 leading-none">
              {i + 1}
            </span>
            <Link to={`/blog/${p.slug}`} className="block">
              {p.categories && <span className="blog-meta">{p.categories.name}</span>}
              <h3 className="text-sm font-bold leading-snug mt-1 line-clamp-3 hover:text-primary">{p.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Eye className="h-3 w-3" /> {p.views.toLocaleString('en-IN')} views
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default MostRead;
