import { Bell, Info, SearchX, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PillAction } from "./PillAction";

// Same LinkedIn page the site footer links to.
const LINKEDIN_URL = "https://www.linkedin.com/company/google-developer-student-club-uj/";

type StatusStateProps = {
  icon: LucideIcon;
  tone?: "info" | "error";
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  hint?: ReactNode;
  role?: "status" | "alert";
};

// Shared shell for the empty, no-results and error states (approved empty-state layout).
export function StatusState({
  icon: Icon,
  tone = "info",
  title,
  description,
  actions,
  hint,
  role,
}: StatusStateProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center rounded-card border-2 border-dashed border-border bg-surface-muted/50 px-5 py-12 text-center sm:px-10 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-border bg-surface"
      >
        <Icon className={`h-8 w-8 ${tone === "error" ? "text-gdg-red" : "text-gdg-blue"}`} strokeWidth={1.75} />
        <span className="absolute start-2.5 top-3 h-2 w-2 rounded-full bg-gdg-red" />
        <span className="absolute end-2.5 top-4 h-1.5 w-1.5 rounded-full bg-gdg-yellow" />
        <span className="absolute end-2 bottom-3.5 h-2 w-2 rounded-full bg-gdg-blue" />
        <span className="absolute start-3.5 bottom-3 h-1.5 w-1.5 rounded-full bg-gdg-green" />
      </div>

      <h2 className="mt-6 text-2xl font-bold leading-snug text-foreground sm:text-3xl">{title}</h2>

      <p className="mt-3 max-w-[440px] text-sm text-gray-500 sm:text-base">{description}</p>

      {actions && <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>}

      {hint && (
        <p className="mt-6 inline-flex items-start gap-2 text-xs text-gray-400">
          <Info aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
}

const strong = (chunks: ReactNode) => <strong className="font-semibold text-foreground">{chunks}</strong>;

// Nothing published (overall, or in the selected category).
export function AnnouncementsEmptyState({
  categoryLabel,
  onBrowseAll,
}: {
  categoryLabel?: string;
  onBrowseAll?: () => void;
}) {
  const t = useTranslations("announcements.empty");

  return (
    <StatusState
      icon={Bell}
      role="status"
      title={t("title")}
      description={
        categoryLabel ? t.rich("inCategory", { category: categoryLabel, strong }) : t("all")
      }
      actions={categoryLabel || onBrowseAll ? (
        <>
          {onBrowseAll && <PillAction onClick={onBrowseAll}>{t("browseAll")}</PillAction>}
          <PillAction href="/#events" variant="light">
            {t("goToEvents")}
          </PillAction>
        </>
      ) : undefined}
      hint={categoryLabel ? t.rich("hint", {
        link: (chunks) => (
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gdg-blue underline-offset-2 hover:underline"
          >
            {chunks}
          </a>
        ),
      }) : undefined}
    />
  );
}

// Search (optionally combined with a category) matched nothing.
export function AnnouncementsNoResults({
  query,
  onClearSearch,
  onBrowseAll,
}: {
  query: string;
  onClearSearch: () => void;
  onBrowseAll: () => void;
}) {
  const t = useTranslations("announcements.noResults");
  const tEmpty = useTranslations("announcements.empty");

  return (
    <StatusState
      icon={SearchX}
      role="status"
      title={t("title")}
      description={t.rich("description", { query, strong })}
      actions={
        <>
          <PillAction onClick={onClearSearch}>{t("clearSearch")}</PillAction>
          <PillAction onClick={onBrowseAll} variant="light">
            {tEmpty("browseAll")}
          </PillAction>
        </>
      }
    />
  );
}

export function AnnouncementsErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("announcements.error");

  return (
    <StatusState
      icon={TriangleAlert}
      tone="error"
      role="alert"
      title={t("title")}
      description={t("description")}
      actions={
        <>
          <PillAction onClick={onRetry}>{t("retry")}</PillAction>
          <PillAction href="/announcements" variant="light">
            {t("browseAll")}
          </PillAction>
        </>
      }
    />
  );
}
