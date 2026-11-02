import type { Announcement } from "./types";

const API_ENABLED = process.env.NEXT_PUBLIC_USE_API === "true";
const API_ORIGIN = (
  process.env.API_PROXY_TARGET?.trim() ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

function normalizeAnnouncementSlug(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the original value if it is not a valid percent-encoded string.
  }
  return decoded.normalize("NFKC");
}

async function request<T>(path: string): Promise<T | undefined> {
  if (!API_ENABLED) return undefined;
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, { cache: "no-store" });
    if (!response.ok) return undefined;
    const envelope = await response.json() as { success?: boolean; data?: T };
    return envelope.success ? envelope.data : undefined;
  } catch {
    return undefined;
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return (await request<Announcement[]>("/announcements")) ?? [];
}

export async function getAnnouncementBySlug(
  slug: string,
): Promise<Announcement | undefined> {
  const normalizedSlug = normalizeAnnouncementSlug(slug);
  const announcement = await request<Announcement>(`/announcements/${encodeURIComponent(normalizedSlug)}`);
  if (announcement) return announcement;

  // Fall back to the public collection if the detail endpoint is temporarily
  // unavailable or the deployed API does not resolve this slug consistently.
  const announcements = await getAnnouncements();
  return announcements.find((item) => normalizeAnnouncementSlug(item.slug) === normalizedSlug);
}

// "More announcements" on the details page: the newest others. Deliberately simple.
export async function getRelatedAnnouncements(
  current: Announcement,
  limit = 3,
): Promise<Announcement[]> {
  const announcements = await getAnnouncements();
  return announcements.filter((item) => item.id !== current.id).slice(0, limit);
}
