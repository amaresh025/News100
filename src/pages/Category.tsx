import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsCard from '@/components/news/NewsCard';
import { useCategoryPosts } from '@/hooks/usePosts';

const labels: Record<string, string> = {
  politics: 'Politics', india: 'India', business: 'Business', sports: 'Sports',
  entertainment: 'Entertainment', technology: 'Technology', health: 'Health',
  crime: 'Crime', 'current-affairs': 'Current Affairs', 'positive-stories': 'Positive Stories',
};

const Category = () => {
  const { slug = '' } = useParams();
  const posts = useCategoryPosts(slug, 50);
  const label = labels[slug] ?? slug;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container-blog py-10">
          <h1 className="section-title">{label}</h1>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No stories published yet in this section.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => <NewsCard key={p.id} post={p} size="lg" />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category;
