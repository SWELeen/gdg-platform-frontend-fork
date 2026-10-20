import type {
  CommitteeEvent,
  EventRegistration,
  RegistrationConfirmationStatus,
  RegistrationStatus,
} from "@/components/dashboard/shared/types";
import { apiRequest } from "@/lib/api/client";
import { fetchPublishedEvents, toPlatformEvent } from "@/lib/events/api";

// Backend shape of GET /events/:eventId/registrations items.
type ApiRegistrant = {
  registrationId: number;
  name: string;
  email: string | null;
  status: string;
  registeredAt: string;
  waitlistPosition: number | null;
  checkedInAt: string | null;
  answers: { questionId: number; question: string; answer: string }[];
};

type RegistrantsPage = { items: ApiRegistrant[]; pagination: { totalPages: number } };

// The dashboard models review (status) and the member's reply
// (confirmationStatus) separately; the backend keeps one status.
function toDashboardStatus(status: string): {
  status: RegistrationStatus;
  confirmationStatus?: RegistrationConfirmationStatus;
} {
  switch (status) {
    case "PENDING":
      return { status: "Pending" };
    case "WAITLISTED":
      return { status: "Waitlisted" };
    case "AWAITING_CONFIRMATION":
      return { status: "Accepted", confirmationStatus: "Pending" };
    case "CONFIRMED":
    case "NO_CHECK_IN":
      return { status: "Accepted", confirmationStatus: "Confirmed" };
    case "EXPIRED":
      return { status: "Accepted", confirmationStatus: "Expired" };
    case "DECLINED":
    case "CANCELLED":
    case "LATE_CANCELLATION":
      return { status: "Accepted", confirmationStatus: "Declined" };
    default:
      return { status: "Rejected" };
  }
}

function toEventRegistration(eventId: string, item: ApiRegistrant): EventRegistration {
  return {
    id: String(item.registrationId),
    eventId,
    applicantName: item.name,
    email: item.email ?? "",
    registeredAt: item.registeredAt,
    ...toDashboardStatus(item.status),
    checkInStatus: item.checkedInAt ? "CheckedIn" : item.status === "NO_CHECK_IN" ? "NoShow" : "NotCheckedIn",
    checkedInAt: item.checkedInAt ?? undefined,
    waitlistPosition: item.waitlistPosition ?? undefined,
    profile: {},
    answers: item.answers.map((answer) => ({
      questionId: String(answer.questionId),
      question: answer.question,
      answer: answer.answer,
    })),
  };
}

export async function fetchPrEvents(): Promise<CommitteeEvent[]> {
  const now = Date.now();
  return (await fetchPublishedEvents()).map((event) => ({
    ...toPlatformEvent(event),
    status: new Date(event.endsAt).getTime() < now ? "Completed" : "Upcoming",
    created: "",
    updated: "",
  }));
}

/** Every registrant of one event, read page by page. */
export async function fetchRegistrants(eventId: string): Promise<EventRegistration[]> {
  const all: EventRegistration[] = [];
  for (let page = 1; ; page += 1) {
    const result = await apiRequest<RegistrantsPage>(`/events/${eventId}/registrations?page=${page}&pageSize=100`);
    if (!result.ok) break;
    all.push(...result.data.items.map((item) => toEventRegistration(eventId, item)));
    if (page >= result.data.pagination.totalPages) break;
  }
  return all;
}

/**
 * Applies a PR decision. Waitlisting appends the person to the end of the
 * event's ordered waitlist (the backend takes the whole list at once).
 */
export async function applyDecision(
  registration: EventRegistration,
  status: RegistrationStatus,
  eventRegistrations: EventRegistration[],
): Promise<string | null> {
  if (status === "Waitlisted") {
    const waitlist = eventRegistrations
      .filter((item) => item.status === "Waitlisted" && item.id !== registration.id)
      .sort((a, b) => (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0))
      .map((item) => Number(item.id));
    const result = await apiRequest(`/events/${registration.eventId}/waitlist`, {
      method: "PUT",
      body: { registrationIds: [...waitlist, Number(registration.id)] },
    });
    return result.ok ? null : result.message;
  }
  if (status !== "Accepted" && status !== "Rejected") return null;
  const result = await apiRequest(`/registrations/${registration.id}`, {
    method: "PATCH",
    body: { status: status === "Accepted" ? "ACCEPTED" : "REJECTED" },
  });
  return result.ok ? null : result.message;
}
