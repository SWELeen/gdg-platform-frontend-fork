"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function UpcomingEventsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("dashboard.upcomingEventsPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <section role="alert" className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        <h1 className="text-lg font-semibold text-foreground">{t("errorTitle")}</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{t("errorDescription")}</p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-5 rounded-full bg-gdg-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-gdg-blue/90"
        >
          {t("retry")}
        </button>
      </section>
    </div>
  );
}
