import type { UserRegistration } from "./types";

// Which self-service actions a member may take on their own registration.
// Frontend guidance only — the registrations API must enforce the same rules.

export interface RegistrationAvailability {
  /** The event or trip has already started. */
  hasStarted: boolean;
  /** Accepted, but the confirmation deadline has passed without confirmation. */
  confirmationExpired: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  /** Accepted and attendance confirmed: the attendance ticket applies. */
  hasTicket: boolean;
}

const toTime = (value?: string) => (value ? new Date(value).getTime() : Number.NaN);

export function getRegistrationAvailability(registration: UserRegistration, now: number): RegistrationAvailability {
  const hasStarted = toTime(registration.startsAt) <= now;
  const deadline = toTime(registration.confirmationDeadline);
  const awaitingConfirmation =
    registration.status === "need-confirmation" && registration.attendanceConfirmationStatus !== "confirmed";
  const confirmationExpired = awaitingConfirmation && !Number.isNaN(deadline) && deadline < now;

  return {
    hasStarted,
    confirmationExpired,
    canConfirm: awaitingConfirmation && !confirmationExpired && !hasStarted,
    // Same rules as the backend: leave the waiting list, decline an open offer
    // (before its deadline), or cancel a confirmed seat not yet used — never after
    // the event starts. An application still under review cannot be withdrawn.
    canCancel:
      !hasStarted &&
      (registration.status === "waitlisted" ||
        (registration.status === "approved" && registration.checkInStatus !== "checked-in") ||
        (registration.status === "need-confirmation" && !confirmationExpired)),
    hasTicket: registration.status === "approved" && registration.attendanceConfirmationStatus === "confirmed",
  };
}

/** Registrations that still put an event on the member's schedule. */
export function isScheduledRegistration(registration: UserRegistration): boolean {
  return registration.status !== "declined" && registration.status !== "cancelled";
}
