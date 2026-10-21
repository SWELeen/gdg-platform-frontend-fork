import type { RegistrationQuestion } from "@/components/dashboard/shared/types";
import { apiRequest } from "@/lib/api/client";
import type { PlatformEvent } from "./types";

// Shapes returned by the backend's public event endpoints.
export type ApiQuestion = {
  questionId: number;
  questionText: string;
  questionType: "TEXT" | "SELECT" | "RADIO" | "CHECKBOX";
  isRequired: boolean;
  options: string[] | null;
};

export type ApiEvent = {
  eventId: number;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
  imageUrl: string | null;
  requirements: string | null;
  capacity: number;
  seatsTaken: number;
  registrationDeadline: string;
  registrationOpen: boolean;
};

export type ApiEventDetails = ApiEvent & {
  questions: ApiQuestion[];
  myRegistration: { registrationId: number; status: string } | null;
};

// Display formats the existing components expect, in the club's time zone.
const zone = { timeZone: "Asia/Riyadh" } as const;
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { ...zone, month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { ...zone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

// The registration form renders "long-answer" as a textarea, "checkboxes" as
// tick boxes, and any other question with options as a select.
export function toRegistrationQuestion(question: ApiQuestion): RegistrationQuestion {
  return {
    id: String(question.questionId),
    type: question.questionType === "CHECKBOX" ? "checkboxes" : question.questionType === "TEXT" ? "long-answer" : "select",
    text: question.questionText,
    options: question.options ?? undefined,
    required: question.isRequired,
  };
}

export function toPlatformEvent(event: ApiEvent): PlatformEvent {
  return {
    id: String(event.eventId),
    title: event.name,
    // The backend has no event type yet; every event shows as a workshop.
    type: "Workshop",
    date: formatDate(event.startsAt),
    time: formatTime(event.startsAt),
    location: event.location ?? "",
    capacity: event.capacity,
    // Components show seats left as capacity - registered; seats are held
    // only by accepted people, so that is what "registered" carries here.
    registered: event.seatsTaken,
    description: event.description ?? undefined,
    registrationDeadline: formatDate(event.registrationDeadline),
    requirements: event.requirements ?? undefined,
    imageUrl: event.imageUrl ?? undefined,
    committee: "pr",
  };
}

export async function fetchPublishedEvents(): Promise<ApiEvent[]> {
  const result = await apiRequest<ApiEvent[]>("/events");
  return result.ok ? result.data : [];
}

export async function fetchEventDetails(id: string): Promise<ApiEventDetails | undefined> {
  if (!/^\d+$/.test(id)) return undefined;
  const result = await apiRequest<ApiEventDetails>(`/events/${id}`);
  return result.ok ? result.data : undefined;
}

// Joins a checkbox question's ticked options in the form's string state;
// a control character never appears inside an option's text.
export const CHOICE_SEPARATOR = "\u001f";

export type RegisterResult = { ok: true } | { ok: false; code: string };

// Checkbox answers travel as a list of the chosen options.
export async function registerForEvent(
  eventId: string,
  questions: RegistrationQuestion[],
  answers: Record<string, string>,
): Promise<RegisterResult> {
  const body = {
    answers: questions
      .filter((question) => (answers[question.id] ?? "").trim() !== "")
      .map((question) => ({
        questionId: Number(question.id),
        answer:
          question.type === "checkboxes"
            ? answers[question.id].split(CHOICE_SEPARATOR).filter(Boolean)
            : answers[question.id].trim(),
      })),
  };
  const result = await apiRequest(`/events/${eventId}/registrations`, { method: "POST", body });
  return result.ok ? { ok: true } : { ok: false, code: result.code };
}
