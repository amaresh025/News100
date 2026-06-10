import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Eye, User as UserIcon, Calendar } from 'lucide-react';
import ShareButtons from '@/components/article/ShareButtons';
import LikeButton from '@/components/article/LikeButton';
import CommentsSection from '@/components/article/CommentsSection';
import NewsCard from '@/components/news/NewsCard';
import type { PostRow } from '@/hooks/usePosts';

interface Article extends PostRow {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
}

const readingTime = (txt: string) => Math.max(1, Math.round(txt.replace(/<[^>]+>/g, '').split(/\s+/).length / 220));

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Article | null>(null);
  const [related, setRelated] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase.from('posts')
        .select('*, categories(id,name,slug)')
        .eq('slug', slug).eq('status', 'published').maybeSingle();
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPost(data as Article);
      setLoading(false);
      // bump views (best effort)
      supabase.from('posts').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id).then(() => {});
      // related
      if (data.category_id) {
        const { data: rel } = await supabase.from('posts')
          .select('id,title,slug,excerpt,featured_image,author_name,is_breaking,is_trending,views,published_at,category_id, categories(id,name,slug)')
          .eq('status', 'published').eq('category_id', data.category_id).neq('id', data.id).limit(3);
        setRelated((rel as PostRow[]) ?? []);
      }
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading article…</div>;
  if (notFound || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Article not found</h1>
      <Link to="/" className="text-primary">← Back to home</Link>
    </div>
  );

  const url = `${window.location.origin}/blog/${post.slug}`;
  const title = post.meta_title || post.title;
  const desc = post.meta_description || post.excerpt || '';
  const img = post.featured_image || '';
  const published = post.published_at ?? new Date().toISOString();

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: post.title, image: img ? [img] : undefined, datePublished: published, dateModified: published,
    author: { '@type': 'Person', name: post.author_name },
    publisher: { '@type': 'Organization', name: 'News100', logo: { '@type': 'ImageObject', url: `${window.location.origin}/favicon.ico` } },
    description: desc, mainEntityOfPage: url,
  };
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
      ...(post.categories ? [{ '@type': 'ListItem', position: 2, name: post.categories.name, item: `${window.location.origin}/category/${post.categories.slug}` }] : []),
      { '@type': 'ListItem', position: post.categories ? 3 : 2, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} | News100</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        {img && <meta property="og:image" content={img} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        {img && <meta name="twitter:image" content={img} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(crumbs)}</script>
      </Helmet>

      <Header />
      <main id="main-content" className="container-blog py-8 max-w-4xl">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          {post.categories && <> · <Link to={`/category/${post.categories.slug}`} className="hover:text-primary">{post.categories.name}</Link></>}
        </nav>

        <div className="space-y-4 mb-6">
          {post.categories && <span className="badge-category">{post.categories.name}</span>}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-3">
            <span className="flex items-center gap-1"><UserIcon className="h-4 w-4" /> {post.author_name}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(published).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {readingTime(post.content)} min read</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {img && <img src={img} alt={post.title} className="w-full rounded-lg mb-8 aspect-video object-cover" />}

        <div className="prose prose-lg max-w-none dark:prose-invert mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-border">
          <LikeButton postId={post.id} />
          <ShareButtons url={url} title={post.title} />
        </div>

        <CommentsSection postId={post.id} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title">Related Stories</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              {related.map(r => <NewsCard key={r.id} post={r} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
