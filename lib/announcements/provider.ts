import type { Announcement } from "./types";

// The backend does not expose an Announcements API yet; do not substitute demo data.
export async function getAnnouncements(): Promise<Announcement[]> {
  return [];
}

export async function getAnnouncementBySlug(
  slug: string,
): Promise<Announcement | undefined> {
  void slug;
  return undefined;
}

// "More announcements" on the details page: the newest others. Deliberately simple.
export async function getRelatedAnnouncements(
  current: Announcement,
  limit = 3,
): Promise<Announcement[]> {
  void current;
  void limit;
  return [];
}
