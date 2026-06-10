import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string;
  is_breaking: boolean;
  is_trending: boolean;
  views: number;
  published_at: string | null;
  category_id: string | null;
  categories?: CategoryRow | null;
}

export const formatDate = (iso: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function usePosts(opts: {
  limit?: number;
  categorySlug?: string;
  breaking?: boolean;
  trending?: boolean;
  excludeIds?: string[];
} = {}) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      let q = supabase
        .from('posts')
        .select('id,title,slug,excerpt,featured_image,author_name,is_breaking,is_trending,views,published_at,category_id, categories(id,name,slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (opts.breaking) q = q.eq('is_breaking', true);
      if (opts.trending) q = q.eq('is_trending', true);
      if (opts.limit) q = q.limit(opts.limit);

      const { data } = await q;
      let rows = (data as PostRow[]) ?? [];

      if (opts.categorySlug) {
        rows = rows.filter(r => r.categories?.slug === opts.categorySlug);
      }
      if (opts.excludeIds?.length) {
        rows = rows.filter(r => !opts.excludeIds!.includes(r.id));
      }
      if (alive) {
        setPosts(rows);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.limit, opts.categorySlug, opts.breaking, opts.trending, (opts.excludeIds ?? []).join(',')]);

  return { posts, loading };
}

export function useCategoryPosts(slug: string, limit = 4) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
      if (!cat) { setPosts([]); return; }
      const { data } = await supabase
        .from('posts')
        .select('id,title,slug,excerpt,featured_image,author_name,is_breaking,is_trending,views,published_at,category_id, categories(id,name,slug)')
        .eq('status', 'published')
        .eq('category_id', cat.id)
        .order('published_at', { ascending: false })
        .limit(limit);
      setPosts((data as PostRow[]) ?? []);
    })();
  }, [slug, limit]);
  return posts;
}
