"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { MembersTasksBoard } from "@/components/dashboard/members/MembersTasksBoard";
import { dashboardTasks } from "@/components/dashboard/mock-data";

export function MembersTasksPage(): ReactElement {
  const t = useTranslations("dashboard.tasks");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t("title")}</h1>
      <MembersTasksBoard tasks={dashboardTasks} />
    </div>
  );
}
