"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { PanelLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

// Presentational building blocks shared by the member and leader dashboards: a collapsible
// desktop sidebar (full width <-> icon rail), an animated mobile drawer and nav links with an
// animated hover/active pill. Routing, data and permissions stay in the callers.

const STORAGE_KEY = "gdg-dashboard-sidebar-collapsed";
const listeners = new Set<() => void>();
let collapsedValue: boolean | null = null;

function readCollapsed(): boolean {
  if (collapsedValue === null) {
    try {
      collapsedValue = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      collapsedValue = false;
    }
  }
  return collapsedValue;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    collapsedValue = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function toggleCollapsed(): void {
  collapsedValue = !readCollapsed();
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsedValue ? "1" : "0");
  } catch {
    // Private mode: the in-memory value still applies for this session.
  }
  listeners.forEach((listener) => listener());
}

export function useSidebarCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  return [collapsed, toggleCollapsed];
}

// The mobile drawer always renders the full (expanded) nav, so it overrides this to false.
const SidebarCollapsedContext = createContext(false);

export function SidebarCollapseToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("dashboard.nav");
  const [collapsed, toggle] = useSidebarCollapsed();
  const label = collapsed ? t("expandSidebar") : t("collapseSidebar");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-expanded={!collapsed}
      className={`inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground/70 transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-gdg-blue ${className}`}
    >
      <PanelLeft className="size-5 rtl:-scale-x-100" />
    </button>
  );
}

export function DashboardSidebarAside({ children, label }: { children: ReactNode; label?: string }) {
  const [collapsed] = useSidebarCollapsed();

  return (
    <aside
      aria-label={label}
      data-collapsed={collapsed}
      className={`group/sidebar hidden shrink-0 self-stretch data-[collapsed=true]:overflow-x-hidden border-e border-border bg-surface transition-[width] duration-200 ease-linear lg:block ${
        collapsed ? "lg:w-[4.5rem]" : "lg:w-60 xl:w-64"
      }`}
    >
      <SidebarCollapsedContext.Provider value={collapsed}>
        <LayoutGroup id="dashboard-sidebar-desktop">{children}</LayoutGroup>
      </SidebarCollapsedContext.Provider>
    </aside>
  );
}

export function DashboardMobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}) {
  const isRtl = useLocale().startsWith("ar");
  const offscreen = isRtl ? "100%" : "-100%";

  useEffect(() => {
    if (!open || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="relative z-10 h-full w-[min(18rem,88vw)] overflow-y-auto border-e border-border bg-surface shadow-2xl"
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <SidebarCollapsedContext.Provider value={false}>
              <LayoutGroup id="dashboard-sidebar-mobile">{children}</LayoutGroup>
            </SidebarCollapsedContext.Provider>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SidebarSectionLabel({ children }: { children: ReactNode }) {
  const collapsed = useContext(SidebarCollapsedContext);

  if (collapsed) return <div className="mx-3 mb-2 border-t border-border" aria-hidden="true" />;
  return (
    <span className="block px-3 text-[11px] font-bold uppercase tracking-wider text-muted">{children}</span>
  );
}

type IconType = ComponentType<{ className?: string }>;

export function SidebarNavLink({
  href,
  label,
  Icon,
  active = false,
  muted = false,
  onClick,
}: {
  href: string;
  label: string;
  Icon: IconType;
  active?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  const collapsed = useContext(SidebarCollapsedContext);
  const [hovered, setHovered] = useState(false);

  const className = `group relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-gdg-blue ${
    collapsed ? "justify-center px-0" : "px-3"
  } ${
    active
      ? "font-semibold text-[var(--dashboard-red-text)]"
      : muted
        ? "text-muted hover:text-foreground"
        : "text-foreground/70 hover:text-foreground"
  }`;

  const content = (
    <>
      <AnimatePresence>
        {hovered && !active && (
          <motion.span
            aria-hidden="true"
            layoutId="dashboard-nav-hover"
            className="absolute inset-0 rounded-lg bg-foreground/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
      </AnimatePresence>
      {active && (
        <>
          <motion.span
            aria-hidden="true"
            layoutId="dashboard-nav-active"
            className="absolute inset-0 rounded-lg bg-[var(--dashboard-red-bg)]"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          <motion.span
            aria-hidden="true"
            layoutId="dashboard-nav-indicator"
            className="absolute inset-y-2 start-0 w-1 rounded-full bg-gdg-red"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        </>
      )}
      <Icon className="relative size-[1.125rem] shrink-0" />
      <span className={collapsed ? "sr-only" : "relative truncate whitespace-nowrap"}>{label}</span>
    </>
  );

  const shared = {
    className,
    title: collapsed ? label : undefined,
    "aria-current": active ? ("page" as const) : undefined,
    onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };

  // Internal routes use the locale-aware Link; "#" placeholders stay native anchors.
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...shared}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} {...shared}>
      {content}
    </a>
  );
}
