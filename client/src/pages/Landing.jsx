import Hero from '../components/landing/Hero';
import PillarsSection from '../components/landing/PillarsSection';
import JourneyTimeline from '../components/landing/JourneyTimeline';
import LeaderboardSection from '../components/landing/LeaderboardSection';
import GamificationSection from '../components/landing/GamificationSection';
import DashboardMockup from '../components/landing/DashboardMockup';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <>
      <Hero />
      <PillarsSection />
      <JourneyTimeline />
      <LeaderboardSection />
      <GamificationSection />
      <DashboardMockup />
      <Footer />
    </>
  );
};

export default Landing;
