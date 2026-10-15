// Client component: loading.tsx gets no route params, so translating on the
// server here would make next-intl read request headers and turn the route dynamic.
"use client";

import { MembersTasksLoading } from "@/components/dashboard/members/MembersTasksLoading";

export default function Loading() {
  return <MembersTasksLoading />;
}
