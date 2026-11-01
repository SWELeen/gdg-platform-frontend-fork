import { apiRequest } from "@/lib/api/client";
import type { Announcement, AnnouncementCategory } from "./types";

export type CreateAnnouncementInput = {
  title: string;
  excerpt: string;
  category: AnnouncementCategory;
  status?: "DRAFT" | "PUBLISHED";
  body?: string;
  imageUrl?: string | null;
  actionLabel?: string | null;
  actionHref?: string | null;
  pinned: boolean;
};

export function fetchManagedAnnouncements() {
  return apiRequest<Announcement[]>("/announcements/manage");
}

export function publishAnnouncement(input: CreateAnnouncementInput) {
  return apiRequest<Announcement>("/announcements", {
    method: "POST",
    body: input,
  });
}

export function updateAnnouncement(id: string, input: Partial<CreateAnnouncementInput>) {
  return apiRequest<Announcement>(`/announcements/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteAnnouncement(id: string) {
  return apiRequest<{ id: string }>(`/announcements/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function uploadAnnouncementImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<{ imageUrl: string }>("/announcements/images", {
    method: "POST",
    body: form,
  });
}
