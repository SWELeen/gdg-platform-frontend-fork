import type { CommitteeEvent } from "@/components/dashboard/shared/types";
import type { RegistrationQuestion } from "@/components/dashboard/shared/types";

export const PUBLISHED_HOME_EVENTS_KEY = "gdg-published-home-events";

export function subscribeToPublishedHomeEvents(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PUBLISHED_HOME_EVENTS_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function getPublishedHomeEventsSnapshot() {
  try {
    return window.localStorage.getItem(PUBLISHED_HOME_EVENTS_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export interface PublishedHomeEvent {
  id: string;
  image: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  registrationQuestions?: RegistrationQuestion[];
  requiredRegistrantFields?: string[];
}

export function toPublishedHomeEvent(event: CommitteeEvent): PublishedHomeEvent {
  return {
    id: event.id,
    image: event.imageUrl || "/images/event-placeholder.png",
    name: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    description: event.description,
    registrationQuestions: event.registrationQuestions,
    requiredRegistrantFields: event.requiredRegistrantFields,
  };
}

export function readPublishedHomeEvents(): PublishedHomeEvent[] {
  try {
    const stored = window.localStorage.getItem(PUBLISHED_HOME_EVENTS_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PublishedHomeEvent =>
      typeof item?.id === "string" && typeof item?.name === "string" &&
      typeof item?.date === "string" && typeof item?.time === "string" &&
      typeof item?.location === "string" && typeof item?.image === "string"
    );
  } catch {
    return [];
  }
}
