"use client";

import { useEffect } from "react";
import { MembersTasksError } from "@/components/dashboard/members/MembersTasksError";

export default function TasksError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <MembersTasksError onRetry={retry} />;
}
