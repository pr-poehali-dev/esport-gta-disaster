import Header from '@/components/Header';
import NewsFeed from '@/components/NewsFeed';
import Footer from '@/components/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsFeed />
      <Footer />
    </div>
  );
}
