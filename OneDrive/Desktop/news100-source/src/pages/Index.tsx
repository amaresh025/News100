import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BreakingTicker from '@/components/news/BreakingTicker';
import TopHeadline from '@/components/news/TopHeadline';
import LatestNews from '@/components/news/LatestNews';
import TrendingNews from '@/components/news/TrendingNews';
import CategorySection from '@/components/news/CategorySection';
import MostRead from '@/components/news/MostRead';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <BreakingTicker />
      <main id="main-content" className="flex-1">
        <TopHeadline />
        <LatestNews />
        <TrendingNews />
        <CategorySection title="Politics" slug="politics" />
        <CategorySection title="India" slug="india" />
        <CategorySection title="Business" slug="business" />
        <CategorySection title="Sports" slug="sports" />
        <CategorySection title="Entertainment" slug="entertainment" />
        <CategorySection title="Technology" slug="technology" />
        <MostRead />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
