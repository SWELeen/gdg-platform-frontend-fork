import { apiRequest } from "@/lib/api/client";

export type DataEventReportGroup = "all" | "going" | "checked-in";

export type DataEventReportEvent = {
  eventId: number;
  name: string;
  startsAt: string;
  status: string;
  registered: number;
  going: number;
  checkedIn: number;
};

export type DataEventReportRow = {
  name: string;
  email: string | null;
  status: string;
  registeredAt: string;
  checkedInAt: string | null;
  discoverySource: "WHATSAPP" | "X" | "LINKEDIN" | "ME_QR" | "LUMA_FEED" | "GOOGLE" | "INSTAGRAM" | "TECH" | null;
};

export type DataEventReport = {
  event: { eventId: number; name: string };
  group: DataEventReportGroup;
  items: DataEventReportRow[];
};

export function fetchDataEventReportEvents() {
  return apiRequest<DataEventReportEvent[]>("/data/event-reports/events");
}

export function fetchDataEventReport(eventId: number, group: DataEventReportGroup) {
  return apiRequest<DataEventReport>(
    `/data/event-reports/events/${eventId}?group=${encodeURIComponent(group)}`,
  );
}