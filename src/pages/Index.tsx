import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TeamSection from '@/components/TeamSection';
import MatchesSection from '@/components/MatchesSection';
import AchievementsSection from '@/components/AchievementsSection';
import SponsorsSection from '@/components/SponsorsSection';
import Footer from '@/components/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TeamSection />
      <MatchesSection />
      <AchievementsSection />
      <SponsorsSection />
      <Footer />
    </div>
  );
}
