"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Check, ChevronDown, PanelsTopLeft } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { dashboardWorkspacesFor, type AuthenticatedIdentity, type DashboardWorkspace } from "@/lib/auth/dashboard-route";
import { committeeTranslationKeys } from "./committee-config";

// Lets someone with several roles move between their dashboards. The list comes
// from /me, and every dashboard still checks access on its own.
export function WorkspaceSwitcher({ fallback = null, className = "" }: { fallback?: ReactNode; className?: string }) {
  const t = useTranslations("common.workspaces");
  const leadershipT = useTranslations("dashboard.leadershipDashboard");
  const leaderT = useTranslations("dashboard.leader");
  const pathname = usePathname();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<DashboardWorkspace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    let active = true;
    void apiRequest<AuthenticatedIdentity>("/me").then((result) => {
      if (active && result.ok) setWorkspaces(dashboardWorkspacesFor(result.data));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !switcherRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (workspaces.length < 2) return fallback;

  const label = (workspace: DashboardWorkspace) => {
    if (workspace.kind === "club") return leadershipT("groupTitle");
    if (workspace.kind === "developer") return leadershipT("developerTitle");
    if (workspace.kind === "committee") return leaderT(`nav.${committeeTranslationKeys[workspace.committee]}`);
    return t("memberDashboard");
  };
  const current = workspaces.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <div ref={switcherRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("label")}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-start text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-foreground/25 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
      >
        <PanelsTopLeft className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{current ? label(current) : t("label")}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("label")}
          className="absolute start-0 top-full z-50 mt-2 max-h-72 w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl"
        >
          {workspaces.map((workspace) => {
            const isCurrent = current?.path === workspace.path;
            return (
              <button
                key={workspace.path}
                type="button"
                role="menuitemradio"
                aria-checked={isCurrent}
                onClick={() => {
                  setIsOpen(false);
                  if (!isCurrent) router.push(workspace.path);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-blue ${
                  isCurrent
                    ? "bg-[var(--dashboard-red-bg)] font-semibold text-[var(--dashboard-red-text)]"
                    : "text-foreground/80 hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isCurrent ? "bg-[var(--dashboard-red-text)]/10" : "bg-surface-muted"
                }`}>
                  <PanelsTopLeft className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate">{label(workspace)}</span>
                {isCurrent && <Check className="size-4 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
