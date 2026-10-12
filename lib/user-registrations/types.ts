export type UserRegistrationKind = "event" | "trip";

export type UserRegistrationStatus =
  | "pending"
  | "need-confirmation"
  | "approved"
  | "declined"
  | "attended"
  | "not-attended"
  /** The member withdrew their own registration. */
  | "cancelled";

export type UserAttendanceConfirmationStatus =
  | "awaiting"
  | "confirmed"
  | "declined"
  | "expired";

export type UserCheckInStatus = "not-checked-in" | "checked-in" | "no-show";

/** UI-facing view model; the backend supplies a QR image without exposing its token. */
export interface UserRegistration {
  id: string;
  kind: UserRegistrationKind;
  title: string;
  startsAt: string;
  location: string;
  status: UserRegistrationStatus;
  confirmationDeadline?: string;
  attendanceConfirmationStatus?: UserAttendanceConfirmationStatus;
  attendanceConfirmedAt?: string;
  attendanceQrCodeDataUrl?: string;
  checkInStatus?: UserCheckInStatus;
  checkedInAt?: string;
}

export type UserRegistrationsResult =
  | { state: "ready"; registrations: UserRegistration[] }
  | { state: "not-configured" };
