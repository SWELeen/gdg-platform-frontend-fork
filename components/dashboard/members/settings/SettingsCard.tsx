import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Card shell shared by the Member Settings sections (matches the dashboard's card style). */
export function SettingsCard({
  id,
  icon: Icon,
  iconClassName,
  title,
  description,
  aside,
  children,
}: {
  id: string;
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-2xl border border-border bg-surface p-5 shadow-2xs sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-base font-bold text-foreground">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          </div>
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Accessible on/off switch (role="switch"); the visible label and description name it. */
export function Switch({
  checked,
  disabled,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-gdg-blue" : "bg-border"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5.5 rtl:-translate-x-5.5" : "translate-x-0.5 rtl:-translate-x-0.5"
        }`}
      />
    </button>
  );
}
