import { userRegistrationsMock } from "@/data/user-registrations";
import { API_ENABLED, apiRequest } from "@/lib/api/client";
import type { UserRegistration, UserRegistrationStatus, UserRegistrationsResult } from "./types";

// Backend shape of GET /my/registrations items.
type ApiMyRegistration = {
  registrationId: number;
  status: string;
  confirmationDeadline: string | null;
  confirmedAt: string | null;
  checkedInAt: string | null;
  waitlistPosition: number | null;
  attendanceQrCodeDataUrl: string | null;
  event: { name: string; startsAt: string; location: string | null };
};

// The page has fewer states than the backend: a refused or unselected
// application reads as declined, and any withdrawal as cancelled.
const STATUS: Record<string, UserRegistrationStatus> = {
  PENDING: "pending",
  WAITLISTED: "waitlisted",
  AWAITING_CONFIRMATION: "need-confirmation",
  EXPIRED: "need-confirmation",
  CONFIRMED: "approved",
  REJECTED: "declined",
  NOT_SELECTED: "declined",
  DECLINED: "cancelled",
  CANCELLED: "cancelled",
  LATE_CANCELLATION: "cancelled",
  NO_CHECK_IN: "not-attended",
  EXCUSED: "not-attended",
};

function toUserRegistration(item: ApiMyRegistration): UserRegistration {
  return {
    id: String(item.registrationId),
    kind: "event",
    title: item.event.name,
    startsAt: item.event.startsAt,
    location: item.event.location ?? "",
    status: STATUS[item.status] ?? "pending",
    confirmationDeadline: item.confirmationDeadline ?? undefined,
    attendanceConfirmationStatus:
      item.status === "CONFIRMED"
        ? "confirmed"
        : item.status === "AWAITING_CONFIRMATION"
          ? "awaiting"
          : item.status === "EXPIRED"
            ? "expired"
            : item.status === "DECLINED"
              ? "declined"
              : undefined,
    attendanceConfirmedAt: item.confirmedAt ?? undefined,
    attendanceQrCodeDataUrl: item.attendanceQrCodeDataUrl ?? undefined,
    checkInStatus:
      item.status === "CONFIRMED" ? (item.checkedInAt ? "checked-in" : "not-checked-in") : item.status === "NO_CHECK_IN" ? "no-show" : undefined,
    checkedInAt: item.checkedInAt ?? undefined,
    waitlistPosition: item.waitlistPosition ?? undefined,
  };
}

/** The signed-in member's registrations: the backend with NEXT_PUBLIC_USE_API=true, demo data otherwise. */
export async function getCurrentUserRegistrations(): Promise<UserRegistrationsResult> {
  if (!API_ENABLED) return { state: "ready", registrations: userRegistrationsMock };
  const result = await apiRequest<ApiMyRegistration[]>("/my/registrations");
  if (result.ok) return { state: "ready", registrations: result.data.map(toUserRegistration) };
  return { state: result.status === 401 ? "signed-out" : "error" };
}

export type MyRegistrationAction = "confirm" | "decline";

/** Confirms or declines the member's seat through the backend. */
export async function respondToRegistration(registrationId: string, action: MyRegistrationAction) {
  const result = await apiRequest(`/registrations/${registrationId}/${action}`, { method: "POST" });
  return result.ok
    ? ({ ok: true } as const)
    : ({ ok: false, code: result.code, message: result.message } as const);
}
