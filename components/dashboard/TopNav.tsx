"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Link } from "@/i18n/navigation";
import { useHomeSectionHref } from "@/components/layout/useHomeSectionHref";

const navItems = [
  { key: "home", hash: "#home" },
  { key: "about", hash: "#about" },
  { key: "projects", hash: "#projects" },
  { key: "events", hash: "#events" },
  { key: "community", hash: "#committees" },
] as const;

const linkUnderline =
  "mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full";

type IconProps = { className?: string };

function IconMenu({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function TopNav() {
  const t = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionHref = useHomeSectionHref();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-surface text-foreground">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href={sectionHref("#home")} aria-label={t("logoAlt")}>
          <Image
            src="/images/black-logo-with-colors.png"
            alt={t("logoAlt")}
            width={1421}
            height={165}
            priority
            unoptimized
            className="topnav-logo-light h-9 w-auto min-w-0 max-w-full object-contain object-left sm:h-10 lg:h-12 rtl:object-right -translate-x-3"
          />
          <Image
            src="/images/gdg-white-Logo.png"
            alt={t("logoAlt")}
            width={3612}
            height={347}
            priority
            className="topnav-logo-dark h-10 w-auto min-w-0 max-w-full object-contain object-left sm:h-11 lg:h-12 rtl:object-right"
          />
        </a>

        <div className="flex shrink-0 items-center gap-3 lg:gap-6">
          <nav aria-label={t("topNav.navLabel")} className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            {navItems.map(({ key, hash }) => (
              <a
                key={key}
                href={sectionHref(hash)}
                className="group flex flex-col items-center text-foreground/80 transition-colors hover:text-foreground"
              >
                {t(`nav.${key}`)}
                <span className={linkUnderline} />
              </a>
            ))}
            <Link
              href="/announcements"
              className="group flex flex-col items-center text-foreground/80 transition-colors hover:text-foreground"
            >
              {t("nav.announcements")}
              <span className={linkUnderline} />
            </Link>
          </nav>

          <ThemeToggle />

          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="dashboard-mobile-nav"
            aria-label={t("topNav.toggleMenu")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/90 hover:bg-foreground/10 lg:hidden"
          >
            <IconMenu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.nav
            id="dashboard-mobile-nav"
            aria-label={t("topNav.navLabel")}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-surface lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3 text-sm font-semibold sm:px-6">
              {navItems.map(({ key, hash }) => (
                <a
                  key={key}
                  href={sectionHref(hash)}
                  onClick={() => setMobileOpen(false)}
                  className="group flex flex-col px-2 py-2 text-foreground/80 transition-colors hover:text-foreground"
                >
                  {t(`nav.${key}`)}
                  <span className={linkUnderline} />
                </a>
              ))}
              <Link
                href="/announcements"
                onClick={() => setMobileOpen(false)}
                className="group flex flex-col px-2 py-2 text-foreground/80 transition-colors hover:text-foreground"
              >
                {t("nav.announcements")}
                <span className={linkUnderline} />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
