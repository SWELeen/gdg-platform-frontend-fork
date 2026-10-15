"use client";

import { useParams } from "next/navigation";
import { EventDetails } from "@/components/dashboard/data-analysis/EventDetails";

export default function LeaderEventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  return <EventDetails eventId={params.eventId} />;
}
