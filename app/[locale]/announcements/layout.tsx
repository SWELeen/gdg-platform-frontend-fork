import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/Footer";
import { AnnouncementsCTA } from "@/components/announcements/AnnouncementsCTA";

// Shared shell for the listing and details pages, so loading and error states
// render inside the same navbar + CTA + footer frame.
export default async function AnnouncementsLayout({
  children,
  params,
}: LayoutProps<"/[locale]/announcements">) {
  const { locale } = await params;
  // The CTA translates on the server; without this next-intl reads the locale
  // from request headers, which would make these routes dynamic.
  setRequestLocale(locale);

  return (
    <>
      <Navbar variant="light" />
      <main className="flex w-full flex-1 flex-col pt-[var(--home-nav-height)]">
        {children}
        <AnnouncementsCTA />
      </main>
      <Footer />
    </>
  );
}
