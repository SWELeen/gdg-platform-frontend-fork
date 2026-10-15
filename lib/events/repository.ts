import { initialCommitteeEvents } from "@/components/dashboard/data-analysis/mock-data";
import type { CommitteeEvent, LeaderCommittee } from "@/components/dashboard/shared/types";
import { prDashboardSeed } from "@/data/pr-dashboard";
import type { PlatformEvent } from "./types";

// Single data entry point for platform events shown to members.
//
// TEMPORARY: no events API contract is published yet, so this reads the committee
// dashboards' seeded events and keeps only published ones (drafts are leader-only).
// Events a leader creates in the dashboard live in that browser session's state and
// are not visible here. Replace these bodies with the documented endpoint when it exists.

const toPlatformEvent = (event: CommitteeEvent, committee: LeaderCommittee): PlatformEvent => ({
  id: event.id,
  title: event.title,
  type: event.type,
  date: event.date,
  time: event.time,
  location: event.location,
  capacity: event.capacity,
  registered: event.registered,
  description: event.description,
  speakers: event.speakers,
  mapsLink: event.mapsLink,
  registrationDeadline: event.registrationDeadline,
  requirements: event.requirements,
  imageUrl: event.imageUrl,
  committee,
});

const isPublished = (event: CommitteeEvent) => !event.isDraft && event.status !== "Draft";

export async function getPublishedEvents(): Promise<PlatformEvent[]> {
  return [
    ...initialCommitteeEvents.filter(isPublished).map((event) => toPlatformEvent(event, "data-analysis")),
    ...(prDashboardSeed.events ?? []).filter(isPublished).map((event) => toPlatformEvent(event, "pr")),
  ];
}

export async function getPublishedEventById(id: string): Promise<PlatformEvent | undefined> {
  return (await getPublishedEvents()).find((event) => event.id === id);
}
