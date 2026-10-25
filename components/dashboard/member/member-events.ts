import type { UserRegistration } from "@/lib/user-registrations/types";

/** Member "My Events" route. Task 4 (sidebar navigation) links its Events item here. */
export const MEMBER_EVENTS_PATH = "/registrations";

/** Published platform events coming up (not limited to the member's registrations). */
export const UPCOMING_EVENTS_PATH = "/dashboard/members-dashboard/upcoming-events";

// Date-tile backgrounds reuse the Member Dashboard's "My Events" tile colors.
export const memberEventAccents = [
  "bg-gdg-blue-light text-gdg-dark",
  "bg-gdg-green-light text-gdg-dark",
  "bg-gdg-pink-light text-gdg-dark",
  "bg-gdg-yellow-light text-gdg-dark",
] as const;

/**
 * The registrations featured on the dashboard: upcoming ones soonest first, then
 * the most recent past ones, without repeats and never more than `limit`.
 */
export function selectDashboardRegistrations(
  registrations: UserRegistration[],
  now: number,
  limit = 4,
): UserRegistration[] {
  const unique = registrations.filter(
    (registration, index) => registrations.findIndex((item) => item.id === registration.id) === index,
  );
  const time = (registration: UserRegistration) => new Date(registration.startsAt).getTime();
  const upcoming = unique.filter((registration) => time(registration) >= now).sort((a, b) => time(a) - time(b));
  const past = unique.filter((registration) => time(registration) < now).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...past].slice(0, limit);
}
