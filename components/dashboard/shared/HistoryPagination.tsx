"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export const HISTORY_PAGE_SIZE = 5;

type HistoryPaginationProps = { page: number; pageCount: number; onPageChange: (page: number) => void };

export function HistoryPagination({ page, pageCount, onPageChange }: HistoryPaginationProps) {
  const t = useTranslations("dashboard.pagination");
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={t("label")} className="mt-4 flex items-center justify-center gap-3">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label={t("previous")} className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40">
        <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
      </button>
      <span aria-live="polite" className="min-w-20 text-center text-xs text-muted">{t("pageOf", { page, pages: pageCount })}</span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} aria-label={t("next")} className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40">
        <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}
