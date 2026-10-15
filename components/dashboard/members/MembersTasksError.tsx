"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";

import { PillAction } from "@/components/announcements/PillAction";

export function MembersTasksError({ onRetry }: { onRetry: () => void }): ReactElement {
  const t = useTranslations("dashboard.tasks.error");

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center sm:px-10 sm:py-16"
    >
      <TriangleAlert aria-hidden="true" className="size-8 text-gdg-red" strokeWidth={1.75} />
      <h2 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">{t("title")}</h2>
      <p className="mt-2 max-w-[440px] text-sm text-muted">{t("description")}</p>
      <div className="mt-6">
        <PillAction onClick={onRetry}>{t("retry")}</PillAction>
      </div>
    </div>
  );
}
