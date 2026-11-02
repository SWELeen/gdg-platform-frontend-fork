import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AnnouncementArticle } from "@/components/announcements/AnnouncementArticle";
import { AnnouncementDetailsHeader } from "@/components/announcements/AnnouncementDetailsHeader";
import { AnnouncementInfoCard } from "@/components/announcements/AnnouncementInfoCard";
import { AnnouncementMedia } from "@/components/announcements/AnnouncementMedia";
import { MoreAnnouncements } from "@/components/announcements/MoreAnnouncements";
import { announcementsContainer } from "@/components/announcements/styles";
import {
  getAnnouncementBySlug,
  getAnnouncements,
  getRelatedAnnouncements,
} from "@/lib/announcements/provider";

type Props = PageProps<"/[locale]/announcements/[slug]">;

export const dynamicParams = true;

export async function generateStaticParams() {
  const announcements = await getAnnouncements();
  return announcements.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);

  return announcement
    ? { title: `${announcement.title} | GDG on Campus UJ`, description: announcement.excerpt }
    : {};
}

export default async function AnnouncementDetailsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const announcement = await getAnnouncementBySlug(slug);
  if (!announcement) notFound();

  const related = await getRelatedAnnouncements(announcement);

  return (
    <div className={`${announcementsContainer} flex flex-col gap-8 pt-8`}>
      <AnnouncementDetailsHeader announcement={announcement} />

      <AnnouncementMedia
        media={announcement.media}
        priority
        sizes="(min-width: 1200px) 1200px, 100vw"
        className="aspect-[16/9] w-full rounded-card sm:aspect-[21/9]"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <AnnouncementArticle announcement={announcement} />
        <AnnouncementInfoCard announcement={announcement} />
      </div>

      <div className="mt-10">
        <MoreAnnouncements announcements={related} />
      </div>
    </div>
  );
}
