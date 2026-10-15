"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

const COLUMN_CARDS = [2, 1, 1];

export function MembersTasksLoading(): ReactElement {
  const t = useTranslations("dashboard.tasks.board");

  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="h-8 w-40 animate-pulse rounded-lg bg-surface-muted sm:h-9" />
      <div aria-hidden="true" className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {COLUMN_CARDS.map((cards, column) => (
          <div
            key={column}
            className="rounded-2xl border border-border bg-surface-muted/30 p-4"
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
              <div className="size-5 animate-pulse rounded-full bg-surface-muted" />
            </div>
            <div className="mt-3 space-y-3">
              {Array.from({ length: cards }, (_, card) => (
                <div
                  key={card}
                  className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-2xs"
                >
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
