import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import WhatWeOffer from "@/components/home/WhatWeOffer"
import FeaturedProjects from "@/components/home/FeaturedProjects";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import SponsorSection from "@/components/home/SponsorsSection";
import JoinCommunity from "@/components/home/JoinCommunity";
import LeadershipTeam, { AdvisorsTeam } from "@/components/home/LeadershipTeam"
import Committees from "@/components/home/Committees"
import Footer from "@/components/Footer"
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import { getAnnouncements } from "@/lib/announcements/provider";

export default async function Home() {
  const announcements = await getAnnouncements();

  return (
    <>
      
      <main>
        <HeroSection />
        <AboutSection />
        <WhatWeOffer/>
        <LeadershipTeam/>
        <FeaturedProjects/>
        <AnnouncementsSection announcements={announcements} />
        <UpcomingEvents/>
        <SponsorSection/>
        {/* <LeadershipTeam/> */}
        <Committees/>
        <AdvisorsTeam />
        <JoinCommunity/>
        <Footer/>
      </main>
    </>
  );
}
