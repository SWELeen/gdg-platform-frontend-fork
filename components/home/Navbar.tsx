"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoMenu } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTextDirection } from "@/i18n/useTextDirection";
import ThemeToggle from "@/components/ui/ThemeToggle"; 
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useHomeSectionHref } from "@/components/layout/useHomeSectionHref";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { API_ENABLED, apiRequest, logoutSession } from "@/lib/api/client";

// Locale-aware Link with the same hover motion as the hash links.
const MotionLink = motion.create(Link);

function ProfileAccountMenu({
  name,
  onSignOut,
  variant,
}: {
  name: string;
  onSignOut: () => void;
  variant: "desktop" | "mobile";
}) {
  const t = useTranslations("common.nav");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className={`relative ${variant === "mobile" ? "w-full" : ""}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center gap-2 font-medium ${variant === "mobile" ? "w-full text-sm" : "text-sm"}`}
      >
        <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{name}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute top-full z-[220] mt-3 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1.5 text-foreground shadow-xl ${variant === "mobile" ? "start-0" : "end-0"}`}
        >
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm text-gdg-red hover:bg-surface-muted"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t("signOut")}
          </button>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-surface-muted"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t("profile")}
          </Link>
        </div>
      )}
    </div>
  );
}

type NavbarProps = {
  // "overlay" sits on the homepage video hero; "light" is for pages with a white
  // background (e.g. Announcements), where white text and the white logo would vanish.
  variant?: "overlay" | "light";
};

export default function Navbar({ variant = "overlay" }: NavbarProps = {}) {
  const t = useTranslations("common.nav");
  const tCommon = useTranslations("common");
  const dir = useTextDirection();
  const [isOpen, setIsOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const sectionHref = useHomeSectionHref();
  const isAnnouncementsActive =
    pathname === "/announcements" || pathname.startsWith("/announcements/");

  useEffect(() => {
    if (!API_ENABLED) return;
    let active = true;
    void apiRequest<{ fullName: string }>("/me").then((result) => {
      if (active && result.ok) setProfileName(result.data.fullName);
    });
    return () => { active = false; };
  }, []);

  const profileHref = profileName || !API_ENABLED ? "/profile" : "/login?returnTo=%2Fprofile";

  const handleSignOut = async () => {
    await logoutSession();
    setProfileName(null);
    setIsOpen(false);
    router.replace("/login");
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
    },
    open: {
      opacity: 1,
      y: 0,
    },
  };

  // Floating frosted-glass pill (Apple-style), centred with equal insets + auto margins
  // (left-1/2 + translate would squeeze a fit-content fixed box to half the screen).
  // --home-nav-height (globals.css) is the space it takes at the top; sticky sections offset by it.
  return (
    <nav
      className={`fixed inset-x-4 top-4 z-[200] mx-auto flex h-14 items-center justify-between gap-8 rounded-full border ps-5 pe-3 shadow-lg backdrop-blur-xl backdrop-saturate-150 lg:w-fit lg:gap-10 lg:ps-12 lg:pe-8 ${
        variant === "light"
          ? "border-border bg-surface/85 text-foreground shadow-black/5"
          : "border-white/15 bg-gdg-dark/20 text-[var(--white)] shadow-black/20"
      }`}
    >
      <div>
        {variant === "light" ? (
          <Image
            src="/images/black-logo-with-colors.png"
            alt={tCommon("logoAlt")}
            width={1421}
            height={165}
            priority
            unoptimized
            className="h-9 w-auto sm:h-10 lg:h-12 -translate-x-3"
          />
        ) : (
          <img
            src="/images/gdg-white-logo.png"
            alt={tCommon("logoAlt")}
            className="h-14 w-auto"
          />
        )}
      </div>

      <div className="hidden items-center gap-5 whitespace-nowrap lg:flex xl:gap-8">
        <motion.a
          href={sectionHref("#home")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("home")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <motion.a
          href={sectionHref("#about")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("about")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <motion.a
          href={sectionHref("#projects")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("projects")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <motion.a
          href={sectionHref("#events")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("events")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>

        <MotionLink
          href={sectionHref("#announcements")}
          // aria-current={isAnnouncementsActive ? "page" : undefined}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("announcements")}</span>

          {/* Stays underlined while on an Announcements page. */}
          <span className={`mt-1 h-[2px] rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full ${isAnnouncementsActive ? "w-full" : "w-0"}`} />
        </MotionLink>

        <motion.a
          href={sectionHref("#committees")}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col items-center text-md font-medium leading-none"
        >
          <span dir={dir}>{t("community")}</span>

          <span className="mt-1 h-[2px] w-0 rounded-full bg-[image:var(--google-gradient)] transition-all duration-300 group-hover:w-full" />
        </motion.a>
        <ThemeToggle />
        {profileName ? (
          <ProfileAccountMenu name={profileName} onSignOut={handleSignOut} variant="desktop" />
        ) : (
          <MotionLink
            href={profileHref}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            <span>{t("profile")}</span>
          </MotionLink>
        )}
        <LanguageSwitcher />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-50 text-3xl lg:hidden ${variant === "light" ? "text-foreground" : "text-[var(--white)]"}`}
        aria-label={isOpen ? tCommon("menu.close") : tCommon("menu.open")}
        aria-expanded={isOpen}
      >
        {isOpen ? <IoIosClose /> : <IoMenu />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute end-0 top-full z-40 mt-2 flex w-56 flex-col gap-5 rounded-2xl bg-surface px-6 py-6 text-foreground shadow-lg backdrop-blur-md lg:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#home")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("home")}</span>
            </motion.a>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#about")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("about")}</span>
            </motion.a>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#projects")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("projects")}</span>
            </motion.a>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#events")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("events")}</span>
            </motion.a>

            <MotionLink
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href="/announcements"
              aria-current={isAnnouncementsActive ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium leading-none hover:underline ${isAnnouncementsActive ? "underline" : ""}`}
            >
              <span dir={dir}>{t("announcements")}</span>
            </MotionLink>

            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href={sectionHref("#committees")}
              className="text-sm font-medium leading-none hover:underline"
            >
              <span dir={dir}>{t("community")}</span>
            </motion.a>

            {profileName ? (
              <motion.div variants={itemVariants} className="w-full">
                <ProfileAccountMenu name={profileName} onSignOut={handleSignOut} variant="mobile" />
              </motion.div>
            ) : (
              <MotionLink
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                href={profileHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-sm font-medium leading-none hover:underline"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                <span>{t("profile")}</span>
              </MotionLink>
            )}

            <LanguageSwitcher className="mt-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
