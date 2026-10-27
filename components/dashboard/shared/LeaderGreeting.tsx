"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";

const subscribeToNothing = () => () => {};

export function LeaderGreeting() {
  const locale = useLocale();
  const t = useTranslations("dashboard.leader");
  const dateString = useSyncExternalStore(
    subscribeToNothing,
    () => new Date().toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      numberingSystem: "latn",
    }),
    () => t("greeting.dateFallback"),
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("greeting.title")}
        </h2>
      </div>
      <div className="shrink-0 text-xs font-medium text-muted sm:text-end">
        {dateString}
      </div>
    </div>
  );
}
