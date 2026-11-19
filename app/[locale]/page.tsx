import { Suspense } from "react";
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

async function AnnouncementsFeed() {
  const announcements = await getAnnouncements();
  return <AnnouncementsSection announcements={announcements} />;
}

function AnnouncementsFallback() {
  return (
    <section
      id="announcements"
      aria-hidden="true"
      className="min-h-[clamp(26rem,40vw,38rem)] bg-background px-6 py-[clamp(1.25rem,2vw,2rem)]"
    >
      <div className="h-10 w-64 max-w-full animate-pulse rounded-lg bg-surface-muted/60 motion-reduce:animate-none" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-3xl bg-surface-muted/40 motion-reduce:animate-none" />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      
      <main className="flex min-h-screen flex-col gap-y-[clamp(0.25rem,0.5vw,0.5rem)]">
        <HeroSection />
        <AboutSection />
        <WhatWeOffer/>
        <LeadershipTeam/>
        <FeaturedProjects/>
        <Suspense fallback={<AnnouncementsFallback />}>
          <AnnouncementsFeed />
        </Suspense>
        <UpcomingEvents/>
        <SponsorSection/>
        {/* <LeadershipTeam/> */}
        <AdvisorsTeam />
        <Committees/>
        <JoinCommunity/>
        <Footer/>
      </main>
    </>
  );
}
