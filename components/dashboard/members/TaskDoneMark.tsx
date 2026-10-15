"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { toneText } from "@/components/dashboard/members/task-styles";

export function TaskDoneMark(): ReactElement {
  const t = useTranslations("dashboard.tasks");

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold ${toneText.green}`}>
      <Check aria-hidden="true" className="size-3.5" />
      {t("done")}
    </span>
  );
}
