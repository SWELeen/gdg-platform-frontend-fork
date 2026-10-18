"use client";

import { useParams } from "next/navigation";
import { EventReportsPanel } from "@/components/dashboard/data-analysis/EventReportsPanel";

export default function LeaderEventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  return <EventReportsPanel eventId={params.eventId} />;
}
