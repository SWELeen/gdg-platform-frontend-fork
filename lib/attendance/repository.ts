import { API_ENABLED, apiRequest } from "@/lib/api/client";

export type AttendanceCheckInResult = {
  state: "checked-in" | "already-checked-in" | "invalid-qr" | "check-in-closed" | "error" | "service-unavailable";
  checkedInAt?: string;
  name?: string;
};

/**
 * Sends the scanned token to the backend, which does every check (right event,
 * confirmed, not used, inside the check-in window). Demo mode records nothing.
 */
export async function checkInAttendance(input: {
  eventId: string;
  token: string;
}): Promise<AttendanceCheckInResult> {
  if (!API_ENABLED) return { state: "service-unavailable" };
  const result = await apiRequest<{ name: string; checkedInAt: string }>(`/events/${input.eventId}/check-in`, {
    method: "POST",
    body: { token: input.token },
  });
  if (result.ok) return { state: "checked-in", ...result.data };
  if (result.code === "ALREADY_CHECKED_IN") return { state: "already-checked-in" };
  if (result.code === "INVALID_QR_CODE") return { state: "invalid-qr" };
  if (result.code === "CHECK_IN_CLOSED") return { state: "check-in-closed" };
  return { state: "error" };
}
