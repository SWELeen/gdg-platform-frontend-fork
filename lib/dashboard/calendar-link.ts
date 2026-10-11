// Builds a Google Calendar "add event" link entirely on the client; no calendar API
// or account integration is involved — the member finishes the action in Google.

const toCalendarStamp = (value: string) =>
  new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export function buildGoogleCalendarUrl(event: {
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
}): string | null {
  if (Number.isNaN(new Date(event.startsAt).getTime()) || Number.isNaN(new Date(event.endsAt).getTime())) {
    return null;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarStamp(event.startsAt)}/${toCalendarStamp(event.endsAt)}`,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
